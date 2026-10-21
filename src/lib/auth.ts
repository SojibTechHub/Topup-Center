import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/crypto";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            image: true,
            role: true,
            status: true,
            passwordHash: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status === "BANNED") {
          throw new Error("BANNED");
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        // 2FA check for admins is done in the login flow
        // TOTP verification is handled in the server action

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            status: true,
            walletBalancePoisha: true,
            twoFactorEnabled: true,
          },
        });

        session.user.id = user.id;
        session.user.role = dbUser?.role || "CUSTOMER";
        session.user.status = dbUser?.status || "ACTIVE";
        session.user.walletBalancePoisha = dbUser?.walletBalancePoisha
          ? Number(dbUser.walletBalancePoisha)
          : 0;
        session.user.twoFactorEnabled = dbUser?.twoFactorEnabled || false;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Block banned users
      if (account?.provider !== "credentials") {
        const dbUser = await db.user.findUnique({
          where: { id: user.id! },
          select: { status: true },
        });
        if (dbUser?.status === "BANNED") return false;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // Send verification email for new users
      if (user.email) {
        // Queue email verification job
        await db.job.create({
          data: {
            type: "SEND_EMAIL",
            payload: {
              template: "VERIFY_EMAIL",
              userId: user.id,
              email: user.email,
            },
          },
        });
      }
    },
  },
  trustHost: env.AUTH_TRUST_HOST,
  secret: env.AUTH_SECRET,
});

// Extend Next.js Auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
      status: "ACTIVE" | "BANNED" | "SUSPENDED";
      walletBalancePoisha: number;
      twoFactorEnabled: boolean;
    };
  }
  interface User {
    role?: string;
    status?: string;
    twoFactorEnabled?: boolean;
    walletBalancePoisha?: number;
  }
}

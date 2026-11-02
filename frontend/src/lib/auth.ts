import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  walletBalancePoisha?: string;
  image?: string | null;
}

export interface Session {
  user?: SessionUser;
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("token")?.value ||
      cookieStore.get("authjs.session-token")?.value;

    if (!token) return null;

    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      return {
        user: {
          id: payload.userId || payload.id,
          email: payload.email,
          name: payload.name || "Customer",
          role: payload.role || "CUSTOMER",
          walletBalancePoisha: payload.walletBalancePoisha ? payload.walletBalancePoisha.toString() : "0",
        },
      };
    }
  } catch {
    // Token parse failure
  }

  return null;
}

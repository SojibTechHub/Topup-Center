import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/crypto";
import { sendEmail, getVerifyEmailHtml } from "@/lib/mail";
import { registerRateLimit } from "@/lib/redis";
import { z } from "zod";
import { env } from "@/lib/env";
import { nanoid } from "nanoid";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await registerRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ইনপুট সঠিক নয়", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email, password, confirmPassword, referralCode } = parsed.data;

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "পাসওয়ার্ড মিলছে না" }, { status: 400 });
  }

  // Check if email already exists
  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট আছে" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const referralCodeGenerated = nanoid(8).toUpperCase();

  // Find referrer if referral code provided
  let referrerId: string | undefined;
  if (referralCode) {
    const referrer = await db.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (referrer) {
      referrerId = referrer.id;
    }
  }

  // Create user
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      referralCode: referralCodeGenerated,
      referredBy: referrerId,
    },
    select: { id: true, email: true, name: true },
  });

  // Create referral record
  if (referrerId) {
    await db.referral.create({
      data: {
        userId: user.id,
        referrerId,
      },
    });
  }

  // Create email verification token
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  // Send verification email
  const verifyUrl = `${env.APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  await sendEmail({
    to: email,
    subject: "Topup Center — ইমেইল ভেরিফাই করুন",
    html: getVerifyEmailHtml({ name: name || "বন্ধু", verifyUrl }),
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_REGISTERED",
      resource: "User",
      resourceId: user.id,
      after: { email, name },
    },
  });

  return NextResponse.json(
    { success: true, message: "অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল ভেরিফাই করুন।" },
    { status: 201 }
  );
}

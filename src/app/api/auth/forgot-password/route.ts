import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.email) {
      const token = generateToken(32);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.verificationToken.create({
        data: {
          identifier: user.email,
          token,
          expires,
        },
      });

      await sendPasswordResetEmail(user.email, token);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ success: true });
  }
}

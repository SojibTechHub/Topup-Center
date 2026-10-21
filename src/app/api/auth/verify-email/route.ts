import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const verificationToken = await db.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      expires: { gte: new Date() },
    },
  });

  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/login?error=token_expired", req.url)
    );
  }

  // Mark email as verified and delete token
  await db.$transaction([
    db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    }),
  ]);

  return NextResponse.redirect(
    new URL("/login?verified=true", req.url)
  );
}

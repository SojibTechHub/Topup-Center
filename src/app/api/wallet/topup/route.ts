import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initiateWalletTopup } from "@/server/services/payment-service";
import { paymentRateLimit } from "@/lib/redis";
import { z } from "zod";

const topupSchema = z.object({
  amountPoisha: z.number().int().min(10000).max(1000000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { success } = await paymentRateLimit.limit(session.user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = topupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await initiateWalletTopup({
      userId: session.user.id,
      amountPoisha: BigInt(parsed.data.amountPoisha),
      userEmail: session.user.email,
      userName: session.user.name || "Customer",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitManualTopup } from "@/server/services/payment-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { method, senderNumber, transactionId, amountPoisha, screenshotUrl } = body;

    if (!senderNumber || !transactionId || !amountPoisha) {
      return NextResponse.json({ error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }

    const topup = await submitManualTopup({
      userId: session.user.id,
      provider: method || "BKASH",
      senderNumber,
      trxId: transactionId,
      amountPoisha: BigInt(amountPoisha),
      screenshotUrl,
    });

    return NextResponse.json({
      success: true,
      topup: { id: topup.id, status: topup.status },
    });
  } catch (err: unknown) {
    console.error("Manual topup API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 400 }
    );
  }
}

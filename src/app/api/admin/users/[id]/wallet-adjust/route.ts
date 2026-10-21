import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminAdjustWallet } from "@/server/services/wallet-service";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { amountPoisha, reason } = body;

    if (!amountPoisha || !reason) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const result = await adminAdjustWallet({
      userId: id,
      amountPoisha: BigInt(amountPoisha),
      note: reason,
      adminId: session.user.id,
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        userId: id,
        action: "WALLET_ADJUST",
        resource: "User",
        resourceId: id,
        note: `Adjusted ${(Number(amountPoisha) / 100).toFixed(2)} BDT. Reason: ${reason}`,
      },
    });

    return NextResponse.json({ success: true, balanceAfter: result.balanceAfterPoisha.toString() });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error adjusting wallet" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { refundOrder } from "@/server/services/order-service";

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
    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    const order = await refundOrder({
      orderId: id,
      adminId: session.user.id,
      reason: reason || "Admin refund",
    });

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error refunding order" },
      { status: 400 }
    );
  }
}

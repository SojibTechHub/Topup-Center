import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claimOrder } from "@/server/services/order-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "STAFF")) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { id } = await params;
    const order = await claimOrder({
      orderId: id,
      adminId: session.user.id,
    });

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error claiming order" },
      { status: 400 }
    );
  }
}

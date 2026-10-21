import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rejectManualTopup } from "@/server/services/payment-service";

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

    const result = await rejectManualTopup({
      topupId: id,
      adminId: session.user.id,
      reason: reason || "Admin rejection",
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error rejecting topup" },
      { status: 400 }
    );
  }
}

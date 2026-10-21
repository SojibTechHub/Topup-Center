import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveManualTopup } from "@/server/services/payment-service";

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
    const result = await approveManualTopup({
      topupId: id,
      adminId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error approving topup" },
      { status: 400 }
    );
  }
}

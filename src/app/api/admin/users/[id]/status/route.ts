import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
    const { status, reason } = body;

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        status: status as any,
        banReason: status === "BANNED" ? reason || "Admin ban" : null,
        bannedAt: status === "BANNED" ? new Date() : null,
        bannedBy: status === "BANNED" ? session.user.id : null,
      },
    });

    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        userId: id,
        action: status === "BANNED" ? "USER_BANNED" : "USER_UNBANNED",
        resource: "User",
        resourceId: id,
        note: reason || `Status set to ${status}`,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error updating status" },
      { status: 400 }
    );
  }
}

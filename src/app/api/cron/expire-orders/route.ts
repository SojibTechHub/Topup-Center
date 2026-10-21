import { NextRequest, NextResponse } from "next/server";
import { expirePendingOrders } from "@/server/services/order-service";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await expirePendingOrders();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
}

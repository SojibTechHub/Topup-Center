import { NextRequest, NextResponse } from "next/server";
import { processReconcilePaymentsJob } from "@/worker/jobs/reconcile-payments";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processReconcilePaymentsJob();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
}

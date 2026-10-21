import { NextRequest, NextResponse } from "next/server";
import { processRetryJobsJob } from "@/worker/jobs/retry-jobs";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resetCount = await processRetryJobsJob();
  return NextResponse.json({ retriedJobs: resetCount, timestamp: new Date().toISOString() });
}

import { db } from "../lib/db";
import { JobStatus } from "@prisma/client";
import { processExpireOrdersJob } from "./jobs/expire-orders";
import { processSendEmailJob, SendEmailPayload } from "./jobs/send-email";
import { processReconcilePaymentsJob } from "./jobs/reconcile-payments";
import { processRetryJobsJob } from "./jobs/retry-jobs";

const WORKER_ID = `worker-${process.pid}-${Math.random().toString(36).substring(2, 7)}`;
let isRunning = true;

// ─── Graceful Shutdown Handlers ────────────────────────────────────────────────

function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);
    isRunning = false;
    // Release any stale locks held by this worker
    try {
      await db.job.updateMany({
        where: { lockedBy: WORKER_ID, status: JobStatus.RUNNING },
        data: { status: JobStatus.PENDING, lockedAt: null, lockedBy: null },
      });
      console.log("[Worker] Released all acquired locks.");
    } catch (e) {
      console.error("[Worker] Error releasing locks during shutdown:", e);
    }
    await db.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ─── Poll and Process Queued Jobs ──────────────────────────────────────────────

async function processNextJobs() {
  try {
    // Transaction with FOR UPDATE SKIP LOCKED
    const claimedJobs = await db.$transaction(async (tx) => {
      // Raw query for Postgres FOR UPDATE SKIP LOCKED
      const jobs = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM jobs
        WHERE status = 'PENDING' AND "runAt" <= NOW()
        ORDER BY "runAt" ASC
        LIMIT 5
        FOR UPDATE SKIP LOCKED
      `;

      if (!jobs || jobs.length === 0) return [];

      const jobIds = jobs.map((j) => j.id);

      await tx.job.updateMany({
        where: { id: { in: jobIds } },
        data: {
          status: JobStatus.RUNNING,
          lockedAt: new Date(),
          lockedBy: WORKER_ID,
          attempts: { increment: 1 },
        },
      });

      return tx.job.findMany({
        where: { id: { in: jobIds } },
      });
    });

    for (const job of claimedJobs) {
      console.log(`[Worker] Executing job ${job.id} (${job.type}), attempt ${job.attempts}`);
      try {
        switch (job.type) {
          case "SEND_EMAIL":
            await processSendEmailJob(job.payload as unknown as SendEmailPayload);
            break;
          case "EXPIRE_ORDERS":
            await processExpireOrdersJob();
            break;
          case "RECONCILE_PAYMENTS":
            await processReconcilePaymentsJob();
            break;
          case "RETRY_JOBS":
            await processRetryJobsJob();
            break;
          default:
            console.warn(`[Worker] Unknown job type: ${job.type}`);
        }

        // Mark COMPLETED
        await db.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            lockedAt: null,
            lockedBy: null,
            error: null,
          },
        });
        console.log(`[Worker] Job ${job.id} completed successfully.`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[Worker] Job ${job.id} failed:`, errorMsg);

        await db.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: errorMsg,
            lockedAt: null,
            lockedBy: null,
          },
        });
      }
    }
  } catch (error) {
    // If table doesn't exist yet or DB is offline, log cleanly without crash
    console.error("[Worker] Polling error:", (error as Error).message);
  }
}

// ─── Main Worker Loop ──────────────────────────────────────────────────────────

async function startWorker() {
  console.log(`====================================================`);
  console.log(`🚀 Topup Center Background Worker Started`);
  console.log(`   Worker ID: ${WORKER_ID}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`====================================================`);

  setupGracefulShutdown();

  // Schedule background intervals
  let lastExpire = 0;
  let lastReconcile = 0;
  let lastRetry = 0;
  let lastHeartbeat = Date.now();

  while (isRunning) {
    const now = Date.now();

    // 1. Process queued jobs from DB
    await processNextJobs();

    // 2. Periodic: Expire pending orders (every 60s)
    if (now - lastExpire >= 60 * 1000) {
      lastExpire = now;
      try {
        await processExpireOrdersJob();
      } catch (e) {
        console.error("[Worker:Periodic] Expire orders failed:", (e as Error).message);
      }
    }

    // 3. Periodic: Reconcile payments (every 5m)
    if (now - lastReconcile >= 5 * 60 * 1000) {
      lastReconcile = now;
      try {
        await processReconcilePaymentsJob();
      } catch (e) {
        console.error("[Worker:Periodic] Reconcile payments failed:", (e as Error).message);
      }
    }

    // 4. Periodic: Retry failed jobs (every 2m)
    if (now - lastRetry >= 2 * 60 * 1000) {
      lastRetry = now;
      try {
        await processRetryJobsJob();
      } catch (e) {
        console.error("[Worker:Periodic] Retry jobs failed:", (e as Error).message);
      }
    }

    // 5. Worker Heartbeat (every 10m)
    if (now - lastHeartbeat >= 10 * 60 * 1000) {
      lastHeartbeat = now;
      console.log(`[Worker Heartbeat] ${new Date().toISOString()} - Worker ${WORKER_ID} is alive & healthy.`);
    }

    // Sleep 3 seconds before next iteration
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

startWorker().catch((err) => {
  console.error("[Worker] Fatal startup error:", err);
  process.exit(1);
});

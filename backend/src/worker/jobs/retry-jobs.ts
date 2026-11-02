import { db } from "../../lib/db";

export async function processRetryJobsJob(): Promise<number> {
  const maxAttempts = 5;
  const now = new Date();

  // Find failed jobs that haven't reached max attempts
  const failedJobs = await db.job.findMany({
    where: {
      status: "FAILED",
      attempts: { lt: maxAttempts },
    },
    take: 50,
  });

  let resetCount = 0;

  for (const job of failedJobs) {
    // Exponential backoff: 2^attempts * 60 seconds
    const backoffSeconds = Math.pow(2, job.attempts) * 60;
    const retryAfter = new Date(job.updatedAt.getTime() + backoffSeconds * 1000);

    if (now >= retryAfter) {
      await db.job.update({
        where: { id: job.id },
        data: {
          status: "PENDING",
          error: null,
          lockedAt: null,
          lockedBy: null,
        },
      });
      resetCount++;
    }
  }

  if (resetCount > 0) {
    console.log(`[Worker:RetryJobs] Rescheduled ${resetCount} failed jobs for retry.`);
  }

  return resetCount;
}

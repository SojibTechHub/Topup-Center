import { Router, Request, Response } from "express";
import { processExpireOrdersJob } from "@/worker/jobs/expire-orders";
import { processReconcilePaymentsJob } from "@/worker/jobs/reconcile-payments";
import { processRetryJobsJob } from "@/worker/jobs/retry-jobs";
import { env } from "@/lib/env";

const router = Router();

function verifyCronSecret(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const cronSecret = env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "UNAUTHORIZED_CRON" });
  }
  next();
}

router.all("/cron/expire-orders", verifyCronSecret, async (req: Request, res: Response) => {
  try {
    const expiredCount = await processExpireOrdersJob();
    return res.json({ success: true, expiredCount });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.all("/cron/reconcile-payments", verifyCronSecret, async (req: Request, res: Response) => {
  try {
    const result = await processReconcilePaymentsJob();
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.all("/cron/retry-jobs", verifyCronSecret, async (req: Request, res: Response) => {
  try {
    const retriedCount = await processRetryJobsJob();
    return res.json({ success: true, retriedCount });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

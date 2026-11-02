import { Router, Request, Response } from "express";
import { db } from "@/lib/db";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  let dbStatus = "connected";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
  }

  return res.json({
    status: "ok",
    service: "topup-center-backend",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: "2.0.0",
  });
});

export default router;


import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticateToken } from "@/middleware/auth";
import { db } from "@/lib/db";
import { initiateWalletTopup, submitManualTopup } from "@/services/payment-service";
import { paymentRateLimit } from "@/lib/redis";

const router = Router();

const topupSchema = z.object({
  amountPoisha: z.number().int().min(10000).max(1000000), // ৳100 - ৳10,000
});

const manualTopupSchema = z.object({
  method: z.enum(["BKASH", "NAGAD", "ROCKET"]),
  senderNumber: z.string().min(11).max(15),
  transactionId: z.string().min(6).max(30),
  amountPoisha: z.number().int().min(5000).max(2500000), // ৳50 - ৳25,000
  screenshotUrl: z.string().optional(),
});

// GET /api/wallet
router.get("/wallet", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        walletBalancePoisha: true,
        totalSpentPoisha: true,
        loyaltyTier: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    return res.json({
      success: true,
      walletBalancePoisha: user.walletBalancePoisha.toString(),
      totalSpentPoisha: user.totalSpentPoisha.toString(),
      loyaltyTier: user.loyaltyTier,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "WALLET_FETCH_FAILED", message: error.message });
  }
});

// GET /api/wallet/transactions
router.get("/wallet/transactions", authenticateToken, async (req: Request, res: Response) => {
  try {
    const transactions = await db.walletTransaction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const serialized = transactions.map((t) => ({
      ...t,
      amountPoisha: t.amountPoisha.toString(),
      balanceAfterPoisha: t.balanceAfterPoisha.toString(),
    }));

    return res.json({ success: true, transactions: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "TRANSACTIONS_FETCH_FAILED", message: error.message });
  }
});

// POST /api/wallet/topup
router.post("/wallet/topup", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Rate limit
    try {
      const { success } = await paymentRateLimit.limit(userId);
      if (!success) {
        return res.status(429).json({ error: "RATE_LIMITED", message: "Too many top-up requests" });
      }
    } catch {
      // Proceed if redis offline
    }

    const parsed = topupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "INVALID_INPUT", details: parsed.error.issues });
    }

    const result = await initiateWalletTopup({
      userId,
      amountPoisha: BigInt(parsed.data.amountPoisha),
      userEmail: req.user!.email,
      userName: req.user!.name || "Customer",
    });

    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "TOPUP_FAILED" });
  }
});

// POST /api/wallet/manual-topup
router.post("/wallet/manual-topup", authenticateToken, async (req: Request, res: Response) => {
  try {
    const parsed = manualTopupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "INVALID_INPUT", details: parsed.error.issues });
    }

    const { method, senderNumber, transactionId, amountPoisha, screenshotUrl } = parsed.data;
    const userId = req.user!.userId;

    const manual = await submitManualTopup({
      userId,
      provider: method,
      senderNumber,
      trxId: transactionId.toUpperCase(),
      amountPoisha: BigInt(amountPoisha),
      screenshotUrl,
    });

    return res.status(201).json({
      success: true,
      manualPayment: {
        id: manual.id,
        transactionId: manual.trxId,
        amountPoisha: manual.amountPoisha.toString(),
        status: manual.status,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "MANUAL_SUBMIT_FAILED" });
  }
});

export default router;

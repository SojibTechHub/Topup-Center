import { Router, Request, Response } from "express";
import { authenticateToken, requireRole } from "@/middleware/auth";
import { db } from "@/lib/db";
import { claimOrder, completeOrder, refundOrder } from "@/services/order-service";
import { approveManualTopup, rejectManualTopup } from "@/services/payment-service";

const router = Router();

// Protect all admin routes: STAFF, ADMIN, SUPER_ADMIN
router.use(authenticateToken);
router.use(requireRole("STAFF", "ADMIN", "SUPER_ADMIN"));

// GET /api/admin/orders
router.get("/admin/orders", async (req: Request, res: Response) => {
  const { status, q } = req.query as { status?: string; q?: string };

  try {
    const orders = await db.order.findMany({
      where: {
        ...(status && status !== "ALL" ? { status: status as any } : {}),
        ...(q
          ? {
              OR: [
                { code: { contains: q, mode: "insensitive" } },
                { user: { email: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        game: { select: { name: true, slug: true } },
        package: { select: { name: true, amountLabel: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const serialized = orders.map((o) => ({
      ...o,
      pricePoisha: o.pricePoisha.toString(),
      costPoisha: o.costPoisha?.toString(),
      finalPricePoisha: o.finalPricePoisha?.toString(),
    }));

    return res.json({ success: true, orders: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "ADMIN_ORDERS_FAILED", message: error.message });
  }
});

// POST /api/admin/orders/:id/claim
router.post("/admin/orders/:id/claim", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await claimOrder({
      orderId: id,
      adminId: req.user!.userId,
    });

    return res.json({ success: true, order: result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "CLAIM_FAILED" });
  }
});

// POST /api/admin/orders/:id/complete
router.post("/admin/orders/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { proofUrl, adminNote } = req.body;

    const result = await completeOrder({
      orderId: id,
      adminId: req.user!.userId,
      proofUrl,
      notes: adminNote,
    });

    return res.json({ success: true, order: result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "COMPLETE_FAILED" });
  }
});

// POST /api/admin/orders/:id/refund
router.post("/admin/orders/:id/refund", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await refundOrder({
      orderId: id,
      adminId: req.user!.userId,
      reason: reason || "Admin refund",
    });

    return res.json({ success: true, order: result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "REFUND_FAILED" });
  }
});

// GET /api/admin/payments/manual
router.get("/admin/payments/manual", async (req: Request, res: Response) => {
  try {
    const payments = await db.manualTopup.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const serialized = payments.map((p) => ({
      ...p,
      amountPoisha: p.amountPoisha.toString(),
    }));

    return res.json({ success: true, payments: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "MANUAL_PAYMENTS_FAILED", message: error.message });
  }
});

// POST /api/admin/payments/manual/:id/approve
router.post("/admin/payments/manual/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await approveManualTopup({
      topupId: id,
      adminId: req.user!.userId,
    });

    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "APPROVE_FAILED" });
  }
});

// POST /api/admin/payments/manual/:id/reject
router.post("/admin/payments/manual/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await rejectManualTopup({
      topupId: id,
      adminId: req.user!.userId,
      reason: reason || "Rejected by admin",
    });

    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "REJECT_FAILED" });
  }
});

// GET /api/admin/users
router.get("/admin/users", async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        loyaltyTier: true,
        walletBalancePoisha: true,
        totalSpentPoisha: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const serialized = users.map((u) => ({
      ...u,
      walletBalancePoisha: u.walletBalancePoisha.toString(),
      totalSpentPoisha: u.totalSpentPoisha.toString(),
    }));

    return res.json({ success: true, users: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "USERS_FETCH_FAILED" });
  }
});

// POST /api/admin/users/:id/status
router.post("/admin/users/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await db.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/analytics
router.get("/admin/analytics", async (req: Request, res: Response) => {
  try {
    const [totalOrders, completedOrders, pendingOrders, totalUsers] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "COMPLETED" } }),
      db.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
      db.user.count(),
    ]);

    const revenueResult = await db.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { finalPricePoisha: true },
    });

    const totalRevenuePoisha = revenueResult._sum.finalPricePoisha || 0n;

    return res.json({
      success: true,
      analytics: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalUsers,
        totalRevenueBdt: (Number(totalRevenuePoisha) / 100).toFixed(2),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "ANALYTICS_FAILED", message: error.message });
  }
});

export default router;

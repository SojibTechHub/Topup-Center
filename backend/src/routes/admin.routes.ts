import { Router, Request, Response } from "express";
import { authenticateToken, requireRole } from "@/middleware/auth";
import { db } from "@/lib/db";
import { claimOrder, completeOrder, refundOrder } from "@/services/order-service";
import { approveManualTopup, rejectManualTopup } from "@/services/payment-service";

const router = Router();

// Protect all admin routes: STAFF, ADMIN, SUPER_ADMIN
router.use(authenticateToken);
router.use(requireRole("STAFF", "ADMIN", "SUPER_ADMIN"));

// ─────────────────────────────────────────────
// 1. ORDERS QUEUE
// ─────────────────────────────────────────────

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
                { user: { phone: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        game: { select: { name: true, slug: true } },
        package: { select: { name: true, amountLabel: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    const serialized = orders.map((o) => ({
      ...o,
      pricePoisha: o.pricePoisha.toString(),
      costPoisha: o.costPoisha?.toString(),
      finalPricePoisha: o.finalPricePoisha?.toString(),
      discountPoisha: o.discountPoisha?.toString(),
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
    const { proofUrl, proofImage, adminNote, notes } = req.body;

    const result = await completeOrder({
      orderId: id,
      adminId: req.user!.userId,
      proofUrl: proofUrl || proofImage,
      notes: adminNote || notes,
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

// ─────────────────────────────────────────────
// 2. GAMES MANAGEMENT (CRUD)
// ─────────────────────────────────────────────

// GET /api/admin/games
router.get("/admin/games", async (_req: Request, res: Response) => {
  try {
    const games = await db.game.findMany({
      include: {
        _count: {
          select: { packages: true, orders: true },
        },
      },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });

    return res.json({ success: true, games });
  } catch (error: any) {
    return res.status(500).json({ error: "GAMES_FETCH_FAILED", message: error.message });
  }
});

// POST /api/admin/games (create new game)
router.post("/admin/games", async (req: Request, res: Response) => {
  try {
    const { name, nameEn, slug, category, description, howToFind, fields, tags, isFeatured, isPopular, sort, logo } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and Slug are required" });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    const game = await db.game.create({
      data: {
        name,
        nameEn: nameEn || name,
        slug: cleanSlug,
        category: category || "mobile",
        description: description || "",
        howToFind: howToFind || "",
        fields: fields || [
          {
            key: "player_id",
            label: "Player ID",
            labelBn: "প্লেয়ার আইডি",
            type: "text",
            placeholder: "e.g. 123456789",
            required: true,
            errorMessage: "প্লেয়ার আইডি দিন",
          },
        ],
        tags: tags || ["Instant"],
        isFeatured: Boolean(isFeatured),
        isPopular: Boolean(isPopular),
        sort: Number(sort) || 0,
        logo: logo || `/games/${cleanSlug}.jpg`,
      },
    });

    return res.status(201).json({ success: true, game });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "GAME_CREATE_FAILED" });
  }
});

// PUT /api/admin/games/:id (update game)
router.put("/api/admin/games/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameEn, category, description, howToFind, isActive, isFeatured, isPopular, sort, logo } = req.body;

    const game = await db.game.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(howToFind !== undefined && { howToFind }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
        ...(sort !== undefined && { sort: Number(sort) }),
        ...(logo !== undefined && { logo }),
      },
    });

    return res.json({ success: true, game });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "GAME_UPDATE_FAILED" });
  }
});

// DELETE /api/admin/games/:id
router.delete("/api/admin/games/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Toggle active or delete
    await db.game.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({ success: true, message: "Game deactivated successfully" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "GAME_DELETE_FAILED" });
  }
});

// ─────────────────────────────────────────────
// 3. PACKAGES MANAGEMENT (CRUD)
// ─────────────────────────────────────────────

// GET /api/admin/packages
router.get("/admin/packages", async (req: Request, res: Response) => {
  const { gameId } = req.query as { gameId?: string };

  try {
    const packages = await db.package.findMany({
      where: {
        ...(gameId ? { gameId } : {}),
      },
      include: {
        game: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ gameId: "asc" }, { sort: "asc" }],
    });

    const serialized = packages.map((p) => ({
      ...p,
      pricePoisha: p.pricePoisha.toString(),
      costPoisha: p.costPoisha?.toString(),
    }));

    return res.json({ success: true, packages: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "PACKAGES_FETCH_FAILED", message: error.message });
  }
});

// POST /api/admin/packages (create package)
router.post("/api/admin/packages", async (req: Request, res: Response) => {
  try {
    const { gameId, name, amountLabel, priceBdt, costBdt, stock, isPopular, isFeatured, badge, sort, deliveryTime } = req.body;

    if (!gameId || !name || priceBdt === undefined) {
      return res.status(400).json({ error: "Game, Name, and Price are required" });
    }

    const pricePoisha = BigInt(Math.round(Number(priceBdt) * 100));
    const costPoisha = costBdt !== undefined ? BigInt(Math.round(Number(costBdt) * 100)) : BigInt(0);

    const pkg = await db.package.create({
      data: {
        gameId,
        name,
        amountLabel: amountLabel || name,
        pricePoisha,
        costPoisha,
        stock: stock !== undefined ? Number(stock) : -1,
        isPopular: Boolean(isPopular),
        isFeatured: Boolean(isFeatured),
        description: badge || null,
        sort: Number(sort) || 0,
        deliveryTime: deliveryTime || "১-৫ মিনিট",
      },
    });

    return res.status(201).json({
      success: true,
      package: {
        ...pkg,
        pricePoisha: pkg.pricePoisha.toString(),
        costPoisha: pkg.costPoisha?.toString(),
      },
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "PACKAGE_CREATE_FAILED" });
  }
});

// PUT /api/admin/packages/:id (update package)
router.put("/api/admin/packages/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, amountLabel, priceBdt, costBdt, stock, isPopular, isFeatured, isActive, badge, sort, deliveryTime } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (amountLabel !== undefined) data.amountLabel = amountLabel;
    if (priceBdt !== undefined) data.pricePoisha = BigInt(Math.round(Number(priceBdt) * 100));
    if (costBdt !== undefined) data.costPoisha = BigInt(Math.round(Number(costBdt) * 100));
    if (stock !== undefined) data.stock = Number(stock);
    if (isPopular !== undefined) data.isPopular = Boolean(isPopular);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (badge !== undefined) data.description = badge;
    if (sort !== undefined) data.sort = Number(sort);
    if (deliveryTime !== undefined) data.deliveryTime = deliveryTime;

    const pkg = await db.package.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      package: {
        ...pkg,
        pricePoisha: pkg.pricePoisha.toString(),
        costPoisha: pkg.costPoisha?.toString(),
      },
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "PACKAGE_UPDATE_FAILED" });
  }
});

// DELETE /api/admin/packages/:id
router.delete("/api/admin/packages/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.package.delete({ where: { id } });
    return res.json({ success: true, message: "Package deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "PACKAGE_DELETE_FAILED" });
  }
});

// ─────────────────────────────────────────────
// 4. SETTINGS MANAGEMENT
// ─────────────────────────────────────────────

// GET /api/admin/settings
router.get("/admin/settings", async (_req: Request, res: Response) => {
  try {
    const settings = await db.setting.findMany();
    const map: Record<string, any> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return res.json({ success: true, settings: map });
  } catch (error: any) {
    return res.status(500).json({ error: "SETTINGS_FETCH_FAILED" });
  }
});

// POST /api/admin/settings (save all settings)
router.post("/api/admin/settings", async (req: Request, res: Response) => {
  try {
    const { site_name, site_tagline, maintenance_mode, notice_ticker, support_contacts, manual_payment_numbers, wallet_limits } = req.body;

    const updates: Array<{ key: string; value: any }> = [];

    if (site_name !== undefined) updates.push({ key: "site_name", value: site_name });
    if (site_tagline !== undefined) updates.push({ key: "site_tagline", value: site_tagline });
    if (maintenance_mode !== undefined) updates.push({ key: "maintenance_mode", value: Boolean(maintenance_mode) });
    if (notice_ticker !== undefined) updates.push({ key: "notice_ticker", value: notice_ticker });
    if (support_contacts !== undefined) updates.push({ key: "support_contacts", value: support_contacts });
    if (manual_payment_numbers !== undefined) updates.push({ key: "manual_payment_numbers", value: manual_payment_numbers });
    if (wallet_limits !== undefined) updates.push({ key: "wallet_limits", value: wallet_limits });

    for (const item of updates) {
      await db.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return res.json({ success: true, message: "সেটিংস সফলভাবে সংরক্ষিত হয়েছে" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "SETTINGS_SAVE_FAILED" });
  }
});

// ─────────────────────────────────────────────
// 5. COUPONS MANAGEMENT (CRUD)
// ─────────────────────────────────────────────

// GET /api/admin/coupons
router.get("/admin/coupons", async (_req: Request, res: Response) => {
  try {
    const coupons = await db.coupon.findMany({
      include: {
        _count: { select: { orders: true, redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = coupons.map((c) => ({
      ...c,
      discountValue: c.discountValue.toString(),
      minOrderPoisha: c.minOrderPoisha.toString(),
      maxDiscountPoisha: c.maxDiscountPoisha?.toString(),
    }));

    return res.json({ success: true, coupons: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "COUPONS_FETCH_FAILED" });
  }
});

// POST /api/admin/coupons (create coupon)
router.post("/api/admin/coupons", async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderBdt, maxDiscountBdt, validUntil } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: "Code and Discount value are required" });
    }

    const isPercent = discountType === "PERCENT";
    const discountValBig = isPercent
      ? BigInt(Math.round(Number(discountValue)))
      : BigInt(Math.round(Number(discountValue) * 100));

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: isPercent ? "PERCENT" : "FIXED",
        discountValue: discountValBig,
        minOrderPoisha: minOrderBdt ? BigInt(Math.round(Number(minOrderBdt) * 100)) : BigInt(0),
        maxDiscountPoisha: maxDiscountBdt ? BigInt(Math.round(Number(maxDiscountBdt) * 100)) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      coupon: {
        ...coupon,
        discountValue: coupon.discountValue.toString(),
        minOrderPoisha: coupon.minOrderPoisha.toString(),
        maxDiscountPoisha: coupon.maxDiscountPoisha?.toString(),
      },
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "COUPON_CREATE_FAILED" });
  }
});

// DELETE /api/admin/coupons/:id
router.delete("/api/admin/coupons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.coupon.delete({ where: { id } });
    return res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "COUPON_DELETE_FAILED" });
  }
});

// ─────────────────────────────────────────────
// 6. MANUAL PAYMENTS
// ─────────────────────────────────────────────

// GET /api/admin/payments/manual
router.get("/admin/payments/manual", async (_req: Request, res: Response) => {
  try {
    const payments = await db.manualTopup.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 150,
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
router.post("/api/admin/payments/manual/:id/approve", async (req: Request, res: Response) => {
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
router.post("/api/admin/payments/manual/:id/reject", async (req: Request, res: Response) => {
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

// ─────────────────────────────────────────────
// 7. USER MANAGEMENT & WALLET ADJUSTMENT
// ─────────────────────────────────────────────

// GET /api/admin/users
router.get("/admin/users", async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };

  try {
    const users = await db.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
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
        _count: {
          select: { orders: true },
        },
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

// POST /api/admin/users/:id/wallet-adjust (credit/debit wallet)
router.post("/api/admin/users/:id/wallet-adjust", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amountBdt, amountPoisha, reason } = req.body;

    if ((amountBdt === undefined && amountPoisha === undefined) || !reason) {
      return res.status(400).json({ error: "amount and reason are required" });
    }

    const adjustPoisha = amountPoisha !== undefined
      ? BigInt(amountPoisha)
      : BigInt(Math.round(Number(amountBdt) * 100));

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        select: { id: true, email: true, walletBalancePoisha: true },
      });

      if (!user) throw new Error("User not found");

      const newBalance = user.walletBalancePoisha + adjustPoisha;
      if (newBalance < 0n) {
        throw new Error("ব্যালেন্স মাইনাস করার মতো পর্যাপ্ত টাকা গ্রাহকের ওয়ালেটে নেই");
      }

      const txn = await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "ADMIN_ADJUST",
          amountPoisha: adjustPoisha,
          balanceAfterPoisha: newBalance,
          note: `অ্যাডমিন সমন্বয়: ${reason}`,
          idempotencyKey: `adj-${user.id}-${Date.now()}`,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { walletBalancePoisha: newBalance },
        select: { id: true, email: true, walletBalancePoisha: true },
      });

      await tx.auditLog.create({
        data: {
          adminId: req.user!.userId,
          userId: user.id,
          action: "WALLET_ADJUST",
          resource: "User",
          resourceId: user.id,
          note: reason,
          before: { balance: user.walletBalancePoisha.toString() },
          after: { balance: newBalance.toString(), adjustment: adjustPoisha.toString() },
        },
      });

      return { user: updatedUser, transaction: txn };
    });

    return res.json({
      success: true,
      message: `ওয়ালেট ব্যালেন্স সফলভাবে আপডেট করা হয়েছে`,
      newBalance: (Number(result.user.walletBalancePoisha) / 100).toFixed(2),
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "WALLET_ADJUST_FAILED" });
  }
});

// POST /api/admin/users/:id/status (ban / unban)
router.post("/api/admin/users/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, banReason } = req.body;

    const user = await db.user.update({
      where: { id },
      data: {
        status,
        banReason: status === "BANNED" ? banReason || "Admin banned" : null,
        bannedAt: status === "BANNED" ? new Date() : null,
        bannedBy: status === "BANNED" ? req.user!.userId : null,
      },
      select: { id: true, email: true, status: true },
    });

    await db.auditLog.create({
      data: {
        adminId: req.user!.userId,
        userId: user.id,
        action: status === "BANNED" ? "USER_BANNED" : "USER_UNBANNED",
        resource: "User",
        resourceId: user.id,
        note: banReason || "",
      },
    });

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// 8. ANALYTICS & INSIGHTS
// ─────────────────────────────────────────────

// GET /api/admin/analytics
router.get("/admin/analytics", async (_req: Request, res: Response) => {
  try {
    const [totalOrders, completedOrders, pendingOrders, totalUsers, totalGames] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "COMPLETED" } }),
      db.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
      db.user.count(),
      db.game.count({ where: { isActive: true } }),
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
        totalGames,
        totalRevenueBdt: (Number(totalRevenuePoisha) / 100).toFixed(2),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "ANALYTICS_FAILED", message: error.message });
  }
});

export default router;

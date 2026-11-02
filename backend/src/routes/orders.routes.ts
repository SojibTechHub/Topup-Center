import { Router, Request, Response } from "express";
import { authenticateToken } from "@/middleware/auth";
import { createOrder, payOrderWithWallet } from "@/services/order-service";
import { createCharge, poishaToBdt } from "@/lib/payments/uddoktapay";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const router = Router();

// POST /api/orders
router.post("/orders", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { packageId, playerFields, paymentMethod, couponCode, isGift, giftRecipient, giftMessage } = req.body;

    if (!packageId || !playerFields || typeof playerFields !== "object") {
      return res.status(400).json({ error: "INVALID_REQUEST_DATA", message: "packageId and playerFields are required" });
    }

    const userId = req.user!.userId;

    // 1. Create Order in Database
    const order = await createOrder({
      userId,
      packageId,
      playerFields,
      couponCode,
      isGift,
      giftRecipient,
      giftMessage,
    });

    // 2. Process Payment Method
    if (paymentMethod === "WALLET") {
      await payOrderWithWallet({
        orderId: order.id,
        userId,
      });

      return res.status(201).json({
        success: true,
        orderCode: order.code,
        order: { id: order.id, code: order.code, status: "PAID" },
      });
    } else {
      // UddoktaPay Direct Payment
      const amountBdt = poishaToBdt(order.finalPricePoisha);

      const payment = await db.payment.create({
        data: {
          userId,
          orderId: order.id,
          provider: "UDDOKTAPAY",
          purpose: "ORDER_PAYMENT",
          amountPoisha: order.finalPricePoisha,
          feePoisha: 0n,
          chargedPoisha: order.finalPricePoisha,
          status: "INITIATED",
        },
      });

      const charge = await createCharge({
        fullName: req.user!.name || "Customer",
        email: req.user!.email || "customer@example.com",
        amount: amountBdt,
        metadata: {
          orderId: order.id,
          paymentId: payment.id,
          userId,
          purpose: "ORDER_PAYMENT",
        },
        redirectUrl: `${env.APP_URL}/api/payments/uddoktapay/callback`,
        cancelUrl: `${env.APP_URL}/order/${order.code}?payment=cancelled`,
        webhookUrl: `${env.APP_URL}/api/payments/uddoktapay/webhook`,
      });

      await db.payment.update({
        where: { id: payment.id },
        data: {
          invoiceId: charge.payment_url,
          rawPayload: charge as any,
        },
      });

      return res.status(201).json({
        success: true,
        orderCode: order.code,
        paymentUrl: charge.payment_url,
      });
    }
  } catch (error: any) {
    console.error("Order creation error:", error);
    return res.status(400).json({
      error: error.message || "ORDER_CREATION_FAILED",
      message: error.message,
    });
  }
});

// GET /api/orders
router.get("/orders", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        game: { select: { name: true, slug: true } },
        package: { select: { name: true, amountLabel: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
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
    return res.status(500).json({ error: "ORDERS_FETCH_FAILED", message: error.message });
  }
});

// GET /api/orders/:code
router.get("/orders/:code", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const order = await db.order.findUnique({
      where: { code },
      include: {
        game: true,
        package: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "ORDER_NOT_FOUND" });
    }

    const serialized = {
      ...order,
      pricePoisha: order.pricePoisha.toString(),
      costPoisha: order.costPoisha?.toString(),
      finalPricePoisha: order.finalPricePoisha?.toString(),
      discountPoisha: order.discountPoisha?.toString(),
      package: {
        ...order.package,
        pricePoisha: order.package.pricePoisha.toString(),
        costPoisha: order.package.costPoisha?.toString(),
      },
    };

    return res.json({ success: true, order: serialized });
  } catch (error: any) {
    return res.status(500).json({ error: "ORDER_DETAIL_FAILED", message: error.message });
  }
});

export default router;

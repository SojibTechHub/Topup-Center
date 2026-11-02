import { db } from "@/lib/db";
import { generateOrderCode, generateIdempotencyKey } from "@/lib/crypto";
import { debitWallet } from "./wallet-service";
import { alertNewOrder } from "@/lib/telegram";
import { Prisma } from "@prisma/client";

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createOrder(params: {
  userId: string;
  packageId: string;
  playerFields: Record<string, string>;
  couponCode?: string;
  isGift?: boolean;
  giftRecipient?: string;
  giftMessage?: string;
}) {
  // Fetch package with game (always server-side price)
  const pkg = await db.package.findUnique({
    where: { id: params.packageId, isActive: true },
    include: { game: true },
  });

  if (!pkg || !pkg.game.isActive) {
    throw new Error("PACKAGE_NOT_FOUND");
  }

  if (pkg.stock === 0) {
    throw new Error("OUT_OF_STOCK");
  }

  // Validate player fields against game field definitions
  const gameFields = pkg.game.fields as Array<{
    key: string;
    required: boolean;
    regex?: string;
  }>;

  for (const field of gameFields) {
    if (field.required && !params.playerFields[field.key]) {
      throw new Error(`MISSING_FIELD:${field.key}`);
    }
    if (field.regex && params.playerFields[field.key]) {
      const regex = new RegExp(field.regex);
      if (!regex.test(params.playerFields[field.key])) {
        throw new Error(`INVALID_FIELD:${field.key}`);
      }
    }
  }

  // Coupon validation
  let couponId: string | undefined;
  let discountPoisha = 0n;
  if (params.couponCode) {
    const coupon = await db.coupon.findFirst({
      where: {
        code: params.couponCode,
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      },
    });

    if (coupon) {
      const withinUsageLimit =
        !coupon.maxUses || coupon.usedCount < coupon.maxUses;
      const meetsMinOrder = pkg.pricePoisha >= coupon.minOrderPoisha;

      if (withinUsageLimit && meetsMinOrder) {
        couponId = coupon.id;
        if (coupon.discountType === "PERCENT") {
          discountPoisha =
            (pkg.pricePoisha * coupon.discountValue) / 100n;
          if (
            coupon.maxDiscountPoisha &&
            discountPoisha > coupon.maxDiscountPoisha
          ) {
            discountPoisha = coupon.maxDiscountPoisha;
          }
        } else {
          discountPoisha = coupon.discountValue;
        }
      }
    }
  }

  const finalPricePoisha = pkg.pricePoisha - discountPoisha;

  // Create order with expiry
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const code = generateOrderCode();

  const order = await db.order.create({
    data: {
      code,
      userId: params.userId,
      gameId: pkg.gameId,
      packageId: pkg.id,
      playerFields: params.playerFields,
      packageSnapshot: {
        id: pkg.id,
        name: pkg.name,
        amountLabel: pkg.amountLabel,
        pricePoisha: pkg.pricePoisha.toString(),
        deliveryTime: pkg.deliveryTime,
      },
      gameSnapshot: {
        id: pkg.game.id,
        name: pkg.game.name,
        slug: pkg.game.slug,
      },
      pricePoisha: pkg.pricePoisha,
      costPoisha: pkg.costPoisha,
      couponId,
      discountPoisha,
      finalPricePoisha,
      isGift: params.isGift || false,
      giftRecipient: params.giftRecipient,
      giftMessage: params.giftMessage,
      expiresAt,
    },
  });

  // Record the coupon usage intent (confirmed on payment)
  // Actual coupon counter updated when paid

  return order;
}

// ─── Pay Order with Wallet ────────────────────────────────────────────────────

export async function payOrderWithWallet(params: {
  orderId: string;
  userId: string;
}) {
  return db.$transaction(
    async (tx) => {
      // Lock and fetch the order
      const orders = await tx.$queryRaw<Array<{ id: string; status: string; final_price_poisha: string; user_id: string; coupon_id: string | null; version: number }>>`
        SELECT id, status, final_price_poisha, user_id, coupon_id, version
        FROM orders
        WHERE id = ${params.orderId}
        FOR UPDATE
      `;

      const order = orders[0];
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.user_id !== params.userId) throw new Error("FORBIDDEN");
      if (order.status !== "PENDING_PAYMENT") throw new Error("ORDER_NOT_PAYABLE");

      // Check expiry
      const orderData = await tx.order.findUnique({
        where: { id: params.orderId },
        select: { expiresAt: true },
      });
      if (orderData?.expiresAt && orderData.expiresAt < new Date()) {
        await tx.order.update({
          where: { id: params.orderId },
          data: { status: "EXPIRED" },
        });
        throw new Error("ORDER_EXPIRED");
      }

      const amount = BigInt(order.final_price_poisha);
      const idempotencyKey = generateIdempotencyKey([
        "order_payment",
        params.orderId,
        params.userId,
      ]);

      // Debit wallet (has its own lock)
      await debitWallet({
        userId: params.userId,
        amountPoisha: amount,
        type: "ORDER_PAYMENT",
        orderId: params.orderId,
        referenceType: "ORDER",
        referenceId: params.orderId,
        note: `Order ${order.id}`,
        idempotencyKey,
      });

      // Update order status with version check
      const updated = await tx.order.updateMany({
        where: {
          id: params.orderId,
          version: order.version,
        },
        data: {
          status: "PAID",
          paymentMethod: "WALLET",
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new Error("OPTIMISTIC_LOCK_FAILED");
      }

      // Update coupon usage
      if (order.coupon_id) {
        await tx.coupon.update({
          where: { id: order.coupon_id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Create order event
      await tx.orderEvent.create({
        data: {
          orderId: params.orderId,
          type: "STATUS_CHANGE",
          fromStatus: "PENDING_PAYMENT",
          toStatus: "PAID",
          note: "Paid via wallet",
          createdBy: params.userId,
        },
      });

      return tx.order.findUnique({ where: { id: params.orderId } });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 15000,
    }
  );
}

// ─── Admin: Complete Order ────────────────────────────────────────────────────

export async function completeOrder(params: {
  orderId: string;
  adminId: string;
  proofUrl?: string;
  notes?: string;
}) {
  return db.$transaction(async (tx) => {
    // Optimistic lock
    const order = await tx.order.findUnique({
      where: { id: params.orderId },
      select: { status: true, version: true, userId: true },
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (!["PAID", "PROCESSING"].includes(order.status)) {
      throw new Error("ORDER_NOT_COMPLETABLE");
    }

    const updated = await tx.order.updateMany({
      where: { id: params.orderId, version: order.version },
      data: {
        status: "COMPLETED",
        fulfillmentStatus: "DELIVERED",
        proofUrl: params.proofUrl,
        adminNotes: params.notes,
        completedAt: new Date(),
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) throw new Error("OPTIMISTIC_LOCK_FAILED");

    await tx.orderEvent.create({
      data: {
        orderId: params.orderId,
        type: "STATUS_CHANGE",
        fromStatus: order.status,
        toStatus: "COMPLETED",
        note: params.notes || "Completed by admin",
        createdBy: params.adminId,
      },
    });

    // Create notification for customer
    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER_UPDATE",
        title: "টপআপ সম্পন্ন! ✅",
        body: `আপনার অর্ডার সফলভাবে ডেলিভারি হয়েছে।`,
        link: `/order/${params.orderId}`,
      },
    });

    // Queue job for email notification
    await tx.job.create({
      data: {
        type: "SEND_EMAIL",
        payload: {
          template: "ORDER_COMPLETED",
          orderId: params.orderId,
          userId: order.userId,
        },
      },
    });

    return tx.order.findUnique({ where: { id: params.orderId } });
  });
}

// ─── Refund Order ─────────────────────────────────────────────────────────────

export async function refundOrder(params: {
  orderId: string;
  adminId: string;
  reason: string;
}) {
  return db.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        select: {
          status: true,
          userId: true,
          finalPricePoisha: true,
          couponId: true,
          version: true,
        },
      });

      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (!["PAID", "PROCESSING", "FAILED"].includes(order.status)) {
        throw new Error("ORDER_NOT_REFUNDABLE");
      }

      const idempotencyKey = generateIdempotencyKey([
        "refund",
        params.orderId,
        params.adminId,
      ]);

      // Credit wallet
      const { creditWallet } = await import("./wallet-service");
      await creditWallet({
        userId: order.userId,
        amountPoisha: order.finalPricePoisha,
        type: "REFUND",
        orderId: params.orderId,
        referenceType: "ORDER",
        referenceId: params.orderId,
        note: `Refund for order. Reason: ${params.reason}`,
        idempotencyKey,
      });

      // Update order
      const updated = await tx.order.updateMany({
        where: { id: params.orderId, version: order.version },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          adminNotes: params.reason,
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) throw new Error("OPTIMISTIC_LOCK_FAILED");

      await tx.orderEvent.create({
        data: {
          orderId: params.orderId,
          type: "STATUS_CHANGE",
          fromStatus: order.status,
          toStatus: "REFUNDED",
          note: `Refund: ${params.reason}`,
          createdBy: params.adminId,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.userId,
          type: "WALLET_CREDIT",
          title: "রিফান্ড পেয়েছেন 💸",
          body: `আপনার অর্ডারের টাকা ওয়ালেটে ফেরত দেওয়া হয়েছে।`,
          link: `/wallet`,
        },
      });

      return tx.order.findUnique({ where: { id: params.orderId } });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 15000,
    }
  );
}

// ─── Admin: Claim Order ────────────────────────────────────────────────────────

export async function claimOrder(params: {
  orderId: string;
  adminId: string;
}) {
  const updated = await db.order.updateMany({
    where: {
      id: params.orderId,
      status: "PAID",
      assignedToId: null, // Only claim unassigned orders
    },
    data: {
      status: "PROCESSING",
      fulfillmentStatus: "PROCESSING",
      assignedToId: params.adminId,
      claimedAt: new Date(),
      version: { increment: 1 },
    },
  });

  if (updated.count === 0) {
    throw new Error("ORDER_ALREADY_CLAIMED");
  }

  await db.orderEvent.create({
    data: {
      orderId: params.orderId,
      type: "ASSIGNED",
      note: "Order claimed",
      createdBy: params.adminId,
    },
  });

  return db.order.findUnique({ where: { id: params.orderId } });
}

// ─── Expire pending orders ────────────────────────────────────────────────────

export async function expirePendingOrders() {
  const now = new Date();

  const expired = await db.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: now },
    },
    select: { id: true },
    take: 100,
  });

  if (expired.length === 0) return { expired: 0 };

  await db.order.updateMany({
    where: {
      id: { in: expired.map((o) => o.id) },
      status: "PENDING_PAYMENT",
    },
    data: { status: "EXPIRED" },
  });

  // Create events
  await db.orderEvent.createMany({
    data: expired.map((o) => ({
      orderId: o.id,
      type: "STATUS_CHANGE",
      fromStatus: "PENDING_PAYMENT",
      toStatus: "EXPIRED",
      note: "Auto-expired",
    })),
    skipDuplicates: true,
  });

  return { expired: expired.length };
}

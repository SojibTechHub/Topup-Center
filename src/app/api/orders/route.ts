import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrder, payOrderWithWallet } from "@/server/services/order-service";
import { createCharge, poishaToBdt } from "@/lib/payments/uddoktapay";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, playerFields, paymentMethod, couponCode, isGift, giftRecipient, giftMessage } = body;

    if (!packageId || !playerFields || typeof playerFields !== "object") {
      return NextResponse.json({ error: "INVALID_REQUEST_DATA" }, { status: 400 });
    }

    // 1. Create Order
    const order = await createOrder({
      userId: session.user.id,
      packageId,
      playerFields,
      couponCode,
      isGift,
      giftRecipient,
      giftMessage,
    });

    // 2. Process Payment
    if (paymentMethod === "WALLET") {
      await payOrderWithWallet({
        orderId: order.id,
        userId: session.user.id,
      });

      return NextResponse.json({
        success: true,
        order: { id: order.id, code: order.code, status: "PAID" },
      });
    } else {
      // UddoktaPay Direct Payment
      const amountBdt = poishaToBdt(order.finalPricePoisha);

      const payment = await db.payment.create({
        data: {
          userId: session.user.id,
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
        fullName: session.user.name || "Customer",
        email: session.user.email || "customer@example.com",
        amount: amountBdt,
        metadata: {
          orderId: order.id,
          paymentId: payment.id,
          userId: session.user.id,
          purpose: "ORDER_PAYMENT",
        },
        redirectUrl: `${env.APP_URL}/order/${order.code}?payment=success`,
        cancelUrl: `${env.APP_URL}/order/${order.code}?payment=cancelled`,
        webhookUrl: `${env.APP_URL}/api/payments/uddoktapay/webhook`,
      });

      if (!charge.status || !charge.payment_url) {
        return NextResponse.json(
          { error: charge.err || "Failed to initialize payment gateway" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        order: { id: order.id, code: order.code, status: "PENDING_PAYMENT" },
        paymentUrl: charge.payment_url,
      });
    }
  } catch (err: unknown) {
    console.error("Order creation API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 400 }
    );
  }
}

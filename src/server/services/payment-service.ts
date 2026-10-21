import { db } from "@/lib/db";
import {
  createCharge,
  verifyPayment,
  bdtToPoisha,
  poishaToBdt,
  validateWebhookApiKey,
} from "@/lib/payments/uddoktapay";
import { creditWallet } from "./wallet-service";
import { generateIdempotencyKey } from "@/lib/crypto";
import { env } from "@/lib/env";

// ─── Initiate Wallet Topup ────────────────────────────────────────────────────

export async function initiateWalletTopup(params: {
  userId: string;
  amountPoisha: bigint;
  userEmail: string;
  userName: string;
}) {
  if (params.amountPoisha < 10000n) {
    // Min ৳100
    throw new Error("MIN_AMOUNT_BDT_100");
  }
  if (params.amountPoisha > 1000000n) {
    // Max ৳10,000
    throw new Error("MAX_AMOUNT_BDT_10000");
  }

  const amountBdt = poishaToBdt(params.amountPoisha);

  // Create pending payment record
  const payment = await db.payment.create({
    data: {
      userId: params.userId,
      provider: "UDDOKTAPAY",
      purpose: "WALLET_TOPUP",
      amountPoisha: params.amountPoisha,
      feePoisha: 0n,
      chargedPoisha: params.amountPoisha,
      status: "INITIATED",
    },
  });

  const metadata = {
    paymentId: payment.id,
    userId: params.userId,
    purpose: "WALLET_TOPUP",
  };

  const charge = await createCharge({
    fullName: params.userName,
    email: params.userEmail,
    amount: amountBdt,
    metadata,
    redirectUrl: `${env.APP_URL}/api/payments/uddoktapay/callback?paymentId=${payment.id}`,
    cancelUrl: `${env.APP_URL}/wallet?cancelled=true`,
    webhookUrl: `${env.APP_URL}/api/payments/uddoktapay/webhook`,
  });

  if (!charge.status || !charge.payment_url) {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw new Error(charge.err || "Failed to create payment");
  }

  return {
    paymentId: payment.id,
    paymentUrl: charge.payment_url,
  };
}

// ─── Handle Callback ──────────────────────────────────────────────────────────

export async function handlePaymentCallback(params: {
  paymentId: string;
  invoiceId: string;
}) {
  // Verify with UddoktaPay API
  const verified = await verifyPayment(params.invoiceId);

  if (!verified.status || verified.payment_status !== "COMPLETED") {
    await db.payment.update({
      where: { id: params.paymentId },
      data: {
        invoiceId: params.invoiceId,
        status: verified.payment_status === "CANCELLED" ? "CANCELLED" : "FAILED",
      },
    });
    return { success: false, status: verified.payment_status };
  }

  return processVerifiedPayment({ paymentId: params.paymentId, verified });
}

// ─── Handle Webhook ───────────────────────────────────────────────────────────

export async function handlePaymentWebhook(params: {
  apiKey: string;
  invoiceId: string;
  rawPayload: Record<string, unknown>;
}) {
  if (!validateWebhookApiKey(params.apiKey)) {
    throw new Error("INVALID_API_KEY");
  }

  // Re-verify via API (never trust webhook payload alone)
  const verified = await verifyPayment(params.invoiceId);

  if (!verified.status || verified.payment_status !== "COMPLETED") {
    return { success: false };
  }

  // Find payment by invoice ID
  const existingPayment = await db.payment.findUnique({
    where: { invoiceId: params.invoiceId },
  });

  if (!existingPayment) {
    // Try to find by metadata in rawPayload
    const paymentId = params.rawPayload?.metadata as
      | Record<string, string>
      | undefined;
    if (!paymentId?.paymentId) {
      throw new Error("PAYMENT_NOT_FOUND");
    }
    return processVerifiedPayment({
      paymentId: paymentId.paymentId,
      verified,
      rawPayload: params.rawPayload,
    });
  }

  return processVerifiedPayment({
    paymentId: existingPayment.id,
    verified,
    rawPayload: params.rawPayload,
  });
}

// ─── Process verified payment ─────────────────────────────────────────────────

export async function processVerifiedPayment(params: {
  paymentId: string;
  verified: {
    payment_status?: string;
    invoice_id?: string;
    transaction_id?: string;
    payment_method?: string;
    sender_number?: string;
    amount?: number;
    fee?: number;
    charged_amount?: number;
    metadata?: Record<string, string>;
  };
  rawPayload?: Record<string, unknown>;
}) {
  const { paymentId, verified } = params;

  // Check idempotency — if payment already COMPLETED, skip
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      userId: true,
      purpose: true,
      amountPoisha: true,
    },
  });

  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (payment.status === "COMPLETED") {
    return { success: true, alreadyProcessed: true };
  }

  const feePoisha = bdtToPoisha(verified.fee || 0);
  const chargedPoisha = bdtToPoisha(verified.charged_amount || 0);

  // Update payment record
  await db.payment.update({
    where: { id: paymentId },
    data: {
      invoiceId: verified.invoice_id,
      transactionId: verified.transaction_id,
      method: verified.payment_method,
      senderNumber: verified.sender_number,
      feePoisha,
      chargedPoisha,
      status: "COMPLETED",
      rawPayload: (params.rawPayload ?? {}) as any,
      verifiedAt: new Date(),
    },
  });

  // Credit wallet (idempotent)
  if (payment.purpose === "WALLET_TOPUP") {
    const idempotencyKey = generateIdempotencyKey([
      "wallet_topup",
      paymentId,
      verified.invoice_id || "",
    ]);

    await creditWallet({
      userId: payment.userId,
      amountPoisha: payment.amountPoisha,
      type: "TOPUP",
      paymentId: payment.id,
      referenceType: "PAYMENT",
      referenceId: payment.id,
      note: `Wallet top-up via ${verified.payment_method || "UddoktaPay"}`,
      idempotencyKey,
    });
  }

  return { success: true };
}

// ─── Manual Topup Request ─────────────────────────────────────────────────────

export async function submitManualTopup(params: {
  userId: string;
  provider: string;
  senderNumber: string;
  trxId: string;
  amountPoisha: bigint;
  screenshotUrl?: string;
}) {
  if (params.amountPoisha < 5000n) {
    // Min ৳50
    throw new Error("MIN_AMOUNT_BDT_50");
  }

  // Check for duplicate TrxID from same user
  const duplicate = await db.manualTopup.findFirst({
    where: { userId: params.userId, trxId: params.trxId },
  });

  if (duplicate) {
    throw new Error("DUPLICATE_TRX_ID");
  }

  const topup = await db.manualTopup.create({
    data: {
      userId: params.userId,
      provider: params.provider,
      senderNumber: params.senderNumber,
      trxId: params.trxId,
      amountPoisha: params.amountPoisha,
      screenshotUrl: params.screenshotUrl,
    },
  });

  return topup;
}

// ─── Admin: Approve Manual Topup ──────────────────────────────────────────────

export async function approveManualTopup(params: {
  topupId: string;
  adminId: string;
}) {
  const topup = await db.manualTopup.findUnique({
    where: { id: params.topupId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!topup) throw new Error("TOPUP_NOT_FOUND");
  if (topup.status !== "PENDING") throw new Error("TOPUP_NOT_PENDING");

  const idempotencyKey = generateIdempotencyKey([
    "manual_topup",
    params.topupId,
    params.adminId,
  ]);

  await creditWallet({
    userId: topup.userId,
    amountPoisha: topup.amountPoisha,
    type: "TOPUP",
    referenceType: "MANUAL_TOPUP",
    referenceId: topup.id,
    note: `ম্যানুয়াল টপআপ (${topup.provider}): ${topup.trxId}`,
    idempotencyKey,
  });

  await db.manualTopup.update({
    where: { id: params.topupId },
    data: {
      status: "APPROVED",
      reviewedBy: params.adminId,
      reviewedAt: new Date(),
    },
  });

  return { success: true };
}

export async function rejectManualTopup(params: {
  topupId: string;
  adminId: string;
  reason: string;
}) {
  const topup = await db.manualTopup.findUnique({
    where: { id: params.topupId },
  });

  if (!topup) throw new Error("TOPUP_NOT_FOUND");
  if (topup.status !== "PENDING") throw new Error("TOPUP_NOT_PENDING");

  await db.manualTopup.update({
    where: { id: params.topupId },
    data: {
      status: "REJECTED",
      adminNote: params.reason,
      reviewedBy: params.adminId,
      reviewedAt: new Date(),
    },
  });

  return { success: true };
}

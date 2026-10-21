"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/db.ts
var import_client, createPrismaClient, db;
var init_db = __esm({
  "src/lib/db.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    createPrismaClient = () => {
      return new import_client.PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
      });
    };
    db = globalThis.prismaGlobal ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalThis.prismaGlobal = db;
    }
  }
});

// src/lib/env.ts
function getEnv() {
  return {
    // App
    APP_URL: process.env.APP_URL || "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    // Auth
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",
    // Google OAuth (optional)
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    // UddoktaPay
    UDDOKTAPAY_BASE_URL: process.env.UDDOKTAPAY_BASE_URL || "https://sandbox.uddoktapay.com",
    UDDOKTAPAY_API_KEY: process.env.UDDOKTAPAY_API_KEY || "",
    // Upstash Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    // Resend
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || "Topup Center <noreply@topupcenter.com>",
    // Telegram
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
    // Blob storage
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    // Cron
    CRON_SECRET: process.env.CRON_SECRET,
    // Encryption
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    // AI Keys
    GEMINI_API_KEY_1: process.env.GEMINI_API_KEY_1,
    GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2,
    GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3,
    GEMINI_API_KEY_4: process.env.GEMINI_API_KEY_4,
    GROK_API_KEY_1: process.env.GROK_API_KEY_1,
    GROK_API_KEY_2: process.env.GROK_API_KEY_2,
    GROK_API_KEY_3: process.env.GROK_API_KEY_3,
    GROK_API_KEY_4: process.env.GROK_API_KEY_4,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    GROK_MODEL: process.env.GROK_MODEL || "grok-4",
    AI_PRIMARY: process.env.AI_PRIMARY || "gemini",
    // Feature Flags
    FEATURE_AI: process.env.FEATURE_AI !== "false",
    FEATURE_REFERRAL: process.env.FEATURE_REFERRAL !== "false",
    FEATURE_REVIEWS: process.env.FEATURE_REVIEWS !== "false",
    FEATURE_GIFT_TOPUP: process.env.FEATURE_GIFT_TOPUP !== "false",
    FEATURE_MANUAL_TOPUP: process.env.FEATURE_MANUAL_TOPUP !== "false",
    // Supplier
    SUPPLIER_MODE: process.env.SUPPLIER_MODE || "MANUAL",
    // Monitoring
    SENTRY_DSN: process.env.SENTRY_DSN
  };
}
var env, isDev, isProd;
var init_env = __esm({
  "src/lib/env.ts"() {
    "use strict";
    env = getEnv();
    isDev = env.NODE_ENV === "development";
    isProd = env.NODE_ENV === "production";
  }
});

// src/lib/crypto.ts
function generateIdempotencyKey(parts) {
  return import_crypto.default.createHash("sha256").update(parts.join(":")).digest("hex");
}
var import_argon2, import_crypto;
var init_crypto = __esm({
  "src/lib/crypto.ts"() {
    "use strict";
    import_argon2 = require("@node-rs/argon2");
    import_crypto = __toESM(require("crypto"));
    init_env();
  }
});

// src/server/services/wallet-service.ts
async function creditWallet(params) {
  return db.$transaction(
    async (tx) => {
      const existing = await tx.walletTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey }
      });
      if (existing) {
        return existing;
      }
      const user = await tx.$queryRaw`
        SELECT wallet_balance_poisha 
        FROM users 
        WHERE id = ${params.userId}
        FOR UPDATE
      `;
      if (!user[0]) {
        throw new Error(`User ${params.userId} not found`);
      }
      const currentBalance = BigInt(user[0].wallet_balance_poisha);
      const newBalance = currentBalance + params.amountPoisha;
      await tx.user.update({
        where: { id: params.userId },
        data: { walletBalancePoisha: newBalance }
      });
      const transaction = await tx.walletTransaction.create({
        data: {
          userId: params.userId,
          orderId: params.orderId,
          paymentId: params.paymentId,
          type: params.type,
          amountPoisha: params.amountPoisha,
          balanceAfterPoisha: newBalance,
          idempotencyKey: params.idempotencyKey,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          note: params.note
        }
      });
      return transaction;
    },
    {
      isolationLevel: import_client2.Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5e3,
      timeout: 1e4
    }
  );
}
var import_client2;
var init_wallet_service = __esm({
  "src/server/services/wallet-service.ts"() {
    "use strict";
    init_db();
    init_crypto();
    import_client2 = require("@prisma/client");
  }
});

// src/worker/index.ts
init_db();
var import_client4 = require("@prisma/client");

// src/server/services/order-service.ts
init_db();
init_crypto();
init_wallet_service();
var import_client3 = require("@prisma/client");
async function expirePendingOrders() {
  const now = /* @__PURE__ */ new Date();
  const expired = await db.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: now }
    },
    select: { id: true },
    take: 100
  });
  if (expired.length === 0) return { expired: 0 };
  await db.order.updateMany({
    where: {
      id: { in: expired.map((o) => o.id) },
      status: "PENDING_PAYMENT"
    },
    data: { status: "EXPIRED" }
  });
  await db.orderEvent.createMany({
    data: expired.map((o) => ({
      orderId: o.id,
      type: "STATUS_CHANGE",
      fromStatus: "PENDING_PAYMENT",
      toStatus: "EXPIRED",
      note: "Auto-expired"
    })),
    skipDuplicates: true
  });
  return { expired: expired.length };
}

// src/worker/jobs/expire-orders.ts
async function processExpireOrdersJob() {
  try {
    const result = await expirePendingOrders();
    if (result.expired > 0) {
      console.log(`[Worker:ExpireOrders] Expired ${result.expired} stale orders.`);
    }
    return result.expired;
  } catch (error) {
    console.error("[Worker:ExpireOrders] Error expiring orders:", error);
    throw error;
  }
}

// src/lib/mail.ts
var import_resend = require("resend");
init_env();
var resend = new import_resend.Resend(env.RESEND_API_KEY);
async function sendEmail(options) {
  if (!env.RESEND_API_KEY) {
    console.warn("Resend API key not configured, skipping email");
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

// src/worker/jobs/send-email.ts
async function processSendEmailJob(payload) {
  if (!payload || !payload.to || !payload.subject || !payload.html) {
    throw new Error("Invalid email payload: missing 'to', 'subject', or 'html'");
  }
  const success = await sendEmail({
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
  if (!success) {
    throw new Error(`Failed to deliver email to ${payload.to}`);
  }
  return true;
}

// src/worker/jobs/reconcile-payments.ts
init_db();

// src/lib/payments/uddoktapay.ts
init_env();
var UDDOKTAPAY_BASE_URL = env.UDDOKTAPAY_BASE_URL;
var API_KEY = env.UDDOKTAPAY_API_KEY;
async function uddoktaRequest(endpoint, body) {
  const url = `${UDDOKTAPAY_BASE_URL}/api/${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": API_KEY
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(
      `UddoktaPay API error: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
async function verifyPayment(invoiceId) {
  return uddoktaRequest("verify-payment", {
    invoice_id: invoiceId
  });
}
function bdtToPoisha(bdt) {
  return BigInt(Math.round(bdt * 100));
}

// src/server/services/payment-service.ts
init_db();
init_wallet_service();
init_crypto();
init_env();
async function processVerifiedPayment(params) {
  const { paymentId, verified } = params;
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      userId: true,
      purpose: true,
      amountPoisha: true
    }
  });
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (payment.status === "COMPLETED") {
    return { success: true, alreadyProcessed: true };
  }
  const feePoisha = bdtToPoisha(verified.fee || 0);
  const chargedPoisha = bdtToPoisha(verified.charged_amount || 0);
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
      rawPayload: params.rawPayload ?? {},
      verifiedAt: /* @__PURE__ */ new Date()
    }
  });
  if (payment.purpose === "WALLET_TOPUP") {
    const idempotencyKey = generateIdempotencyKey([
      "wallet_topup",
      paymentId,
      verified.invoice_id || ""
    ]);
    await creditWallet({
      userId: payment.userId,
      amountPoisha: payment.amountPoisha,
      type: "TOPUP",
      paymentId: payment.id,
      referenceType: "PAYMENT",
      referenceId: payment.id,
      note: `Wallet top-up via ${verified.payment_method || "UddoktaPay"}`,
      idempotencyKey
    });
  }
  return { success: true };
}

// src/worker/jobs/reconcile-payments.ts
async function processReconcilePaymentsJob() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1e3);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const stuckPayments = await db.payment.findMany({
    where: {
      status: { in: ["INITIATED", "PENDING"] },
      invoiceId: { not: null },
      createdAt: {
        gte: twentyFourHoursAgo,
        lte: tenMinutesAgo
      }
    },
    take: 50
  });
  let reconciledCount = 0;
  for (const payment of stuckPayments) {
    if (!payment.invoiceId) continue;
    try {
      const verified = await verifyPayment(payment.invoiceId);
      if (verified.status && verified.payment_status === "COMPLETED") {
        await processVerifiedPayment({
          paymentId: payment.id,
          verified
        });
        reconciledCount++;
        console.log(`[Worker:Reconcile] Successfully reconciled payment: ${payment.id} (Invoice: ${payment.invoiceId})`);
      } else if (verified.payment_status === "CANCELLED" || verified.payment_status === "FAILED") {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: verified.payment_status === "CANCELLED" ? "CANCELLED" : "FAILED" }
        });
      }
    } catch (err) {
      console.error(`[Worker:Reconcile] Error checking invoice ${payment.invoiceId}:`, err);
    }
  }
  return { checked: stuckPayments.length, reconciled: reconciledCount };
}

// src/worker/jobs/retry-jobs.ts
init_db();
async function processRetryJobsJob() {
  const maxAttempts = 5;
  const now = /* @__PURE__ */ new Date();
  const failedJobs = await db.job.findMany({
    where: {
      status: "FAILED",
      attempts: { lt: maxAttempts }
    },
    take: 50
  });
  let resetCount = 0;
  for (const job of failedJobs) {
    const backoffSeconds = Math.pow(2, job.attempts) * 60;
    const retryAfter = new Date(job.updatedAt.getTime() + backoffSeconds * 1e3);
    if (now >= retryAfter) {
      await db.job.update({
        where: { id: job.id },
        data: {
          status: "PENDING",
          error: null,
          lockedAt: null,
          lockedBy: null
        }
      });
      resetCount++;
    }
  }
  if (resetCount > 0) {
    console.log(`[Worker:RetryJobs] Rescheduled ${resetCount} failed jobs for retry.`);
  }
  return resetCount;
}

// src/worker/index.ts
var WORKER_ID = `worker-${process.pid}-${Math.random().toString(36).substring(2, 7)}`;
var isRunning = true;
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`
[Worker] Received ${signal}. Shutting down gracefully...`);
    isRunning = false;
    try {
      await db.job.updateMany({
        where: { lockedBy: WORKER_ID, status: import_client4.JobStatus.RUNNING },
        data: { status: import_client4.JobStatus.PENDING, lockedAt: null, lockedBy: null }
      });
      console.log("[Worker] Released all acquired locks.");
    } catch (e) {
      console.error("[Worker] Error releasing locks during shutdown:", e);
    }
    await db.$disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
async function processNextJobs() {
  try {
    const claimedJobs = await db.$transaction(async (tx) => {
      const jobs = await tx.$queryRaw`
        SELECT id FROM jobs
        WHERE status = 'PENDING' AND "runAt" <= NOW()
        ORDER BY "runAt" ASC
        LIMIT 5
        FOR UPDATE SKIP LOCKED
      `;
      if (!jobs || jobs.length === 0) return [];
      const jobIds = jobs.map((j) => j.id);
      await tx.job.updateMany({
        where: { id: { in: jobIds } },
        data: {
          status: import_client4.JobStatus.RUNNING,
          lockedAt: /* @__PURE__ */ new Date(),
          lockedBy: WORKER_ID,
          attempts: { increment: 1 }
        }
      });
      return tx.job.findMany({
        where: { id: { in: jobIds } }
      });
    });
    for (const job of claimedJobs) {
      console.log(`[Worker] Executing job ${job.id} (${job.type}), attempt ${job.attempts}`);
      try {
        switch (job.type) {
          case "SEND_EMAIL":
            await processSendEmailJob(job.payload);
            break;
          case "EXPIRE_ORDERS":
            await processExpireOrdersJob();
            break;
          case "RECONCILE_PAYMENTS":
            await processReconcilePaymentsJob();
            break;
          case "RETRY_JOBS":
            await processRetryJobsJob();
            break;
          default:
            console.warn(`[Worker] Unknown job type: ${job.type}`);
        }
        await db.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            lockedAt: null,
            lockedBy: null,
            error: null
          }
        });
        console.log(`[Worker] Job ${job.id} completed successfully.`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[Worker] Job ${job.id} failed:`, errorMsg);
        await db.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: errorMsg,
            lockedAt: null,
            lockedBy: null
          }
        });
      }
    }
  } catch (error) {
    console.error("[Worker] Polling error:", error.message);
  }
}
async function startWorker() {
  console.log(`====================================================`);
  console.log(`\u{1F680} Topup Center Background Worker Started`);
  console.log(`   Worker ID: ${WORKER_ID}`);
  console.log(`   Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`====================================================`);
  setupGracefulShutdown();
  let lastExpire = 0;
  let lastReconcile = 0;
  let lastRetry = 0;
  let lastHeartbeat = Date.now();
  while (isRunning) {
    const now = Date.now();
    await processNextJobs();
    if (now - lastExpire >= 60 * 1e3) {
      lastExpire = now;
      try {
        await processExpireOrdersJob();
      } catch (e) {
        console.error("[Worker:Periodic] Expire orders failed:", e.message);
      }
    }
    if (now - lastReconcile >= 5 * 60 * 1e3) {
      lastReconcile = now;
      try {
        await processReconcilePaymentsJob();
      } catch (e) {
        console.error("[Worker:Periodic] Reconcile payments failed:", e.message);
      }
    }
    if (now - lastRetry >= 2 * 60 * 1e3) {
      lastRetry = now;
      try {
        await processRetryJobsJob();
      } catch (e) {
        console.error("[Worker:Periodic] Retry jobs failed:", e.message);
      }
    }
    if (now - lastHeartbeat >= 10 * 60 * 1e3) {
      lastHeartbeat = now;
      console.log(`[Worker Heartbeat] ${(/* @__PURE__ */ new Date()).toISOString()} - Worker ${WORKER_ID} is alive & healthy.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3e3));
  }
}
startWorker().catch((err) => {
  console.error("[Worker] Fatal startup error:", err);
  process.exit(1);
});

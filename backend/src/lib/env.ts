import { z } from "zod";

// Manual env validation without @t3-oss/env-nextjs
function getEnv() {
  return {
    // App
    APP_URL: process.env.APP_URL || "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",

    // Database
    DATABASE_URL: process.env.DATABASE_URL!,
    DIRECT_URL: process.env.DIRECT_URL,

    // Auth
    AUTH_SECRET: process.env.AUTH_SECRET!,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",

    // Google OAuth (optional)
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    // UddoktaPay
    UDDOKTAPAY_BASE_URL:
      process.env.UDDOKTAPAY_BASE_URL || "https://sandbox.uddoktapay.com",
    UDDOKTAPAY_API_KEY: process.env.UDDOKTAPAY_API_KEY || "",

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

    // Resend
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM:
      process.env.EMAIL_FROM || "Topup Center <noreply@topupcenter.com>",

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
    AI_PRIMARY: (process.env.AI_PRIMARY || "gemini") as "gemini" | "grok",

    // Feature Flags
    FEATURE_AI: process.env.FEATURE_AI !== "false",
    FEATURE_REFERRAL: process.env.FEATURE_REFERRAL !== "false",
    FEATURE_REVIEWS: process.env.FEATURE_REVIEWS !== "false",
    FEATURE_GIFT_TOPUP: process.env.FEATURE_GIFT_TOPUP !== "false",
    FEATURE_MANUAL_TOPUP: process.env.FEATURE_MANUAL_TOPUP !== "false",

    // Supplier
    SUPPLIER_MODE: process.env.SUPPLIER_MODE || "MANUAL",

    // Monitoring
    SENTRY_DSN: process.env.SENTRY_DSN,
  };
}

export const env = getEnv();

export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";

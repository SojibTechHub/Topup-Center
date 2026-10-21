# Topup Center — Production Deployment Guide

## 1. Prerequisites Checklist

- **Neon PostgreSQL**: Free or Paid project in Singapore (`ap-southeast-1`).
- **Upstash Redis**: Free or Paid database in Singapore (`ap-southeast-1`).
- **Vercel Pro Account**: Required for commercial payment processing websites.
- **Render Starter Account**: $7/mo paid instance for the non-sleeping background worker.
- **UddoktaPay Merchant Account**: Approved business account with API Key.
- **Resend**: Domain verified with SPF, DKIM, and DMARC records.
- **Telegram Bot**: Bot token from @BotFather + Admin Chat ID.

---

## 2. Database Setup (Neon PostgreSQL)

1. Create a project in Singapore.
2. In the Neon Console, copy both the **Pooled Connection String** (port 6543) and the **Direct Connection String** (port 5432).
3. Set in your `.env.local` / deployment environment:
   ```env
   DATABASE_URL="postgres://user:pass@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgres://user:pass@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
4. Run migrations and seed data:
   ```bash
   npm run db:deploy
   npm run db:seed
   ```

---

## 3. Vercel Web Deployment

1. Import your GitHub repository to Vercel.
2. Set Framework Preset: **Next.js**.
3. Set Root Directory: `./`.
4. Build Command: `npx prisma generate && npm run build`.
5. Output Directory: `.next`.
6. Set the Region to **Singapore (sin1)** to minimize database latency.
7. Configure all environment variables from `.env.example`.
8. Once deployed, set your UddoktaPay Webhook URL to:
   `https://www.yourdomain.com/api/payments/uddoktapay/webhook`

---

## 4. Render Background Worker Deployment

1. In Render, select **New +** → **Background Worker**.
2. Connect your GitHub repository.
3. Set the Region to **Singapore**.
4. Configure Build and Start commands:
   - **Build Command**: `npm ci && npx prisma generate && npm run build:worker`
   - **Start Command**: `node dist/worker/index.js`
5. Set Plan to **Starter** ($7/mo) so it never spins down or idles.
6. Copy the identical database, Redis, Resend, and AI environment variables.
7. Deploy the worker and inspect the logs:
   ```
   🚀 Topup Center Background Worker Started
      Worker ID: worker-1-abcde
   ```

---

## 5. UddoktaPay Webhook Setup

1. Log into your UddoktaPay merchant portal.
2. Navigate to **API Settings** / **Webhooks**.
3. Set the Webhook URL to:
   `https://www.yourdomain.com/api/payments/uddoktapay/webhook`
4. Copy your `API_KEY` into `UDDOKTAPAY_API_KEY`.
5. Test with sandbox: `https://sandbox.uddoktapay.com`.
6. Switch to Live by updating `UDDOKTAPAY_BASE_URL` to `https://pay.uddoktapay.com` once business approval is granted.

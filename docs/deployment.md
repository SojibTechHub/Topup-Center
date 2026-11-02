# Topup Center — Production Deployment Guide

## 1. Prerequisites Checklist

- **Neon PostgreSQL**: Free or Paid project in Singapore (`ap-southeast-1`).
- **Upstash Redis**: Free or Paid database in Singapore (`ap-southeast-1`).
- **Vercel Pro Account**: Next.js 15 Frontend Storefront & Admin Portal.
- **Render Starter Account**: $7/mo paid web service for Express REST API + $7/mo for non-sleeping Background Worker.
- **UddoktaPay Merchant Account**: Approved business account with API Key.
- **Resend**: Domain verified with SPF, DKIM, and DMARC records.
- **Telegram Bot**: Bot token from @BotFather + Admin Chat ID.

---

## 2. Database Setup (Neon PostgreSQL)

1. Create a project in Singapore.
2. In the Neon Console, copy both the **Pooled Connection String** (port 6543) and the **Direct Connection String** (port 5432).
3. Set in your `backend/.env` / deployment environment:
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

## 3. Render Backend Deployment (`backend/`)

### A. Web Service (Express REST API)
1. In Render, select **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Region**: Singapore
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `node dist/server.js`
4. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `UDDOKTAPAY_API_KEY`, etc.
5. Your API will be live at: `https://api.yourdomain.com` (or `https://your-service.onrender.com`).

### B. Background Worker
1. Select **New +** → **Background Worker**.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `node dist/worker/index.js`
   - **Plan**: Starter ($7/mo)

---

## 4. Vercel Frontend Deployment (`frontend/`)

1. Import your GitHub repository to Vercel.
2. Set **Root Directory**: `frontend`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables:
   - `BACKEND_URL`: `https://api.yourdomain.com` (your Render backend API URL).
5. Build Command: `npm run build`.
6. Once deployed, set your UddoktaPay Webhook URL to:
   `https://api.yourdomain.com/api/payments/uddoktapay/webhook`

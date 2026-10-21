# ⚡ Topup Center — Game Top-Up Marketplace

> **Production-Ready Full-Stack Game Top-Up Marketplace for Bangladesh**  
> Built with Next.js 15 App Router, PostgreSQL + Prisma, Auth.js v5, UddoktaPay, Neon, Upstash Redis, Resend, Telegram Bot, Gemini & Grok Multi-Key Pool, and Render Background Worker.

---

## 🎮 Key Features

### Customer
- **Authentication**: Email/phone registration, Argon2id hashing, email verification (Resend), forgot/reset password, optional Google OAuth.
- **Game Catalog**: Browse Free Fire, PUBG Mobile UC, Mobile Legends, Clash of Clans, DLS, Roblox, Steam Wallet, and Google Play Gift Cards.
- **Top-up Flow**: Dynamic player ID fields with live regex validation, saved player IDs, coupon discounts (`WELCOME50`, `HOT10`).
- **Wallet System**: 1-click checkout with wallet balance, instant top-up via UddoktaPay, and manual bKash/Nagad/Rocket TrxID fallback with AI screenshot auto-fill.
- **Order Tracking**: Live visual timeline (`PENDING_PAYMENT` → `PAID` → `PROCESSING` → `COMPLETED` / `REFUNDED`), delivery proof view, and support ticket creation.
- **Theme**: "Neon Bazaar" dark gaming vault UI (`#070A12` with electric cyan `#22D3EE` & lime `#A3E635`), Bangla-first language, mobile-first PWA.

### Admin Mission Control (`/admin`)
- **Dashboard**: Real-time revenue, today's orders, pending queue count, active customers.
- **Order Queue**: Claim orders, copy player UID in 1 click, complete order with delivery proof, or refund failed orders to customer's wallet.
- **Catalog Management**: Games and packages CRUD with cost price, sell price, and real-time margin profit analytics.
- **User Management**: User search, ban/unban toggle, and wallet balance adjustments with required reason & audit logging.
- **Payments & Reconciliation**: UddoktaPay transaction logs and manual TrxID approval/rejection queue.
- **AI Insights**: Gemini ×4 and Grok ×4 key pool health monitoring, cooldown status, and token usage logs.

---

## 🛠️ Tech Stack & Architecture

- **Web Application**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide Icons.
- **Database**: Neon Serverless PostgreSQL with Prisma ORM.
- **Background Worker**: Dedicated standalone process polling the `Job` table with `FOR UPDATE SKIP LOCKED`.
- **Cache & Rate Limiting**: Upstash Redis (sliding window rate limits + AI key cooldowns).
- **Payment Gateway**: UddoktaPay (bKash, Nagad, Rocket, Cards) + Manual TrxID.
- **Email & Alerts**: Resend (transactional emails) + Telegram Bot (admin notifications).
- **AI Key Pool**: 4 Gemini + 4 Grok API keys with automatic round-robin & 429/5xx failover.

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
cd c:\projects\Topup-Center
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your database URL (Neon), Redis credentials (Upstash), Auth secret, UddoktaPay key, and AI keys.

### 3. Initialize Database & Seed
```bash
# Push schema migrations
npm run db:deploy

# Seed 8 games, packages, demo users, and settings
npm run db:seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Next.js Web App
npm run dev

# Terminal 2: Render Background Worker
npm run worker:dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@topupcenter.com` | `Admin@123456` |
| **Demo Customer** | `customer@example.com` | `Customer@123` |

---

## 🧪 Testing & Verification

```bash
# Run unit test suite (Money rules, state machine, webhook idempotency)
npm run test

# Run TypeScript typecheck across entire codebase
npm run typecheck

# Run linter
npm run lint

# Build standalone background worker bundle
npm run build:worker
```

---

## 📚 Documentation
- [System Architecture](docs/architecture.md)
- [Production Deployment Guide](docs/deployment.md)
- [Operational Runbook](docs/runbook.md)

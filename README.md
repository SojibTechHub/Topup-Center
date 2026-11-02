# ⚡ Topup Center — Game Top-Up Marketplace

> **Production-Ready Decoupled Architecture Game Top-Up Marketplace for Bangladesh**  
> Built with Next.js 15 App Router (Frontend) + Express.js & TypeScript (Backend) + PostgreSQL & Prisma + UddoktaPay, Neon, Upstash Redis, Resend, Telegram Bot, Gemini & Grok Multi-Key Pool, and Render Background Worker.

---

## 🏗️ Architecture & Monorepo Structure

```
Topup-Center/
├── backend/                  # REST API & Database & Background Worker (Port 5000)
│   ├── prisma/               # Database schema & seed scripts
│   ├── src/
│   │   ├── routes/           # Auth, Catalog, Orders, Wallet, Admin, Payments, AI, Support, Cron
│   │   ├── services/         # Order, Payment, and Wallet domain services
│   │   ├── middleware/       # JWT authentication & RBAC role guards
│   │   ├── worker/           # Standalone background worker (order expiry, reconciliation, email)
│   │   ├── lib/              # Database (Prisma), Redis, UddoktaPay, Telegram, Mail, AI pool
│   │   ├── app.ts            # Express app configuration (CORS, cookies, JSON parser)
│   │   └── server.ts         # Express HTTP listener
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Customer Storefront & Admin Mission Control (Port 3000)
│   ├── public/               # Game cover artwork, payment badges (bKash, Nagad, Rocket)
│   ├── src/
│   │   ├── app/              # Next.js 15 App Router (Storefront, Customer Portal, Admin Panel)
│   │   ├── components/       # Neon Bazaar glassmorphism UI components
│   │   └── lib/              # API proxy client, JWT auth helpers, money formatter
│   ├── next.config.ts        # Transparent proxy rewrites `/api/*` -> Backend
│   ├── package.json
│   └── tsconfig.json
│
├── tests/                    # Vitest unit test suite (Money rules, state machine, idempotency)
├── package.json              # Monorepo workspaces coordinator
└── render.yaml               # Cloud deployment blueprint (Web API + Worker)
```

---

## 🎮 Key Features

### Customer
- **Authentication**: Email/phone registration, Argon2id/bcrypt hashing, email verification, forgot/reset password.
- **Game Catalog**: Free Fire, PUBG Mobile UC, Mobile Legends, Clash of Clans, DLS, Roblox, Steam Wallet, Google Play.
- **Top-up Flow**: Dynamic player ID fields with live regex validation, saved player IDs, coupon discounts (`WELCOME50`, `HOT10`).
- **Wallet System**: 1-click checkout with wallet balance, instant top-up via UddoktaPay, and manual bKash/Nagad/Rocket TrxID fallback with AI screenshot auto-fill.
- **Order Tracking**: Live visual timeline (`PENDING_PAYMENT` → `PAID` → `PROCESSING` → `COMPLETED` / `REFUNDED`), delivery proof view, support ticket creation.
- **Theme**: "Neon Bazaar" dark gaming vault UI (`#070A12` with electric cyan `#22D3EE` & lime `#A3E635`), Bangla-first language, mobile-first PWA.

### Admin Mission Control (`/admin`)
- **Dashboard**: Real-time revenue, today's orders, pending queue count, active customers.
- **Order Queue**: Claim orders, copy player UID in 1 click, complete order with delivery proof, or refund failed orders to customer's wallet.
- **Catalog Management**: Games and packages CRUD with cost price, sell price, and real-time margin profit analytics.
- **User Management**: User search, ban/unban toggle, and wallet balance adjustments with required reason & audit logging.
- **Payments & Reconciliation**: UddoktaPay transaction logs and manual TrxID approval/rejection queue.
- **AI Insights**: Gemini ×4 and Grok ×4 key pool health monitoring, cooldown status, and token usage logs.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
- Backend: Copy `backend/.env.example` to `backend/.env`
- Frontend: Copy `frontend/.env.example` to `frontend/.env.local`

### 3. Initialize Database & Seed
```bash
# Push schema migrations
npm run db:deploy

# Seed 8 games, packages, demo users, and settings
npm run db:seed
```

### 4. Run Development Servers
```bash
# Run both Backend (Port 5000) and Frontend (Port 3000) concurrently:
npm run dev

# Or run separately:
npm run dev:backend    # Backend on http://localhost:5000
npm run dev:frontend   # Frontend on http://localhost:3000
npm run worker:dev     # Background worker
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
# Run unit test suite
npm test

# Run TypeScript typecheck across entire monorepo
npm run typecheck

# Build both backend and frontend for production
npm run build
```

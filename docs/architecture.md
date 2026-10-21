# Topup Center — System Architecture

## 1. High-Level Architecture Overview

Topup Center is a production-ready game top-up marketplace designed specifically for the Bangladeshi market. It adopts a hybrid deployment model:
- **Vercel (Next.js 15 App Router)**: Edge-served customer storefront, mission control admin panel, Auth.js v5 session handling, and webhook endpoints that are always online with zero cold starts.
- **Render Background Worker**: A dedicated Node.js worker process in Singapore that polls the PostgreSQL `Job` table with `FOR UPDATE SKIP LOCKED`, handles background order expiration, automated payment reconciliation, email retries, and AI OCR processing.
- **Neon PostgreSQL**: Serverless PostgreSQL database with pooled and direct connection strings.
- **Upstash Redis**: Ultra-low-latency in-memory cache for rate-limiting, login protection, and AI key cooldowns.
- **AI Key Pool**: Multi-key round-robin pool with 4 Gemini and 4 Grok API keys with automatic failover on 429/5xx status codes and 60-second cooldowns.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Customer / Admin Browser                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Vercel — Next.js 15 App Router (sin1)              │
│  ├─ Customer Storefront & Catalog                              │
│  ├─ Admin Panel (/admin Mission Control)                        │
│  ├─ Auth.js v5 (Database Sessions + Argon2id + 2FA)             │
│  ├─ Server Actions & REST API Routes                            │
│  └─ UddoktaPay Webhook / Callback Handler (Always-Online)      │
└────────────┬─────────────┬─────────────┬────────────┬───────────┘
             │             │             │            │
             ▼             ▼             ▼            ▼
      ┌───────────┐ ┌─────────────┐ ┌─────────┐ ┌───────────────┐
      │ Neon DB   │ │Upstash Redis│ │ Resend  │ │AI Pool (4G+4X)│
      │(Postgres) │ │(Rate Limit) │ │ (Email) │ │Gemini & Grok  │
      └─────▲─────┘ └─────────────┘ └─────────┘ └───────────────┘
            │
            │ Polling Job Table with FOR UPDATE SKIP LOCKED
            │
┌───────────┴─────────────────────────────────────────────────────┐
│              Render — Background Worker (Singapore)             │
│  ├─ Order Expiration (15-min unpaid order auto-cancel)          │
│  ├─ Payment Reconciliation (UddoktaPay verify-payment sync)     │
│  ├─ Email / Telegram Delivery Retries                           │
│  └─ OCR & Async Background Jobs                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. The Flow of Money (Ledger Rules)

1. **Integer Poisha Only**: All monetary amounts are stored as 64-bit integer poisha (`BigInt` in Prisma/TypeScript). There are NO floating-point numbers in financial database fields (৳100 = 10,000 poisha).
2. **Server-Side Price Calculation**: Client-submitted prices are strictly ignored. All package prices, coupon discounts, and wallet balances are looked up directly from the database inside ACID transactions.
3. **Double-Spend & Concurrency Protection**:
   - `WalletTransaction` entries use unique `idempotencyKey` values.
   - Wallet updates use `Serializable` transaction isolation with row-level locks (`SELECT ... FOR UPDATE`).
   - Wallet balances can never go below zero.
4. **Optimistic Locking on Orders**:
   - Orders include a numeric `version` column.
   - State mutations check `WHERE id = ? AND version = ?`, preventing race conditions where two admins claim or process the same order simultaneously.
5. **Refunds are Store Credit**:
   - Failed or cancelled orders refund directly to the customer's Topup Center Wallet.

---

## 3. Order Lifecycle State Machine

```
PENDING_PAYMENT ──────────────► PAID ──────────────► PROCESSING ──────────────► COMPLETED
      │                           │                         │
      ├──────► EXPIRED (15 min)   ├──────► FAILED           ├──────► FAILED
      │                           │           │             │           │
      └──────► CANCELLED          │           ▼             │           ▼
                                  └────► REFUNDED (Wallet)  └────► REFUNDED (Wallet)
```

---

## 4. Multi-AI Key Pool Engine

The key pool (`src/lib/ai/key-pool.ts`) manages:
- **4 Gemini Flash API Keys** (`GEMINI_API_KEY_1..4`)
- **4 Grok 4 API Keys** (`GROK_API_KEY_1..4`)

**Failover Behavior:**
1. Picks the least-used available key that is not in cooldown.
2. If the API returns HTTP 429 (quota exceeded), 5xx (server error), or times out (30s), Upstash Redis records a 60-second cooldown for that key.
3. Automatically falls back to the next key or secondary provider.
4. Every call is audited in the `AiUsageLog` database table.

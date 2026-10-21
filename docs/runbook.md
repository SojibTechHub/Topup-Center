# Topup Center — Operational Runbook

## 1. Daily Admin Workflow

### A. Processing Orders
1. Open Admin Panel at `/admin/orders`.
2. Filter queue by **PAID** orders.
3. Click **"ক্লেইম"** (Claim) to take ownership of an order.
4. Click **"📋 UID"** to copy the customer's player ID to your clipboard.
5. Open your supplier panel (e.g. UniPin, Smile One, Garena Shop) and top up the ID.
6. Return to Topup Center, click **"✓ সম্পন্ন"** (Complete), and optionally paste the confirmation screenshot URL.
7. The customer's timeline instantly reflects `COMPLETED` and they receive an in-app & email notification.

### B. Approving Manual TrxID Top-ups
1. Go to `/admin/payments`.
2. Inspect the **"ম্যানুয়াল টপআপ রিকোয়েস্ট কিউ"** table.
3. Verify the sender number and TrxID on your bKash / Nagad statement.
4. Click **"✓ অনুমোদন"** (Approve). The system automatically credits the customer's wallet ledger with row-level transaction locks.

---

## 2. Emergency Operations

### Maintenance Mode
To immediately pause public access for maintenance:
1. Go to `/admin/settings`.
2. Toggle `maintenance_mode` to `true`.
3. Non-admin users will be redirected to the maintenance notice page.

### Stuck Payments Reconciliation
If a customer claims they paid on UddoktaPay but their wallet wasn't credited:
1. Trigger manual reconciliation:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://www.yourdomain.com/api/cron/reconcile-payments
   ```
2. The endpoint checks UddoktaPay's `verify-payment` API for any unconfirmed invoice IDs in the last 24 hours and idempotently credits the user.

### Rotating AI API Keys
1. If any key experiences severe rate limits, update `GEMINI_API_KEY_1..4` or `GROK_API_KEY_1..4` in your Vercel/Render dashboard.
2. The key pool automatically resets cooldown counters upon restart.

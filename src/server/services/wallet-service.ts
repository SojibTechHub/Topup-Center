import { db } from "@/lib/db";
import { generateIdempotencyKey } from "@/lib/crypto";
import { Prisma } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletCreditParams = {
  userId: string;
  amountPoisha: bigint;
  type:
    | "TOPUP"
    | "REFUND"
    | "ADMIN_ADJUST"
    | "CASHBACK"
    | "REFERRAL";
  referenceType?: string;
  referenceId?: string;
  paymentId?: string;
  orderId?: string;
  note?: string;
  idempotencyKey: string;
};

export type WalletDebitParams = {
  userId: string;
  amountPoisha: bigint;
  type: "ORDER_PAYMENT";
  referenceType?: string;
  referenceId?: string;
  orderId?: string;
  note?: string;
  idempotencyKey: string;
};

// ─── Credit (add money to wallet) ────────────────────────────────────────────

export async function creditWallet(params: WalletCreditParams) {
  return db.$transaction(
    async (tx) => {
      // Check idempotency - if already processed, return existing record
      const existing = await tx.walletTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) {
        return existing;
      }

      // Lock the user row and get current balance
      const user = await tx.$queryRaw<
        Array<{ wallet_balance_poisha: string }>
      >`
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

      // Update balance
      await tx.user.update({
        where: { id: params.userId },
        data: { walletBalancePoisha: newBalance },
      });

      // Create ledger entry
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
          note: params.note,
        },
      });

      return transaction;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    }
  );
}

// ─── Debit (remove money from wallet) ────────────────────────────────────────

export async function debitWallet(params: WalletDebitParams) {
  return db.$transaction(
    async (tx) => {
      // Check idempotency
      const existing = await tx.walletTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) {
        return existing;
      }

      // Lock row and get current balance
      const user = await tx.$queryRaw<
        Array<{ wallet_balance_poisha: string }>
      >`
        SELECT wallet_balance_poisha
        FROM users
        WHERE id = ${params.userId}
        FOR UPDATE
      `;

      if (!user[0]) {
        throw new Error(`User ${params.userId} not found`);
      }

      const currentBalance = BigInt(user[0].wallet_balance_poisha);

      if (currentBalance < params.amountPoisha) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const newBalance = currentBalance - params.amountPoisha;

      // Update balance
      await tx.user.update({
        where: { id: params.userId },
        data: { walletBalancePoisha: newBalance },
      });

      // Create ledger entry
      const transaction = await tx.walletTransaction.create({
        data: {
          userId: params.userId,
          orderId: params.orderId,
          type: params.type,
          amountPoisha: -params.amountPoisha, // negative for debit
          balanceAfterPoisha: newBalance,
          idempotencyKey: params.idempotencyKey,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          note: params.note,
        },
      });

      return transaction;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    }
  );
}

// ─── Get wallet balance ────────────────────────────────────────────────────────

export async function getWalletBalance(userId: string): Promise<bigint> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { walletBalancePoisha: true },
  });
  return user?.walletBalancePoisha ?? 0n;
}

// ─── Get wallet transactions ──────────────────────────────────────────────────

export async function getWalletTransactions(
  userId: string,
  page = 1,
  pageSize = 20
) {
  const skip = (page - 1) * pageSize;

  const [transactions, total] = await Promise.all([
    db.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.walletTransaction.count({ where: { userId } }),
  ]);

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Admin wallet adjustment ──────────────────────────────────────────────────

export async function adminAdjustWallet(params: {
  userId: string;
  amountPoisha: bigint; // positive = credit, negative = debit
  note: string;
  adminId: string;
}) {
  const idempotencyKey = generateIdempotencyKey([
    "admin_adjust",
    params.userId,
    params.adminId,
    Date.now().toString(),
    params.amountPoisha.toString(),
  ]);

  if (params.amountPoisha > 0n) {
    return creditWallet({
      userId: params.userId,
      amountPoisha: params.amountPoisha,
      type: "ADMIN_ADJUST",
      referenceType: "ADMIN",
      referenceId: params.adminId,
      note: params.note,
      idempotencyKey,
    });
  } else {
    return debitWallet({
      userId: params.userId,
      amountPoisha: -params.amountPoisha,
      type: "ORDER_PAYMENT",
      referenceType: "ADMIN",
      referenceId: params.adminId,
      note: params.note,
      idempotencyKey,
    });
  }
}

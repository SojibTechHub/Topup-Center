import { describe, it, expect, vi } from "vitest";
import { generateIdempotencyKey } from "@/lib/crypto";

describe("Webhook Replay & Idempotency Protection", () => {
  it("prevents double execution using deterministic idempotency keys", () => {
    const executedTransactions = new Set<string>();

    function processPaymentWebhook(invoiceId: string, paymentId: string) {
      const idempotencyKey = generateIdempotencyKey(["webhook", paymentId, invoiceId]);

      if (executedTransactions.has(idempotencyKey)) {
        return { success: true, alreadyProcessed: true };
      }

      // Simulate credit execution
      executedTransactions.add(idempotencyKey);
      return { success: true, alreadyProcessed: false };
    }

    // First arrival
    const firstCall = processPaymentWebhook("inv_bd_99182", "pay_8821");
    expect(firstCall.success).toBe(true);
    expect(firstCall.alreadyProcessed).toBe(false);

    // Second arrival (webhook retry / network glitch)
    const secondCall = processPaymentWebhook("inv_bd_99182", "pay_8821");
    expect(secondCall.success).toBe(true);
    expect(secondCall.alreadyProcessed).toBe(true); // Double credit successfully prevented!
  });

  it("distinguishes distinct payments even if identical amount", () => {
    const keyA = generateIdempotencyKey(["wallet_topup", "pay_001", "inv_001"]);
    const keyB = generateIdempotencyKey(["wallet_topup", "pay_002", "inv_002"]);
    expect(keyA).not.toBe(keyB);
  });
});

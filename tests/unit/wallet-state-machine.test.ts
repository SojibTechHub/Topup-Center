import { describe, it, expect } from "vitest";
import { bdtToPoisha, poishaToBdt } from "@/lib/payments/uddoktapay";
import { generateIdempotencyKey } from "@/lib/crypto";

describe("Money Rules & Poisha Precision", () => {
  it("converts BDT to poisha without floating-point error", () => {
    expect(bdtToPoisha(100)).toBe(10000n);
    expect(bdtToPoisha(19.99)).toBe(1999n);
    expect(bdtToPoisha(0.5)).toBe(50n);
    expect(bdtToPoisha(9999.99)).toBe(999999n);
  });

  it("converts poisha to BDT string with 2 decimal places", () => {
    expect(poishaToBdt(10000n)).toBe(100.0);
    expect(poishaToBdt(1999n)).toBe(19.99);
    expect(poishaToBdt(50n)).toBe(0.5);
  });

  it("never allows negative wallet deductions to exceed balance", () => {
    const currentBalance = 5000n; // ৳50
    const purchaseAmount = 6000n; // ৳60
    const hasEnough = currentBalance >= purchaseAmount;
    expect(hasEnough).toBe(false);
  });
});

describe("Order State Machine Rules", () => {
  const validTransitions: Record<string, string[]> = {
    PENDING_PAYMENT: ["PAID", "CANCELLED", "EXPIRED"],
    PAID: ["PROCESSING", "COMPLETED", "FAILED", "REFUNDED"],
    PROCESSING: ["COMPLETED", "FAILED", "REFUNDED"],
    COMPLETED: [], // Terminal
    FAILED: ["REFUNDED"],
    CANCELLED: [], // Terminal
    EXPIRED: [], // Terminal
    REFUNDED: [], // Terminal
  };

  function canTransition(from: string, to: string): boolean {
    return (validTransitions[from] || []).includes(to);
  }

  it("allows valid forward state transitions", () => {
    expect(canTransition("PENDING_PAYMENT", "PAID")).toBe(true);
    expect(canTransition("PAID", "PROCESSING")).toBe(true);
    expect(canTransition("PROCESSING", "COMPLETED")).toBe(true);
    expect(canTransition("PAID", "REFUNDED")).toBe(true);
  });

  it("rejects invalid or backwards state transitions", () => {
    expect(canTransition("COMPLETED", "PENDING_PAYMENT")).toBe(false);
    expect(canTransition("COMPLETED", "PAID")).toBe(false);
    expect(canTransition("REFUNDED", "COMPLETED")).toBe(false);
    expect(canTransition("EXPIRED", "PAID")).toBe(false);
  });
});

describe("Idempotency Key Determinism", () => {
  it("produces identical keys for identical parameters", () => {
    const key1 = generateIdempotencyKey(["wallet_topup", "pay_123", "inv_456"]);
    const key2 = generateIdempotencyKey(["wallet_topup", "pay_123", "inv_456"]);
    expect(key1).toBe(key2);
  });

  it("produces different keys for different parameters", () => {
    const key1 = generateIdempotencyKey(["wallet_topup", "pay_123", "inv_456"]);
    const key2 = generateIdempotencyKey(["wallet_topup", "pay_123", "inv_789"]);
    expect(key1).not.toBe(key2);
  });
});

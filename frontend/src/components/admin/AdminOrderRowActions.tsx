"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminOrderRowActionsProps {
  orderId: string;
  orderCode: string;
  currentStatus: string;
  assignedToId: string | null;
  currentAdminId: string;
  uidStr: string;
  orderVersion: number;
}

export default function AdminOrderRowActions({
  orderId,
  orderCode,
  currentStatus,
  assignedToId,
  currentAdminId,
  uidStr,
  orderVersion,
}: AdminOrderRowActionsProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Copy UID
  const handleCopy = () => {
    navigator.clipboard.writeText(uidStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Claim Order
  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/claim`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error("Claim error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Order
  const handleComplete = async () => {
    const proof = prompt("ডেলিভারি প্রুফ বা স্ক্রিনশট লিংক দিন (ঐচ্ছিক):") || "";
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofImage: proof, expectedVersion: orderVersion }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error || "অর্ডার আপডেট করতে সমস্যা হয়েছে");
      }
    } catch (e) {
      console.error("Complete error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Refund Order
  const handleRefund = async () => {
    const reason = prompt("রিফান্ডের কারণ লিখুন (গ্রাহকের ওয়ালেটে টাকা ফেরত যাবে):");
    if (!reason) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error || "রিফান্ড করতে সমস্যা হয়েছে");
      }
    } catch (e) {
      console.error("Refund error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const isClaimedByMe = assignedToId === currentAdminId;
  const isFinal = ["COMPLETED", "FAILED", "CANCELLED", "REFUNDED"].includes(currentStatus);

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {/* Copy UID Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="btn btn-outline"
        title="প্লেয়ার UID কপি করুন"
        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
      >
        {isCopied ? "✓ কপিড" : "📋 UID"}
      </button>

      {!isFinal && (
        <>
          {/* Claim Button */}
          {!assignedToId && (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isLoading}
              className="btn btn-cyan"
              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
            >
              ক্লেইম
            </button>
          )}

          {/* Complete Button */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={isLoading}
            className="btn btn-lime"
            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
          >
            ✓ সম্পন্ন
          </button>

          {/* Refund Button */}
          <button
            type="button"
            onClick={handleRefund}
            disabled={isLoading}
            className="btn"
            style={{
              padding: "4px 8px",
              fontSize: "0.75rem",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            রিফান্ড
          </button>
        </>
      )}
    </div>
  );
}

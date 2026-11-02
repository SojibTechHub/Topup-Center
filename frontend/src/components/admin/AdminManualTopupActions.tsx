"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminManualTopupActionsProps {
  topupId: string;
  userName: string;
  amountBdt: string;
  status: string;
}

export default function AdminManualTopupActions({
  topupId,
  userName,
  amountBdt,
  status,
}: AdminManualTopupActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (status !== "PENDING") {
    return (
      <span className={`badge ${status === "APPROVED" ? "badge-lime" : "badge-red"}`}>
        {status}
      </span>
    );
  }

  const handleApprove = async () => {
    if (!confirm(`আপনি কি নিশ্চিত ${userName} এর ৳${amountBdt} টপআপ অনুমোদন করতে চান? ওয়ালেটে ব্যালেন্স যুক্ত হবে।`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/manual/${topupId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "অনুমোদন ব্যর্থ হয়েছে");
      }
    } catch (e) {
      console.error("Approve error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("বাতিল করার কারণ লিখুন:");
    if (!reason) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/manual/${topupId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "বাতিল ব্যর্থ হয়েছে");
      }
    } catch (e) {
      console.error("Reject error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        type="button"
        onClick={handleApprove}
        disabled={isLoading}
        className="btn btn-lime"
        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
      >
        ✓ অনুমোদন
      </button>

      <button
        type="button"
        onClick={handleReject}
        disabled={isLoading}
        className="btn"
        style={{
          padding: "4px 10px",
          fontSize: "0.75rem",
          background: "rgba(239, 68, 68, 0.15)",
          color: "#EF4444",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      >
        ✕ বাতিল
      </button>
    </div>
  );
}

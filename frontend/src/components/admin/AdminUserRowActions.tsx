"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUserRowActionsProps {
  userId: string;
  userName: string;
  currentBalanceBdt: string;
  status: string;
}

export default function AdminUserRowActions({
  userId,
  userName,
  currentBalanceBdt,
  status,
}: AdminUserRowActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Adjust Wallet
  const handleAdjustWallet = async () => {
    const amountStr = prompt(
      `গ্রাহক: ${userName}\nবর্তমান ব্যালেন্স: ৳${currentBalanceBdt}\n\nঅ্যাডজাস্ট করার পরিমাণ লিখুন (যোগ করতে পজিটিভ যেমন: 100, বিয়োগ করতে নেগেটিভ যেমন: -50):`
    );
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount === 0) {
      alert("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    const reason = prompt("অ্যাডজাস্টমেন্টের কারণ লিখুন (অডিট লগে সংরক্ষিত হবে):");
    if (!reason) {
      alert("কারণ লেখা বাধ্যতামূলক");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/wallet-adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPoisha: Math.round(amount * 100),
          reason,
        }),
      });

      if (res.ok) {
        alert("ওয়ালেট সফলভাবে আপডেট করা হয়েছে");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "আপডেট ব্যর্থ হয়েছে");
      }
    } catch (e) {
      console.error("Wallet adjust error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Ban
  const handleToggleBan = async () => {
    const isBan = status === "ACTIVE";
    const confirmMsg = isBan
      ? `আপনি কি নিশ্চিত ${userName} কে ব্যান করতে চান?`
      : `আপনি কি ${userName} এর ব্যান প্রত্যাহার করতে চান?`;

    if (!confirm(confirmMsg)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isBan ? "BANNED" : "ACTIVE",
          reason: isBan ? "Admin action" : undefined,
        }),
      });

      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
      }
    } catch (e) {
      console.error("Ban toggle error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        type="button"
        onClick={handleAdjustWallet}
        disabled={isLoading}
        className="btn btn-outline"
        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
      >
        💰 ব্যালেন্স
      </button>

      <button
        type="button"
        onClick={handleToggleBan}
        disabled={isLoading}
        className="btn"
        style={{
          padding: "4px 8px",
          fontSize: "0.75rem",
          background: status === "ACTIVE" ? "rgba(239, 68, 68, 0.15)" : "rgba(163, 230, 53, 0.15)",
          color: status === "ACTIVE" ? "#EF4444" : "var(--accent-lime)",
          border: `1px solid ${status === "ACTIVE" ? "rgba(239,68,68,0.3)" : "rgba(163,230,53,0.3)"}`,
        }}
      >
        {status === "ACTIVE" ? "🚫 ব্যান" : "✓ আনব্যান"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে");
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "36px 30px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
          পাসওয়ার্ড ভুলে গেছেন?
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
          আপনার অ্যাকাউন্টের ইমেইল দিন। আমরা পাসওয়ার্ড রিসেট লিংক পাঠিয়ে দেব।
        </p>
      </div>

      {isSubmitted ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📬</div>
          <h3 style={{ color: "var(--accent-lime)", fontSize: "1.1rem", marginBottom: "8px" }}>
            রিসেট লিংক পাঠানো হয়েছে!
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
            আপনার {email} ইনবক্স চেক করুন এবং লিংকে ক্লিক করে নতুন পাসওয়ার্ড দিন।
          </p>
          <Link href="/login" className="btn btn-outline" style={{ display: "inline-block" }}>
            লগইন পেজে ফিরুন
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              রেজিস্টার্ড ইমেইল
            </label>
            <input
              type="email"
              required
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              style={{ width: "100%" }}
            />
          </div>

          {errorMessage && (
            <div style={{ color: "#EF4444", fontSize: "0.85rem" }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-cyan"
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            {isLoading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান ➔"}
          </button>

          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <Link href="/login" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
              ← লগইন পেজে ফিরুন
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

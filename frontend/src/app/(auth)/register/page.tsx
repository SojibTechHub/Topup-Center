"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }
    if (form.password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div className="glass-card fade-in" style={{ padding: "40px", textAlign: "center", maxWidth: "420px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
          <h2 className="gradient-text" style={{ marginBottom: "12px" }}>
            ইমেইল ভেরিফাই করুন
          </h2>
          <p style={{ color: "var(--text-secondary)", fontFamily: "'Anek Bangla', sans-serif", lineHeight: 1.7 }}>
            আপনার ইমেইল <strong style={{ color: "var(--accent-cyan)" }}>{form.email}</strong>-এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। ইমেইল চেক করুন এবং লিংকে ক্লিক করুন।
          </p>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div className="glass-card fade-in" style={{ width: "100%", maxWidth: "440px", padding: "40px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto 16px",
            }}
          >
            🎮
          </div>
          <h1 className="gradient-text" style={{ fontSize: "1.8rem", marginBottom: "4px" }}>
            যোগ দিন
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "'Anek Bangla', sans-serif" }}>
            বিনামূল্যে অ্যাকাউন্ট তৈরি করুন
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#EF4444",
              fontSize: "0.85rem",
              fontFamily: "'Anek Bangla', sans-serif",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
              পুরো নাম
            </label>
            <input
              type="text"
              className="input"
              placeholder="আপনার নাম"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              id="register-name"
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
              ইমেইল
            </label>
            <input
              type="email"
              className="input"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              id="register-email"
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              className="input"
              placeholder="কমপক্ষে ৮ অক্ষর"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
              id="register-password"
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <input
              type="password"
              className="input"
              placeholder="পাসওয়ার্ড আবার দিন"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              id="register-confirm-password"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
              রেফারেল কোড (ঐচ্ছিক)
            </label>
            <input
              type="text"
              className="input"
              placeholder="XXXX-XXXX"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
              id="register-referral"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
            id="register-submit"
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="spinner" style={{ width: "16px", height: "16px" }} />
                তৈরি হচ্ছে...
              </span>
            ) : (
              "অ্যাকাউন্ট তৈরি করুন →"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            fontFamily: "'Anek Bangla', sans-serif",
            lineHeight: 1.6,
          }}
        >
          রেজিস্ট্রেশন করলে আপনি আমাদের{" "}
          <Link href="/terms" style={{ color: "var(--accent-cyan)" }}>Terms</Link>
          {" ও "}
          <Link href="/privacy" style={{ color: "var(--accent-cyan)" }}>Privacy Policy</Link>
          {" "}-এ সম্মত হচ্ছেন।
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "12px",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            fontFamily: "'Anek Bangla', sans-serif",
          }}
        >
          ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}

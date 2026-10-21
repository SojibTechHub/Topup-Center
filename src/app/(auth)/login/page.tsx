"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "", totp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTotp, setShowTotp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      totp: form.totp,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error === "BANNED") {
      setError("আপনার অ্যাকাউন্ট ব্যান করা হয়েছে।");
      return;
    }

    if (result?.error === "TOTP_REQUIRED") {
      setShowTotp(true);
      return;
    }

    if (result?.error) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
      return;
    }

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
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
      <div
        className="glass-card fade-in"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
        }}
      >
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
          <h1
            className="gradient-text"
            style={{ fontSize: "1.8rem", marginBottom: "4px" }}
          >
            স্বাগতম!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "'Anek Bangla', sans-serif" }}>
            আপনার অ্যাকাউন্টে লগইন করুন
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
          <div style={{ marginBottom: "16px" }}>
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
              id="login-email"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif", margin: 0 }}>
                পাসওয়ার্ড
              </label>
              <Link
                href="/forgot-password"
                style={{ fontSize: "0.8rem", color: "var(--accent-cyan)" }}
              >
                ভুলে গেছেন?
              </Link>
            </div>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              id="login-password"
            />
          </div>

          {showTotp && (
            <div style={{ marginBottom: "16px" }}>
              <label className="label" style={{ fontFamily: "'Anek Bangla', sans-serif" }}>
                2FA কোড (6 সংখ্যা)
              </label>
              <input
                type="text"
                className="input"
                placeholder="000000"
                value={form.totp}
                onChange={(e) => setForm({ ...form, totp: e.target.value })}
                maxLength={6}
                autoComplete="one-time-code"
                id="login-totp"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px" }}
            id="login-submit"
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="spinner" style={{ width: "16px", height: "16px" }} />
                লোড হচ্ছে...
              </span>
            ) : (
              "লগইন করুন →"
            )}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--border-default)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>অথবা</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-default)" }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%" }}
            onClick={() => signIn("google", { callbackUrl })}
            id="login-google"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google দিয়ে লগইন
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            fontFamily: "'Anek Bangla', sans-serif",
          }}
        >
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}

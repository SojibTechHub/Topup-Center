"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WalletTopupCardProps {
  currentBalanceBdt: string;
}

export default function WalletTopupCard({ currentBalanceBdt }: WalletTopupCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"instant" | "manual">("instant");

  // Instant state
  const [instantAmount, setInstantAmount] = useState<number>(500);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [instantError, setInstantError] = useState("");

  // Manual state
  const [manualMethod, setManualMethod] = useState<"BKASH" | "NAGAD" | "ROCKET">("BKASH");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [manualAmount, setManualAmount] = useState<number>(500);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [manualError, setManualError] = useState("");
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  // Quick amount buttons
  const quickAmounts = [100, 300, 500, 1000, 2000, 5000];

  // Initiate Instant Topup
  const handleInstantTopup = async () => {
    if (instantAmount < 100) {
      setInstantError("সর্বনিম্ন ১০০ টাকা রিচার্জ করতে হবে");
      return;
    }
    if (instantAmount > 10000) {
      setInstantError("সর্বোচ্চ ১০,০০০ টাকা রিচার্জ করা যাবে");
      return;
    }

    setIsInstantLoading(true);
    setInstantError("");

    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPoisha: instantAmount * 100 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "টপআপ রিকোয়েস্ট তৈরি করা যায়নি");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err: unknown) {
      setInstantError(err instanceof Error ? err.message : "পেমেন্ট তৈরি করতে সমস্যা হয়েছে");
      setIsInstantLoading(false);
    }
  };

  // Submit Manual TrxID
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber.trim() || !trxId.trim() || manualAmount < 50) {
      setManualError("সবগুলো তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setIsManualLoading(true);
    setManualError("");

    try {
      const res = await fetch("/api/wallet/manual-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: manualMethod,
          senderNumber,
          transactionId: trxId.trim().toUpperCase(),
          amountPoisha: manualAmount * 100,
          screenshotUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "রিকোয়েস্ট সাবমিট করা যায়নি");
      }

      setManualSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setManualError(err instanceof Error ? err.message : "সাবমিট করতে সমস্যা হয়েছে");
    } finally {
      setIsManualLoading(false);
    }
  };

  // Simulated AI Screenshot OCR
  const handleScanScreenshot = async () => {
    setIsOcrScanning(true);
    try {
      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: screenshotUrl || "demo_sample" }),
      });

      const data = await res.json();
      if (data.success && data.extracted) {
        if (data.extracted.transactionId) setTrxId(data.extracted.transactionId);
        if (data.extracted.amount) setManualAmount(Number(data.extracted.amount));
        if (data.extracted.method) setManualMethod(data.extracted.method);
      }
    } catch (e) {
      console.error("AI OCR error:", e);
    } finally {
      setIsOcrScanning(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      {/* Wallet Balance Hero */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          paddingBottom: "24px",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "24px",
        }}
      >
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>
            বর্তমান ওয়ালেট ব্যালেন্স
          </span>
          <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--accent-lime)" }}>
            ৳ {currentBalanceBdt}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            ⚡ কোনো পিন বা ওটিপি ছাড়াই ১-ক্লিকে গেম টপআপ করুন
          </span>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: "flex",
            background: "rgba(0, 0, 0, 0.4)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("instant")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: activeTab === "instant" ? 700 : 400,
              background: activeTab === "instant" ? "var(--accent-cyan)" : "transparent",
              color: activeTab === "instant" ? "#070A12" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            ⚡ ইনস্ট্যান্ট পেমেন্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: activeTab === "manual" ? 700 : 400,
              background: activeTab === "manual" ? "var(--accent-lime)" : "transparent",
              color: activeTab === "manual" ? "#070A12" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            📝 ম্যানুয়াল TrxID
          </button>
        </div>
      </div>

      {/* Tab 1: Instant Topup via UddoktaPay */}
      {activeTab === "instant" ? (
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
            টাকার পরিমাণ নির্বাচন করুন
          </h3>

          {/* Quick Amount Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setInstantAmount(amt)}
                className={`badge ${instantAmount === amt ? "badge-cyan" : ""}`}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  border: instantAmount === amt ? "2px solid var(--accent-cyan)" : "1px solid var(--border-color)",
                  background: instantAmount === amt ? "rgba(34, 211, 238, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: instantAmount === amt ? "var(--accent-cyan)" : "var(--text-primary)",
                  borderRadius: "8px",
                }}
              >
                ৳ {amt}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: "340px", marginBottom: "20px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              অথবা নিজের পছন্দমতো পরিমাণ লিখুন (৳১০০ - ৳১০,০০০):
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-muted)" }}>৳</span>
              <input
                type="number"
                min="100"
                max="10000"
                value={instantAmount}
                onChange={(e) => setInstantAmount(Number(e.target.value))}
                className="input"
                style={{ flex: 1, fontSize: "1.1rem", fontWeight: 700 }}
              />
            </div>
          </div>

          {instantError && (
            <div style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "16px" }}>
              ⚠️ {instantError}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleInstantTopup}
              disabled={isInstantLoading}
              className="btn btn-cyan"
              style={{ padding: "12px 30px", fontSize: "1rem", fontWeight: 700 }}
            >
              {isInstantLoading ? "গেgateway লোড হচ্ছে..." : `৳ ${instantAmount} রিচার্জ করুন ➔`}
            </button>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              🔒 বিকাশ, নগদ, রকেটে নিরাপদ অটোমেটেড রিচার্জ
            </span>
          </div>
        </div>
      ) : (
        /* Tab 2: Manual TrxID Fallback */
        <div>
          {manualSuccess ? (
            <div
              style={{
                padding: "24px",
                background: "rgba(163, 230, 53, 0.1)",
                border: "1px solid rgba(163, 230, 53, 0.3)",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🎉</div>
              <h3 style={{ color: "var(--accent-lime)", fontSize: "1.2rem", marginBottom: "8px" }}>
                ম্যানুয়াল টপআপ রিকোয়েস্ট জমা হয়েছে!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                অ্যাডমিন ভেরিফাই করে ৫-১৫ মিনিটের মধ্যে আপনার ওয়ালেটে ৳{manualAmount} যোগ করে দেবেন।
              </p>
              <button
                type="button"
                onClick={() => setManualSuccess(false)}
                className="btn btn-outline"
                style={{ marginTop: "16px", padding: "6px 16px", fontSize: "0.85rem" }}
              >
                আরেকটি রিকোয়েস্ট পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit}>
              {/* Payment numbers box */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "6px" }}>
                  📌 নিচের যেকোনো নম্বরে &quot;Send Money&quot; করে ট্রানজেকশন আইডি দিন:
                </strong>
                <div>• bKash: <strong style={{ color: "#E2136E" }}>01812345678</strong> (Personal)</div>
                <div>• Nagad: <strong style={{ color: "#F7941D" }}>01912345678</strong> (Personal)</div>
                <div>• Rocket: <strong style={{ color: "#8C2B89" }}>017123456789</strong> (Personal)</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    পেমেন্ট মাধ্যম
                  </label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as any)}
                    className="input"
                    style={{ width: "100%" }}
                  >
                    <option value="BKASH">bKash (বিকাশ)</option>
                    <option value="NAGAD">Nagad (নগদ)</option>
                    <option value="ROCKET">Rocket (রকেট)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    প্রেরকের নম্বর (যে নম্বর থেকে পাঠিয়েছেন)
                  </label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    টাকার পরিমাণ (BDT)
                  </label>
                  <input
                    type="number"
                    min="50"
                    placeholder="500"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="input"
                    style={{ width: "100%" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    ট্রানজেকশন আইডি (TrxID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BL9A4K3M1"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="input"
                    style={{ width: "100%", textTransform: "uppercase" }}
                    required
                  />
                </div>
              </div>

              {/* AI OCR Screenshot Assist */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  পেমেন্ট স্ক্রিনশট লিংক (ঐচ্ছিক) বা এআই স্ক্যান
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="https://... (স্ক্রিনশট ইমেজ লিংক)"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleScanScreenshot}
                    disabled={isOcrScanning}
                    className="btn btn-outline"
                    style={{ whiteSpace: "nowrap", padding: "0 16px" }}
                  >
                    {isOcrScanning ? "🤖 স্ক্যান হচ্ছে..." : "🤖 AI Auto-Fill"}
                  </button>
                </div>
              </div>

              {manualError && (
                <div style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "16px" }}>
                  ⚠️ {manualError}
                </div>
              )}

              <button
                type="submit"
                disabled={isManualLoading}
                className="btn btn-lime"
                style={{ padding: "12px 30px", fontSize: "1rem", fontWeight: 700 }}
              >
                {isManualLoading ? "জমা হচ্ছে..." : "ভেরিফিকেশনের জন্য পাঠান ➔"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

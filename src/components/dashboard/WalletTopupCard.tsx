"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Zap, FileText, CheckCircle2, AlertCircle, ArrowRight, Wallet, ShieldCheck } from "lucide-react";

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
    <div className="glass-card" style={{ padding: "30px", borderRadius: "20px" }}>
      {/* Wallet Balance Hero */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
          paddingBottom: "26px",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "28px",
        }}
      >
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Wallet size={16} className="text-cyan-400" /> বর্তমান ওয়ালেট ব্যালেন্স
          </span>
          <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "var(--accent-lime)", letterSpacing: "-0.5px" }}>
            ৳ {currentBalanceBdt}
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <Zap size={14} className="text-yellow-400" /> কোনো পিন বা ওটিপি ছাড়াই ১-ক্লিকে গেম টপআপ করুন
          </span>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: "flex",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "5px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("instant")}
            style={{
              padding: "10px 20px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: activeTab === "instant" ? 700 : 500,
              background: activeTab === "instant" ? "linear-gradient(135deg, var(--accent-cyan), #0284C7)" : "transparent",
              color: activeTab === "instant" ? "#070A12" : "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <Zap size={16} />
            <span>ইনস্ট্যান্ট গেটওয়ে</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            style={{
              padding: "10px 20px",
              borderRadius: "9px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: activeTab === "manual" ? 700 : 500,
              background: activeTab === "manual" ? "linear-gradient(135deg, var(--accent-lime), #65A30D)" : "transparent",
              color: activeTab === "manual" ? "#070A12" : "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <FileText size={16} />
            <span>ম্যানুয়াল TrxID</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Instant Topup via UddoktaPay with Real Logos */}
      {activeTab === "instant" ? (
        <div>
          {/* Real Supported Payment Logos Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              background: "rgba(0, 0, 0, 0.25)",
              padding: "14px 18px",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              অনুমোদিত পেমেন্ট পার্টনার:
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ height: "28px", width: "75px", position: "relative" }}>
                <Image src="/payments/bkash.svg" alt="bKash" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ height: "28px", width: "75px", position: "relative" }}>
                <Image src="/payments/nagad.svg" alt="Nagad" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ height: "28px", width: "75px", position: "relative" }}>
                <Image src="/payments/rocket.svg" alt="Rocket" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ height: "28px", width: "70px", position: "relative" }}>
                <Image src="/payments/card.svg" alt="Cards" fill style={{ objectFit: "contain" }} />
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
            রিচার্জের পরিমাণ নির্বাচন করুন
          </h3>

          {/* Quick Amount Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setInstantAmount(amt)}
                style={{
                  padding: "10px 18px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: instantAmount === amt ? "2px solid var(--accent-cyan)" : "1px solid var(--border-color)",
                  background: instantAmount === amt ? "rgba(34, 211, 238, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: instantAmount === amt ? "var(--accent-cyan)" : "var(--text-primary)",
                  borderRadius: "10px",
                  transition: "all 0.15s ease",
                  boxShadow: instantAmount === amt ? "0 0 15px rgba(34, 211, 238, 0.25)" : "none",
                }}
              >
                ৳ {amt}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: "360px", marginBottom: "22px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              অথবা নিজের পছন্দমতো পরিমাণ লিখুন (৳১০০ - ৳১০,০০০):
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-cyan)" }}>৳</span>
              <input
                type="number"
                min="100"
                max="10000"
                value={instantAmount}
                onChange={(e) => setInstantAmount(Number(e.target.value))}
                className="input"
                style={{ flex: 1, fontSize: "1.15rem", fontWeight: 800, padding: "10px 16px" }}
              />
            </div>
          </div>

          {instantError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontSize: "0.85rem", marginBottom: "18px" }}>
              <AlertCircle size={16} />
              <span>{instantError}</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleInstantTopup}
              disabled={isInstantLoading}
              className="btn btn-cyan"
              style={{
                padding: "14px 34px",
                fontSize: "1rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isInstantLoading ? (
                "পেমেন্ট গেটওয়ে লোড হচ্ছে..."
              ) : (
                <>
                  <span>৳ {instantAmount} রিচার্জ করুন</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={16} className="text-lime-400" /> সম্পূর্ণ স্বয়ংক্রিয় ও তাত্ক্ষণিক ব্যালেন্স জমা
            </span>
          </div>
        </div>
      ) : (
        /* Tab 2: Manual TrxID Fallback with Real Method Icons */
        <div>
          {manualSuccess ? (
            <div
              style={{
                padding: "30px 24px",
                background: "rgba(163, 230, 53, 0.1)",
                border: "1px solid rgba(163, 230, 53, 0.3)",
                borderRadius: "16px",
                textAlign: "center",
              }}
            >
              <CheckCircle2 size={48} className="text-lime-400 mx-auto mb-3" />
              <h3 style={{ color: "var(--accent-lime)", fontSize: "1.3rem", marginBottom: "8px", fontWeight: 800 }}>
                ম্যানুয়াল টপআপ রিকোয়েস্ট সফলভাবে জমা হয়েছে!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
                অ্যাডমিন ভেরিফাই করে ৫-১৫ মিনিটের মধ্যে আপনার ওয়ালেটে ৳{manualAmount} যোগ করে দেবেন।
              </p>
              <button
                type="button"
                onClick={() => setManualSuccess(false)}
                className="btn btn-outline"
                style={{ marginTop: "18px", padding: "8px 20px", fontSize: "0.88rem" }}
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
                  padding: "18px 20px",
                  borderRadius: "14px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "24px",
                  fontSize: "0.88rem",
                  lineHeight: 1.8,
                }}
              >
                <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "8px" }}>
                  📌 নিচের যেকোনো নম্বরে &quot;Send Money&quot; করে ট্রানজেকশন আইডি দিন:
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ height: "22px", width: "55px", position: "relative" }}>
                      <Image src="/payments/bkash.svg" alt="bKash" fill style={{ objectFit: "contain" }} />
                    </div>
                    <span><strong>01812345678</strong> (Personal)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ height: "22px", width: "55px", position: "relative" }}>
                      <Image src="/payments/nagad.svg" alt="Nagad" fill style={{ objectFit: "contain" }} />
                    </div>
                    <span><strong>01912345678</strong> (Personal)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ height: "22px", width: "55px", position: "relative" }}>
                      <Image src="/payments/rocket.svg" alt="Rocket" fill style={{ objectFit: "contain" }} />
                    </div>
                    <span><strong>017123456789</strong> (Personal)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    পেমেন্ট মাধ্যম
                  </label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as any)}
                    className="input"
                    style={{ width: "100%", padding: "11px 14px" }}
                  >
                    <option value="BKASH">bKash (বিকাশ Send Money)</option>
                    <option value="NAGAD">Nagad (নগদ Send Money)</option>
                    <option value="ROCKET">Rocket (রকেট Send Money)</option>
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
                    style={{ width: "100%", padding: "11px 14px" }}
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
                    style={{ width: "100%", padding: "11px 14px" }}
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
                    style={{ width: "100%", padding: "11px 14px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              {/* AI OCR Screenshot Assist */}
              <div style={{ marginBottom: "22px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  পেমেন্ট স্ক্রিনশট লিংক (ঐচ্ছিক) বা এআই স্ক্যান
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="https://... (স্ক্রিনশট ইমেজ লিংক)"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    className="input"
                    style={{ flex: 1, padding: "11px 14px" }}
                  />
                  <button
                    type="button"
                    onClick={handleScanScreenshot}
                    disabled={isOcrScanning}
                    className="btn btn-outline"
                    style={{ whiteSpace: "nowrap", padding: "0 18px", fontWeight: 600 }}
                  >
                    {isOcrScanning ? "স্ক্যান হচ্ছে..." : "AI Auto-Fill"}
                  </button>
                </div>
              </div>

              {manualError && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontSize: "0.85rem", marginBottom: "18px" }}>
                  <AlertCircle size={16} />
                  <span>{manualError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isManualLoading}
                className="btn btn-lime"
                style={{
                  padding: "14px 34px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
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

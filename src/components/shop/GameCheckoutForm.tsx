"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Wallet,
  Zap,
  CreditCard,
  Tag,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface GameFieldDef {
  key: string;
  label: string;
  labelBn?: string;
  type?: string;
  placeholder?: string;
  regex?: string;
  required?: boolean;
  errorMessage?: string;
}

interface PackageDef {
  id: string;
  name: string;
  amountLabel: string;
  pricePoisha: string; // serialized BigInt
  costPoisha?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  deliveryTime?: string | null;
  badge?: string;
}

interface GameCheckoutFormProps {
  gameId: string;
  gameSlug: string;
  gameName: string;
  fields: GameFieldDef[];
  packages: PackageDef[];
  walletBalancePoisha: string;
  isLoggedIn: boolean;
  savedPlayerIds?: Array<{ id: string; label: string | null; playerFields: Record<string, string> }>;
}

export default function GameCheckoutForm({
  gameId,
  gameSlug,
  gameName,
  fields,
  packages,
  walletBalancePoisha,
  isLoggedIn,
  savedPlayerIds = [],
}: GameCheckoutFormProps) {
  const router = useRouter();

  // State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    packages[0]?.id || ""
  );
  const [playerValues, setPlayerValues] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "UDDOKTAPAY">(
    BigInt(walletBalancePoisha) > 0n ? "WALLET" : "UDDOKTAPAY"
  );
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPoisha: bigint;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedPkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const pkgPricePoisha = selectedPkg ? BigInt(selectedPkg.pricePoisha) : 0n;
  const discountPoisha = appliedCoupon ? appliedCoupon.discountPoisha : 0n;
  const finalPricePoisha = pkgPricePoisha > discountPoisha ? pkgPricePoisha - discountPoisha : 0n;

  const pkgPriceBdt = (Number(pkgPricePoisha) / 100).toFixed(2);
  const discountBdt = (Number(discountPoisha) / 100).toFixed(2);
  const finalPriceBdt = (Number(finalPricePoisha) / 100).toFixed(2);
  const walletBalanceBdt = (Number(BigInt(walletBalancePoisha)) / 100).toFixed(2);
  const hasEnoughWalletBalance = BigInt(walletBalancePoisha) >= finalPricePoisha;

  // Handle Saved ID select
  const handleSelectSavedId = (saved: typeof savedPlayerIds[0]) => {
    setPlayerValues(saved.playerFields);
    setValidationErrors({});
  };

  // Validate fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    for (const f of fields) {
      const val = playerValues[f.key]?.trim() || "";
      if (f.required && !val) {
        errors[f.key] = `${f.labelBn || f.label} পূরণ করা আবশ্যক`;
      } else if (f.regex && val) {
        const regex = new RegExp(f.regex);
        if (!regex.test(val)) {
          errors[f.key] = f.errorMessage || `সঠিক ${f.labelBn || f.label} দিন`;
        }
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");

    try {
      if (couponCode.toUpperCase() === "WELCOME50") {
        if (pkgPricePoisha < 20000n) {
          setCouponError("এই কুপনের জন্য সর্বনিম্ন ৳২০০ অর্ডারের প্রয়োজন");
          return;
        }
        setAppliedCoupon({ code: "WELCOME50", discountPoisha: 5000n });
      } else if (couponCode.toUpperCase() === "HOT10") {
        const discount = (pkgPricePoisha * 10n) / 100n;
        const capped = discount > 10000n ? 10000n : discount;
        setAppliedCoupon({ code: "HOT10", discountPoisha: capped });
      } else {
        setCouponError("মেয়াদোত্তীর্ণ বা ভুল কুপন কোড");
      }
    } catch {
      setCouponError("কুপন যাচাই করতে সমস্যা হয়েছে");
    }
  };

  // Submit Order
  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/games/${gameSlug}`);
      return;
    }

    if (paymentMethod === "WALLET" && !hasEnoughWalletBalance) {
      setErrorMessage("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। দয়া করে ওয়ালেট টপআপ করুন অথবা সরাসরি পেমেন্ট করুন।");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          packageId: selectedPackageId,
          playerFields: playerValues,
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "অর্ডার তৈরি করতে সমস্যা হয়েছে");
        setIsLoading(false);
        return;
      }

      // If UddoktaPay redirect
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.orderCode) {
        router.push(`/order/${data.orderCode}?success=true`);
      } else {
        router.push("/orders");
      }
    } catch (e) {
      setErrorMessage("নেটওয়ার্ক বা সার্ভার সমস্যা হয়েছে, পুনরায় চেষ্টা করুন");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ── Step 1: Account / UID Details ── */}
      <div className="glass-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-cyan), #0284C7)",
              color: "#070A12",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            ১
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              অ্যাকাউন্ট তথ্য দিন
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              যে আইডিতে টপআপ ডেলিভারি হবে সেটি সতর্কতার সাথে লিখুন
            </span>
          </div>
        </div>

        {/* Saved IDs Shortcut if logged in */}
        {savedPlayerIds.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              সংরক্ষিত প্লেয়ার আইডি থেকে বেছে নিন:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {savedPlayerIds.map((saved) => (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => handleSelectSavedId(saved)}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: "0.8rem",
                    padding: "6px 12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <UserCheck size={14} className="text-cyan-400" />
                  {saved.label || Object.values(saved.playerFields)[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Fields Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
          {fields.map((field) => (
            <div key={field.key}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                {field.labelBn || field.label} {field.required && <span style={{ color: "#EF4444" }}>*</span>}
              </label>
              <input
                type={field.type || "text"}
                placeholder={field.placeholder || `${field.labelBn || field.label} লিখুন...`}
                value={playerValues[field.key] || ""}
                onChange={(e) => {
                  setPlayerValues({ ...playerValues, [field.key]: e.target.value });
                  if (validationErrors[field.key]) {
                    const next = { ...validationErrors };
                    delete next[field.key];
                    setValidationErrors(next);
                  }
                }}
                className="input"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderColor: validationErrors[field.key] ? "#EF4444" : undefined,
                  fontSize: "0.95rem",
                }}
              />
              {validationErrors[field.key] && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#EF4444", fontSize: "0.8rem", marginTop: "6px" }}>
                  <AlertCircle size={14} />
                  <span>{validationErrors[field.key]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 2: Package Selection ── */}
      <div className="glass-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-lime), #65A30D)",
              color: "#070A12",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            ২
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              প্যাকেজ নির্বাচন করুন
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              আপনার প্রয়োজনীয় রিচার্জ প্যাকেজে ক্লিক করুন
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: "14px",
          }}
        >
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const priceBdt = (Number(BigInt(pkg.pricePoisha)) / 100).toFixed(0);

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid var(--accent-cyan)"
                    : "1px solid var(--border-color)",
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(7, 10, 18, 0.8))"
                    : "rgba(255, 255, 255, 0.02)",
                  boxShadow: isSelected ? "0 0 20px rgba(34, 211, 238, 0.25)" : "none",
                  position: "relative",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {pkg.isPopular && (
                  <span
                    className="badge badge-magenta"
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    🔥 Popular
                  </span>
                )}
                {pkg.badge && !pkg.isPopular && (
                  <span
                    className="badge badge-cyan"
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {pkg.badge}
                  </span>
                )}

                <div style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: isSelected ? "var(--accent-cyan)" : "var(--text-primary)",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Sparkles size={16} className={isSelected ? "text-cyan-400" : "text-amber-400"} />
                    {pkg.amountLabel}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {pkg.name}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-lime)" }}>
                    ৳ {priceBdt}
                  </div>
                  {pkg.deliveryTime && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "2px" }}>
                      <Zap size={11} className="text-yellow-400" /> {pkg.deliveryTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 3: Payment Method & Coupon ── */}
      <div className="glass-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-magenta), #C026D3)",
              color: "#070A12",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            ৩
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              পেমেন্ট মাধ্যম বেছে নিন
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              তাৎক্ষণিক অনলাইন গেটওয়ে অথবা আপনার ওয়ালেট ব্যালেন্স
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {/* UddoktaPay Instant Gateway with REAL Brand Logos */}
          <div
            onClick={() => setPaymentMethod("UDDOKTAPAY")}
            style={{
              padding: "18px 20px",
              borderRadius: "14px",
              cursor: "pointer",
              border: paymentMethod === "UDDOKTAPAY"
                ? "2px solid var(--accent-lime)"
                : "1px solid var(--border-color)",
              background: paymentMethod === "UDDOKTAPAY"
                ? "linear-gradient(135deg, rgba(163, 230, 53, 0.1), rgba(7, 10, 18, 0.9))"
                : "rgba(255, 255, 255, 0.02)",
              boxShadow: paymentMethod === "UDDOKTAPAY" ? "0 0 20px rgba(163, 230, 53, 0.2)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={20} className="text-lime-400" />
                <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>
                  ইনস্ট্যান্ট পেমেন্ট গেটওয়ে
                </strong>
              </div>
              <span className="badge badge-lime" style={{ fontSize: "0.68rem" }}>
                অটোমেটিক
              </span>
            </div>

            {/* REAL SVG Payment Badges */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "10px" }}>
              <div style={{ height: "26px", width: "70px", position: "relative" }}>
                <Image src="/payments/bkash.svg" alt="bKash" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ height: "26px", width: "70px", position: "relative" }}>
                <Image src="/payments/nagad.svg" alt="Nagad" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ height: "26px", width: "70px", position: "relative" }}>
                <Image src="/payments/rocket.svg" alt="Rocket" fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ height: "26px", width: "65px", position: "relative" }}>
                <Image src="/payments/card.svg" alt="Cards" fill style={{ objectFit: "contain" }} />
              </div>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "10px" }}>
              ✓ বিকাশ, নগদ, রকেট বা কার্ডে ১ ক্লিকে পেমেন্ট ও অটো ডেলিভারি
            </div>
          </div>

          {/* Wallet Option */}
          <div
            onClick={() => setPaymentMethod("WALLET")}
            style={{
              padding: "18px 20px",
              borderRadius: "14px",
              cursor: "pointer",
              border: paymentMethod === "WALLET"
                ? "2px solid var(--accent-cyan)"
                : "1px solid var(--border-color)",
              background: paymentMethod === "WALLET"
                ? "linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(7, 10, 18, 0.9))"
                : "rgba(255, 255, 255, 0.02)",
              boxShadow: paymentMethod === "WALLET" ? "0 0 20px rgba(34, 211, 238, 0.2)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Wallet size={20} className="text-cyan-400" />
                <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>
                  টপআপ সেন্টার ওয়ালেট
                </strong>
              </div>
              {hasEnoughWalletBalance ? (
                <span className="badge badge-cyan" style={{ fontSize: "0.68rem" }}>
                  পর্যাপ্ত ব্যালেন্স
                </span>
              ) : (
                <span className="badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#EF4444", fontSize: "0.68rem" }}>
                  ব্যালেন্স কম
                </span>
              )}
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
              বর্তমান ওয়ালেট ব্যালেন্স:{" "}
              <span style={{ color: "var(--accent-lime)", fontWeight: 800, fontSize: "1.05rem" }}>
                ৳ {walletBalanceBdt}
              </span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "10px" }}>
              ✓ ওয়ালেট ব্যালেন্স থাকলে কোনো পেমেন্ট গেটওয়ে চার্জ ছাড়াই ০ সেকেন্ডে ডেলিভারি
            </div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "18px" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Tag size={15} className="text-cyan-400" />
            ডিসকাউন্ট কুপন কোড (যদি থাকে)
          </label>
          <div style={{ display: "flex", gap: "10px", maxWidth: "420px" }}>
            <input
              type="text"
              placeholder="e.g. WELCOME50 বা HOT10"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="input"
              style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="btn btn-outline"
              style={{ padding: "0 22px", whiteSpace: "nowrap", fontWeight: 600 }}
            >
              প্রয়োগ করুন
            </button>
          </div>
          {couponError && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#EF4444", fontSize: "0.8rem", marginTop: "8px" }}>
              <AlertCircle size={14} />
              <span>{couponError}</span>
            </div>
          )}
          {appliedCoupon && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-lime)", fontSize: "0.82rem", marginTop: "8px" }}>
              <CheckCircle2 size={15} />
              <span>✓ কুপন {appliedCoupon.code} সফলভাবে প্রয়োগ হয়েছে! মোট ছাড়: ৳ {discountBdt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "10px",
            color: "#EF4444",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Sticky Order Summary & Buy Button ── */}
      <div
        className="glass-card"
        style={{
          padding: "22px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          border: "1px solid rgba(34, 211, 238, 0.4)",
          background: "linear-gradient(135deg, rgba(7, 10, 18, 0.95), rgba(34, 211, 238, 0.08))",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          borderRadius: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            নির্বাচিত প্যাকেজ: <strong style={{ color: "var(--text-primary)" }}>{selectedPkg?.amountLabel} ({gameName})</strong>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "4px" }}>
            <span style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--accent-lime)", letterSpacing: "-0.5px" }}>
              ৳ {finalPriceBdt}
            </span>
            {appliedCoupon && (
              <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                ৳ {pkgPriceBdt}
              </span>
            )}
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} className="text-cyan-400" /> ১০০% গ্যারান্টিড
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isLoading}
          className="btn btn-cyan"
          style={{
            padding: "16px 36px",
            fontSize: "1.05rem",
            fontWeight: 800,
            cursor: isLoading ? "not-allowed" : "pointer",
            minWidth: "240px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 0 25px rgba(34, 211, 238, 0.4)",
          }}
        >
          {isLoading ? (
            "অর্ডার প্রসেসিং হচ্ছে..."
          ) : paymentMethod === "WALLET" ? (
            <>
              <span>ওয়ালেট দিয়ে কিনুন</span>
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              <span>পেমেন্টে এগিয়ে যান</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

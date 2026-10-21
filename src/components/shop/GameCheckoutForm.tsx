"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      // Basic client check for known demo coupons
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
        throw new Error(data.error || "অর্ডার তৈরি করতে সমস্যা হয়েছে");
      }

      if (paymentMethod === "WALLET") {
        // Redirect to order success page
        router.push(`/order/${data.order.code}`);
      } else if (data.paymentUrl) {
        // Redirect to UddoktaPay Gateway
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/order/${data.order.code}`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "অর্ডার প্রসেস করতে ব্যর্থ হয়েছে");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
      {/* Step 1: Player Fields */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              color: "#070A12",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            ১
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            প্লেয়ার ইনফরমেশন দিন
          </h3>
        </div>

        {/* Saved Player IDs dropdown */}
        {savedPlayerIds.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
              সংরক্ষিত প্লেয়ার আইডি থেকে নির্বাচন করুন:
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {savedPlayerIds.map((saved) => (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => handleSelectSavedId(saved)}
                  className="badge badge-cyan"
                  style={{ cursor: "pointer", border: "1px solid var(--accent-cyan)", padding: "6px 12px" }}
                >
                  ⭐ {saved.label || "Saved ID"} ({Object.values(saved.playerFields)[0]})
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {fields.map((field) => (
            <div key={field.key}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                {field.labelBn || field.label} {field.required && <span style={{ color: "#EF4444" }}>*</span>}
              </label>
              <input
                type={field.type || "text"}
                placeholder={field.placeholder || "আইডি লিখুন..."}
                value={playerValues[field.key] || ""}
                onChange={(e) => {
                  setPlayerValues({ ...playerValues, [field.key]: e.target.value });
                  if (validationErrors[field.key]) {
                    const newErrs = { ...validationErrors };
                    delete newErrs[field.key];
                    setValidationErrors(newErrs);
                  }
                }}
                className="input"
                style={{
                  width: "100%",
                  borderColor: validationErrors[field.key] ? "#EF4444" : undefined,
                }}
              />
              {validationErrors[field.key] && (
                <span style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "4px", display: "block" }}>
                  {validationErrors[field.key]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Select Package */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--accent-lime)",
              color: "#070A12",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            ২
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            প্যাকেজ নির্বাচন করুন
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {packages.map((pkg) => {
            const isSelected = pkg.id === selectedPackageId;
            const priceBdt = (Number(BigInt(pkg.pricePoisha)) / 100).toFixed(0);

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid var(--accent-cyan)"
                    : "1px solid var(--border-color)",
                  background: isSelected
                    ? "rgba(34, 211, 238, 0.1)"
                    : "rgba(255, 255, 255, 0.03)",
                  position: "relative",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {pkg.isPopular && (
                  <span
                    className="badge badge-magenta"
                    style={{ position: "absolute", top: "-10px", right: "10px", fontSize: "0.65rem" }}
                  >
                    🔥 Popular
                  </span>
                )}
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {pkg.amountLabel}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                    {pkg.name}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--accent-lime)" }}>
                    ৳ {priceBdt}
                  </div>
                  {pkg.deliveryTime && (
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      ⚡ {pkg.deliveryTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Payment Method & Coupon */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--accent-magenta)",
              color: "#070A12",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            ৩
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            পেমেন্ট মাধ্যম বেছে নিন
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          {/* Wallet Option */}
          <div
            onClick={() => setPaymentMethod("WALLET")}
            style={{
              padding: "16px",
              borderRadius: "12px",
              cursor: "pointer",
              border: paymentMethod === "WALLET"
                ? "2px solid var(--accent-cyan)"
                : "1px solid var(--border-color)",
              background: paymentMethod === "WALLET"
                ? "rgba(34, 211, 238, 0.08)"
                : "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "1.2rem" }}>💰</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                টপআপ সেন্টার ওয়ালেট
              </strong>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              ব্যালেন্স: <span style={{ color: "var(--accent-lime)", fontWeight: 700 }}>৳ {walletBalanceBdt}</span>
            </div>
            {!hasEnoughWalletBalance && (
              <span style={{ fontSize: "0.7rem", color: "#EF4444", display: "block", marginTop: "4px" }}>
                ⚠️ ব্যালেন্স কম (রিচার্জ লাগবে)
              </span>
            )}
          </div>

          {/* UddoktaPay Direct Gateway */}
          <div
            onClick={() => setPaymentMethod("UDDOKTAPAY")}
            style={{
              padding: "16px",
              borderRadius: "12px",
              cursor: "pointer",
              border: paymentMethod === "UDDOKTAPAY"
                ? "2px solid var(--accent-lime)"
                : "1px solid var(--border-color)",
              background: paymentMethod === "UDDOKTAPAY"
                ? "rgba(163, 230, 53, 0.08)"
                : "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "1.2rem" }}>⚡</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                ইনস্ট্যান্ট গেটওয়ে
              </strong>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              bKash, Nagad, Rocket, Card (অটোমেটিক)
            </div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            🏷️ ডিসকাউন্ট কুপন কোড
          </label>
          <div style={{ display: "flex", gap: "8px", maxWidth: "360px" }}>
            <input
              type="text"
              placeholder="e.g. WELCOME50"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="input"
              style={{ textTransform: "uppercase" }}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="btn btn-outline"
              style={{ padding: "0 18px", whiteSpace: "nowrap" }}
            >
              প্রয়োগ করুন
            </button>
          </div>
          {couponError && (
            <span style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "4px", display: "block" }}>
              {couponError}
            </span>
          )}
          {appliedCoupon && (
            <span style={{ fontSize: "0.75rem", color: "var(--accent-lime)", marginTop: "4px", display: "block" }}>
              ✓ কুপন {appliedCoupon.code} প্রয়োগ হয়েছে! ছাড়: ৳ {discountBdt}
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "8px",
            color: "#EF4444",
            fontSize: "0.875rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Sticky Order Summary & Buy Button */}
      <div
        className="glass-card"
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          border: "1px solid var(--accent-cyan)",
        }}
      >
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            নির্বাচিত প্যাকেজ: <strong style={{ color: "var(--text-primary)" }}>{selectedPkg?.amountLabel} ({gameName})</strong>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "4px" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--accent-lime)" }}>
              ৳ {finalPriceBdt}
            </span>
            {appliedCoupon && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                ৳ {pkgPriceBdt}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isLoading}
          className="btn btn-cyan"
          style={{
            padding: "14px 36px",
            fontSize: "1rem",
            fontWeight: 800,
            cursor: isLoading ? "not-allowed" : "pointer",
            minWidth: "220px",
          }}
        >
          {isLoading
            ? "প্রসেসিং হচ্ছে..."
            : paymentMethod === "WALLET"
            ? "ওয়ালেট দিয়ে এখনই কিনুন ➔"
            : "পেমেন্টে এগিয়ে যান ➔"}
        </button>
      </div>
    </div>
  );
}

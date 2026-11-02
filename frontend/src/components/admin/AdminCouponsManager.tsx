"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Ticket, CheckCircle2, Clock } from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderPoisha: string;
  maxDiscountPoisha: string | null;
  usedCount: number;
  isActive: boolean;
  validUntil: string | null;
  _count?: { orders: number; redemptions: number };
}

interface AdminCouponsManagerProps {
  initialCoupons: CouponItem[];
}

export function AdminCouponsManager({ initialCoupons }: AdminCouponsManagerProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderBdt, setMinOrderBdt] = useState<number>(100);
  const [maxDiscountBdt, setMaxDiscountBdt] = useState<number>(150);
  const [validUntil, setValidUntil] = useState("");

  const resetForm = () => {
    setCode("");
    setDiscountType("PERCENT");
    setDiscountValue(10);
    setMinOrderBdt(100);
    setMaxDiscountBdt(150);
    setValidUntil("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          minOrderBdt,
          maxDiscountBdt: discountType === "PERCENT" ? maxDiscountBdt : undefined,
          validUntil: validUntil || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "কুপন তৈরি ব্যর্থ হয়েছে");

      setCoupons((prev) => [data.coupon, ...prev]);
      toast.success("✅ নতুন কুপন সফলভাবে তৈরি হয়েছে!");
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে '${couponCode}' কুপনটি ডিলিট করতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("কুপন ডিলিট করা হয়েছে");
    } catch (err: any) {
      toast.error(err.message || "ডিলিট ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            কুপন কোড ও প্রমোশন
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            ডিসকাউন্ট কুপন তৈরি, শতকরা বা ফিক্সড ছাড় কনফিগার এবং ব্যবহার পর্যবেক্ষণ
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}
        >
          <Plus style={{ width: "18px", height: "18px" }} />
          নতুন কুপন তৈরি করুন
        </button>
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>কুপন কোড</th>
                <th>টাইপ</th>
                <th>ছাড়ের পরিমাণ</th>
                <th>সর্বনিম্ন অর্ডার</th>
                <th>সর্বোচ্চ ছাড়</th>
                <th>ব্যবহার হয়েছে</th>
                <th>মেয়াদ</th>
                <th>স্ট্যাটাস</th>
                <th style={{ textAlign: "right" }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const discount =
                  c.discountType === "PERCENT"
                    ? `${c.discountValue}%`
                    : `৳ ${(Number(c.discountValue) / 100).toFixed(0)}`;
                const minOrder = (Number(c.minOrderPoisha) / 100).toFixed(0);
                const maxDisc = c.maxDiscountPoisha ? `৳ ${(Number(c.maxDiscountPoisha) / 100).toFixed(0)}` : "—";

                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--accent-cyan)", fontSize: "1rem" }}>
                      {c.code}
                    </td>
                    <td>
                      <span className="badge" style={{ fontSize: "0.75rem" }}>
                        {c.discountType === "PERCENT" ? "শতকরা (%)" : "ফিক্সড (৳)"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--accent-lime)" }}>{discount}</td>
                    <td>৳ {minOrder}</td>
                    <td style={{ color: "var(--text-muted)" }}>{maxDisc}</td>
                    <td>{c.usedCount} বার</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString("bn-BD") : "লাইফটাইম"}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive ? "badge-lime" : "badge-red"}`}>
                        {c.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.8rem", color: "#EF4444" }}
                      >
                        <Trash2 style={{ width: "14px", height: "14px" }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div className="glass-card" style={{ width: "100%", maxWidth: "480px", padding: "28px", borderRadius: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                নতুন কুপন কোড তৈরি করুন
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  কুপন কোড * (যেমন: EID2026, WELCOME50)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="input"
                  style={{ width: "100%", fontFamily: "monospace", letterSpacing: "2px", fontWeight: 800 }}
                  placeholder="WELCOME50"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    ছাড়ের টাইপ
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                  >
                    <option value="PERCENT">শতকরা (%) ছাড়</option>
                    <option value="FIXED">নির্দিষ্ট টাকা (৳ BDT) ছাড়</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--accent-lime)", marginBottom: "4px", fontWeight: 700 }}>
                    ছাড়ের পরিমাণ {discountType === "PERCENT" ? "(%)" : "(৳ BDT)"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="input"
                    style={{ width: "100%", fontFamily: "monospace", fontWeight: 800 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    সর্বনিম্ন অর্ডার (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderBdt}
                    onChange={(e) => setMinOrderBdt(Number(e.target.value))}
                    className="input"
                    style={{ width: "100%", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    সর্বোচ্চ ছাড় (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscountBdt}
                    onChange={(e) => setMaxDiscountBdt(Number(e.target.value))}
                    disabled={discountType === "FIXED"}
                    className="input"
                    style={{ width: "100%", fontFamily: "monospace" }}
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  মেয়াদ শেষের তারিখ (ফাঁকা রাখলে আনলিমিটেড)
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 18px" }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: "8px 24px", fontWeight: 700 }}
                >
                  {loading ? "তৈরি হচ্ছে..." : "কুপন তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


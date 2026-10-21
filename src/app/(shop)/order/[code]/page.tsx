import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Clock, CreditCard, Zap, CheckCircle2, AlertCircle, XCircle, RotateCcw, ShieldCheck, ChevronRight } from "lucide-react";

interface OrderPageProps {
  params: Promise<{ code: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { code } = await params;
  const session = await auth();

  let order: any = null;

  try {
    order = await db.order.findUnique({
      where: { code },
      include: {
        game: true,
        package: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (e) {
    console.error("Error loading order:", e);
  }

  if (!order) {
    notFound();
  }

  // Security check: Customer can only view their own order unless admin or guest lookup with token
  const isOwner = session?.user?.id === order.userId;
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "STAFF";

  if (!isOwner && !isAdmin) {
    return (
      <div style={{ maxWidth: "600px", margin: "80px auto", padding: "20px", textAlign: "center" }}>
        <div className="glass-card" style={{ padding: "40px 24px", borderRadius: "20px" }}>
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-3" />
          <h2 style={{ color: "var(--text-primary)", fontSize: "1.4rem", marginBottom: "12px", fontWeight: 800 }}>
            অনুমতি নেই
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            এই অর্ডারের তথ্য দেখার জন্য আপনাকে সঠিক অ্যাকাউন্টে লগইন করতে হবে।
          </p>
          <Link href="/login" className="btn btn-cyan">
            লগইন করুন
          </Link>
        </div>
      </div>
    );
  }

  const priceBdt = (Number(order.pricePoisha) / 100).toFixed(2);
  const playerFields = (order.playerFields || {}) as Record<string, string>;

  // Status mapping
  const statusConfig: Record<string, { label: string; badgeClass: string; icon: any }> = {
    PENDING_PAYMENT: { label: "পেমেন্ট বাকি", badgeClass: "badge-yellow", icon: Clock },
    PAID: { label: "পেইড (প্রসেসিং কিউতে)", badgeClass: "badge-cyan", icon: CreditCard },
    PROCESSING: { label: "ডায়মন্ড ডেলিভারি হচ্ছে", badgeClass: "badge-cyan", icon: Zap },
    COMPLETED: { label: "সম্পূর্ণ হয়েছে", badgeClass: "badge-lime", icon: CheckCircle2 },
    FAILED: { label: "ব্যর্থ হয়েছে", badgeClass: "badge-red", icon: XCircle },
    CANCELLED: { label: "বাতিল", badgeClass: "badge-red", icon: XCircle },
    EXPIRED: { label: "মেয়াদোত্তীর্ণ", badgeClass: "badge-red", icon: Clock },
    REFUNDED: { label: "রিফান্ড সম্পন্ন (ওয়ালেটে)", badgeClass: "badge-magenta", icon: RotateCcw },
  };

  const currentStatus = statusConfig[order.status] || {
    label: order.status,
    badgeClass: "badge",
    icon: Clock,
  };
  const StatusIcon = currentStatus.icon;

  const steps = [
    { key: "PLACED", title: "অর্ডার গ্রহণ", done: true },
    {
      key: "PAID",
      title: "পেমেন্ট সম্পন্ন",
      done: ["PAID", "PROCESSING", "COMPLETED"].includes(order.status),
    },
    {
      key: "PROCESSING",
      title: "টপআপ প্রসেসিং",
      done: ["PROCESSING", "COMPLETED"].includes(order.status),
    },
    {
      key: "COMPLETED",
      title: "ডেলিভারি সম্পন্ন",
      done: order.status === "COMPLETED",
    },
  ];

  const gameImage = `/games/${order.game?.slug || "free-fire"}.jpg`;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
            অর্ডার ট্র্যাকিং আইডি
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--accent-cyan)", margin: 0, letterSpacing: "1px" }}>
              {order.code}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`badge ${currentStatus.badgeClass}`} style={{ fontSize: "0.92rem", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <StatusIcon size={16} />
            <span>{currentStatus.label}</span>
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="glass-card" style={{ padding: "30px 24px", marginBottom: "26px", borderRadius: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {steps.map((step, idx) => (
            <div
              key={step.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: step.done
                    ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))"
                    : "rgba(255, 255, 255, 0.08)",
                  color: step.done ? "#070A12" : "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  marginBottom: "8px",
                  boxShadow: step.done ? "0 0 16px rgba(34, 211, 238, 0.4)" : "none",
                }}
              >
                {step.done ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: step.done ? 700 : 400,
                  color: step.done ? "var(--text-primary)" : "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Card with Real Game Artwork */}
      <div className="glass-card" style={{ padding: "30px", marginBottom: "26px", borderRadius: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "18px" }}>
          <div style={{ width: "56px", height: "56px", position: "relative", borderRadius: "14px", overflow: "hidden", border: "2px solid var(--accent-cyan)", flexShrink: 0 }}>
            <Image src={gameImage} alt={order.game?.name || "Game"} fill style={{ objectFit: "cover" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              {order.game?.name || "Game"}
            </h3>
            <span style={{ fontSize: "0.9rem", color: "var(--accent-lime)", fontWeight: 700 }}>
              {order.package?.amountLabel} ({order.package?.name})
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>পরিশোধিত মূল্য</span>
            <strong style={{ color: "var(--accent-lime)", fontSize: "1.3rem", fontWeight: 900 }}>৳ {priceBdt}</strong>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>পেমেন্ট মেথড</span>
            <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{order.paymentMethod || "UDDOKTAPAY"}</strong>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>অর্ডারের সময়</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {new Date(order.createdAt).toLocaleString("bn-BD")}
            </span>
          </div>
        </div>

        {/* Player Fields */}
        <div style={{ background: "rgba(0, 0, 0, 0.35)", padding: "18px 22px", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "22px" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", fontWeight: 700, display: "block", marginBottom: "10px" }}>
            প্লেয়ার অ্যাকাউন্ট তথ্য:
          </span>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {Object.entries(playerFields).map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize", display: "block" }}>
                  {k.replace("_", " ")}:
                </span>
                <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#F8FAFC", fontFamily: "monospace" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Proof */}
        {order.proofUrl && (
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--accent-lime)", fontWeight: 700, display: "block", marginBottom: "8px" }}>
              ✓ ডেলিভারি প্রুফ স্ক্রিনশট:
            </span>
            <a href={order.proofUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem" }}>
              প্রুফ ইমেজ ওপেন করুন ➔
            </a>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "10px" }}>
          <Link href="/games" className="btn btn-outline btn-sm">
            আরও গেম টপআপ করুন
          </Link>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

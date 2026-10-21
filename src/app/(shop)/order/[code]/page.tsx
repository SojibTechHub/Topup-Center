import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface OrderPageProps {
  params: Promise<{ code: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { code } = await params;
  const session = await auth();

  let order = null;

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
        <div className="glass-card" style={{ padding: "40px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ color: "var(--text-primary)", fontSize: "1.4rem", marginBottom: "12px" }}>
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
  const statusConfig: Record<string, { label: string; badgeClass: string; icon: string }> = {
    PENDING_PAYMENT: { label: "পেমেন্ট বাকি", badgeClass: "badge-yellow", icon: "⏳" },
    PAID: { label: "পেইড (প্রসেসিং কিউতে)", badgeClass: "badge-cyan", icon: "💳" },
    PROCESSING: { label: "ডায়মন্ড ডেলিভারি হচ্ছে", badgeClass: "badge-cyan", icon: "⚙️" },
    COMPLETED: { label: "সম্পূর্ণ হয়েছে", badgeClass: "badge-lime", icon: "✅" },
    FAILED: { label: "ব্যর্থ হয়েছে", badgeClass: "badge-red", icon: "❌" },
    CANCELLED: { label: "বাতিল", badgeClass: "badge-red", icon: "⛔" },
    EXPIRED: { label: "মেয়াদোত্তীর্ণ", badgeClass: "badge-red", icon: "⏰" },
    REFUNDED: { label: "রিফান্ড সম্পন্ন (ওয়ালেটে)", badgeClass: "badge-magenta", icon: "💰" },
  };

  const currentStatus = statusConfig[order.status] || {
    label: order.status,
    badgeClass: "badge",
    icon: "📦",
  };

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

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
            অর্ডার ট্র্যাকিং আইডি
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-cyan)", margin: 0 }}>
              {order.code}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`badge ${currentStatus.badgeClass}`} style={{ fontSize: "0.9rem", padding: "6px 14px" }}>
            {currentStatus.icon} {currentStatus.label}
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="glass-card" style={{ padding: "30px 20px", marginBottom: "24px" }}>
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
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: step.done
                    ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))"
                    : "rgba(255, 255, 255, 0.1)",
                  color: step.done ? "#070A12" : "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                  boxShadow: step.done ? "0 0 12px rgba(34, 211, 238, 0.4)" : "none",
                }}
              >
                {step.done ? "✓" : idx + 1}
              </div>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: step.done ? 600 : 400,
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

      {/* Order Details Card */}
      <div className="glass-card" style={{ padding: "28px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
          অর্ডারের বিবরণ
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>গেম</span>
            <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{order.game.name}</strong>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>প্যাকেজ</span>
            <strong style={{ color: "var(--accent-cyan)", fontSize: "1rem" }}>{order.package.amountLabel} ({order.package.name})</strong>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>পরিশোধিত মূল্য</span>
            <strong style={{ color: "var(--accent-lime)", fontSize: "1.1rem" }}>৳ {priceBdt}</strong>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>অর্ডারের সময়</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {new Date(order.createdAt).toLocaleString("bn-BD")}
            </span>
          </div>
        </div>

        {/* Player Fields */}
        <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "16px 20px", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 600, display: "block", marginBottom: "8px" }}>
            প্লেয়ার তথ্য:
          </span>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {Object.entries(playerFields).map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize", display: "block" }}>
                  {k.replace("_", " ")}:
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Proof */}
        {order.proofUrl && (
          <div style={{ marginTop: "16px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              ডেলিভারি প্রুফ / স্ক্রিনশট:
            </span>
            <img
              src={order.proofUrl}
              alt="Delivery Proof"
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Link href="/games" className="btn btn-outline">
          ← আরও টপআপ করুন
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href={`/support?orderCode=${order.code}`} className="btn btn-cyan">
            💬 সাপোর্ট টিকিট খুলুন
          </Link>
        </div>
      </div>
    </div>
  );
}

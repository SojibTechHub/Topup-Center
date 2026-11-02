import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Wallet, ShoppingBag, CreditCard, Gift, ArrowRight, Zap, Award, ChevronRight } from "lucide-react";

export const metadata = {
  title: "কাস্টমার ড্যাশবোর্ড | Topup Center",
};

export default async function CustomerDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let user = null;
  let recentOrders: any[] = [];
  let totalOrders = 0;

  if (userId) {
    try {
      user = await db.user.findUnique({
        where: { id: userId },
      });

      recentOrders = await db.order.findMany({
        where: { userId },
        include: { game: true, package: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      totalOrders = await db.order.count({
        where: { userId },
      });
    } catch (e) {
      console.error("Dashboard error:", e);
    }
  }

  const walletBdt = user?.walletBalancePoisha
    ? (Number(user.walletBalancePoisha) / 100).toFixed(2)
    : "0.00";
  const totalSpentBdt = user?.totalSpentPoisha
    ? (Number(user.totalSpentPoisha) / 100).toFixed(2)
    : "0.00";

  const quickGames = [
    { name: "Free Fire", image: "/games/free-fire.jpg", slug: "free-fire", badge: "Hot" },
    { name: "PUBG Mobile", image: "/games/pubg-mobile.jpg", slug: "pubg-mobile", badge: "Popular" },
    { name: "Mobile Legends", image: "/games/mobile-legends.jpg", slug: "mobile-legends", badge: "Auto-Check" },
    { name: "Clash of Clans", image: "/games/clash-of-clans.jpg", slug: "clash-of-clans", badge: "Gems" },
  ];

  return (
    <div>
      {/* Welcome Bar */}
      <div
        className="glass-card"
        style={{
          padding: "26px 30px",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(163, 230, 53, 0.06))",
          borderRadius: "20px",
          border: "1px solid rgba(34, 211, 238, 0.25)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            স্বাগতম, {user?.name || "গেমার"}!
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0 }}>
            আপনার অ্যাকাউন্ট ওভারভিউ এবং সর্বশেষ অর্ডার হিস্টোরি
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span className="badge badge-lime" style={{ fontSize: "0.82rem", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Award size={15} /> {user?.loyaltyTier || "BRONZE"} TIER
          </span>
          <Link
            href="/wallet"
            className="btn btn-cyan"
            style={{ padding: "10px 22px", fontSize: "0.9rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Wallet size={16} /> ওয়ালেট রিচার্জ
          </Link>
        </div>
      </div>

      {/* KPI Cards with Lucide Icons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "34px",
        }}
      >
        {/* Wallet Balance */}
        <div className="glass-card" style={{ padding: "22px", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>ওয়ালেট ব্যালেন্স</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(163, 230, 53, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={18} className="text-lime-400" />
            </div>
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--accent-lime)", marginBottom: "6px", letterSpacing: "-0.5px" }}>
            ৳ {walletBdt}
          </div>
          <Link href="/wallet" style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            লেনদেন হিস্টোরি <ChevronRight size={13} />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="glass-card" style={{ padding: "22px", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>মোট অর্ডার</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(34, 211, 238, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={18} className="text-cyan-400" />
            </div>
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "6px" }}>
            {totalOrders}
          </div>
          <Link href="/orders" style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            সব অর্ডার দেখুন <ChevronRight size={13} />
          </Link>
        </div>

        {/* Total Spent */}
        <div className="glass-card" style={{ padding: "22px", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>মোট কেনাকাটা</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={18} className="text-purple-400" />
            </div>
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--accent-cyan)", marginBottom: "6px" }}>
            ৳ {totalSpentBdt}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            সর্বমোট খরচ
          </span>
        </div>

        {/* Referral Code */}
        <div className="glass-card" style={{ padding: "22px", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>রেফারেল কোড</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(244, 63, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Gift size={18} className="text-rose-400" />
            </div>
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--accent-magenta)", marginBottom: "6px", fontFamily: "monospace" }}>
            {user?.referralCode || "N/A"}
          </div>
          <Link href="/profile" style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            বোনাস ও ফ্রেন্ড ইনভাইট <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Quick Topup Games with REAL Game Artwork */}
      <div style={{ marginBottom: "38px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            দ্রুত টপআপ করুন
          </h2>
          <Link href="/games" style={{ color: "var(--accent-cyan)", fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            সব গেম দেখুন <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
          {quickGames.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="glass-card group"
              style={{
                padding: "16px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ width: "48px", height: "48px", position: "relative", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                <Image src={g.image} alt={g.name} fill style={{ objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem", display: "block", marginBottom: "2px" }}>
                  {g.name}
                </strong>
                <span className="badge badge-lime" style={{ fontSize: "0.68rem", padding: "1px 7px" }}>
                  {g.badge}
                </span>
              </div>
              <ArrowRight size={16} className="text-muted group-hover:text-cyan-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card" style={{ padding: "26px", borderRadius: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            সাম্প্রতিক অর্ডার
          </h3>
          <Link href="/orders" style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
            সব দেখুন ➔
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <ShoppingBag size={40} className="mx-auto mb-3 text-cyan-400 opacity-60" />
            <p style={{ margin: "0 0 16px 0", fontSize: "0.95rem" }}>এখনো কোনো অর্ডার করেননি</p>
            <Link href="/games" className="btn btn-cyan btn-sm">
              প্রথম টপআপ করুন
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px 16px" }}>অর্ডার কোড</th>
                  <th style={{ padding: "12px 16px" }}>গেম ও প্যাকেজ</th>
                  <th style={{ padding: "12px 16px" }}>মূল্য</th>
                  <th style={{ padding: "12px 16px" }}>স্ট্যাটাস</th>
                  <th style={{ padding: "12px 16px" }}>তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const bdt = (Number(order.pricePoisha) / 100).toFixed(2);
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <Link href={`/order/${order.code}`} style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 700 }}>
                          {order.code}
                        </Link>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{order.game?.name || "Game"}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>
                          {order.package?.amountLabel}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--accent-lime)", fontWeight: 700 }}>
                        ৳ {bdt}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          className={`badge ${
                            order.status === "COMPLETED"
                              ? "badge-lime"
                              : order.status === "PROCESSING" || order.status === "PAID"
                              ? "badge-cyan"
                              : order.status === "PENDING_PAYMENT"
                              ? "badge-yellow"
                              : "badge-red"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

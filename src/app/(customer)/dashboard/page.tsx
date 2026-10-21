import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

  return (
    <div>
      {/* Welcome Bar */}
      <div
        className="glass-card"
        style={{
          padding: "24px 28px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(163, 230, 53, 0.05))",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            স্বাগতম, {user?.name || "গেমার"}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
            আপনার অ্যাকাউন্ট ওভারভিউ এবং সর্বশেষ অর্ডার হিস্টোরি
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="badge badge-lime" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
            🌟 {user?.loyaltyTier || "BRONZE"} TIER
          </span>
          <Link href="/wallet" className="btn btn-cyan" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
            + ওয়ালেট রিচার্জ
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Wallet Balance */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>ওয়ালেট ব্যালেন্স</span>
            <span style={{ fontSize: "1.3rem" }}>💰</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-lime)", marginBottom: "4px" }}>
            ৳ {walletBdt}
          </div>
          <Link href="/wallet" style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
            লেনদেন হিস্টোরি দেখুন ➔
          </Link>
        </div>

        {/* Total Orders */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>মোট অর্ডার</span>
            <span style={{ fontSize: "1.3rem" }}>📦</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            {totalOrders}
          </div>
          <Link href="/orders" style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
            সব অর্ডার দেখুন ➔
          </Link>
        </div>

        {/* Total Spent */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>মোট কেনাকাটা</span>
            <span style={{ fontSize: "1.3rem" }}>💳</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "4px" }}>
            ৳ {totalSpentBdt}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            সর্বমোট খরচ
          </span>
        </div>

        {/* Referral Code */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>রেফারেল কোড</span>
            <span style={{ fontSize: "1.3rem" }}>🎁</span>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-magenta)", marginBottom: "4px", fontFamily: "monospace" }}>
            {user?.referralCode || "N/A"}
          </div>
          <Link href="/profile" style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
            বোনাস ও ফ্রেন্ড ইনভাইট ➔
          </Link>
        </div>
      </div>

      {/* Quick Topup Games */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            দ্রুত টপআপ করুন
          </h2>
          <Link href="/games" style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", textDecoration: "none" }}>
            সব গেম দেখুন ➔
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {[
            { name: "Free Fire", icon: "🔥", slug: "free-fire", badge: "Hot" },
            { name: "PUBG Mobile", icon: "🪖", slug: "pubg-mobile", badge: "Popular" },
            { name: "Mobile Legends", icon: "⚔️", slug: "mobile-legends", badge: "Hot" },
            { name: "Clash of Clans", icon: "🏰", slug: "clash-of-clans", badge: "Gems" },
          ].map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="glass-card"
              style={{
                padding: "18px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                border: "1px solid var(--border-color)",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ fontSize: "2rem" }}>{g.icon}</div>
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem", display: "block" }}>
                  {g.name}
                </strong>
                <span className="badge badge-lime" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                  {g.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            সর্বশেষ অর্ডারসমূহ
          </h3>
          <Link href="/orders" style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
            সব অর্ডার ➔
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            <p>আপনার কোনো অর্ডার পাওয়া যায়নি।</p>
            <Link href="/games" className="btn btn-cyan" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
              প্রথম টপআপ করুন
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th>অর্ডার কোড</th>
                  <th>গেম</th>
                  <th>প্যাকেজ</th>
                  <th>মূল্য</th>
                  <th>স্ট্যাটাস</th>
                  <th>তারিখ</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => {
                  const price = (Number(ord.pricePoisha) / 100).toFixed(2);
                  const isSuccess = ord.status === "COMPLETED";
                  const isProcessing = ord.status === "PROCESSING" || ord.status === "PAID";

                  return (
                    <tr key={ord.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-cyan)" }}>
                        {ord.code}
                      </td>
                      <td>{ord.game.name}</td>
                      <td>{ord.package.amountLabel}</td>
                      <td style={{ fontWeight: 700, color: "var(--accent-lime)" }}>৳ {price}</td>
                      <td>
                        <span
                          className={`badge ${
                            isSuccess
                              ? "badge-lime"
                              : isProcessing
                              ? "badge-cyan"
                              : "badge-yellow"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {new Date(ord.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td>
                        <Link href={`/order/${ord.code}`} className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                          ট্র্যাক ➔
                        </Link>
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

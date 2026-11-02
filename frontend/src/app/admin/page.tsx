import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalRevenue,
    todayOrders,
    pendingOrders,
    totalUsers,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { finalPricePoisha: true },
    }),
    db.order.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
      },
    }),
    db.order.count({
      where: { status: "PAID" },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      where: { status: { in: ["PAID", "PROCESSING"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        game: { select: { name: true } },
        package: { select: { amountLabel: true } },
      },
    }),
  ]);

  return {
    totalRevenue: Number(totalRevenue._sum.finalPricePoisha || 0n),
    todayOrders,
    pendingOrders,
    totalUsers,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getAdminStats();

  const kpis = [
    {
      label: "মোট আয়",
      value: `৳${(stats.totalRevenue / 100).toLocaleString("en-BD")}`,
      icon: "💰",
      color: "var(--accent-lime)",
      desc: "সব সময়ের",
    },
    {
      label: "আজকের অর্ডার",
      value: stats.todayOrders.toString(),
      icon: "📦",
      color: "var(--accent-cyan)",
      desc: "পেইড + প্রসেসিং + কমপ্লিট",
    },
    {
      label: "পেন্ডিং অর্ডার",
      value: stats.pendingOrders.toString(),
      icon: "⏳",
      color: stats.pendingOrders > 10 ? "#EF4444" : "var(--accent-gold)",
      desc: "তাৎক্ষণিক মনোযোগ দিন",
    },
    {
      label: "মোট গেমার",
      value: stats.totalUsers.toLocaleString("en"),
      icon: "👥",
      color: "var(--accent-magenta)",
      desc: "রেজিস্টার্ড ইউজার",
    },
  ];

  function getStatusBadge(status: string) {
    const map: Record<string, string> = {
      PAID: "badge-cyan",
      PROCESSING: "badge-purple",
      COMPLETED: "badge-lime",
    };
    return map[status] || "badge-gray";
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>
          <span className="gradient-text">Mission Control</span> 🚀
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "'Anek Bangla', sans-serif" }}>
          স্বাগতম, {session.user.name || session.user.email}!{" "}
          {stats.pendingOrders > 0 &&
            `${stats.pendingOrders}টি অর্ডার প্রসেসের অপেক্ষায় আছে।`}
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: "24px",
              borderLeft: `3px solid ${kpi.color}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "'Anek Bangla', sans-serif" }}>
                  {kpi.label}
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: kpi.color,
                    lineHeight: 1.2,
                    marginTop: "4px",
                  }}
                >
                  {kpi.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px", fontFamily: "'Anek Bangla', sans-serif" }}>
                  {kpi.desc}
                </div>
              </div>
              <div style={{ fontSize: "32px" }}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Orders */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", fontFamily: "'Anek Bangla', sans-serif" }}>
            🔥 লাইভ অর্ডার কিউ
          </h2>
          <a href="/admin/orders" className="btn btn-secondary btn-sm">
            সব দেখুন →
          </a>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>✅</div>
            <p style={{ fontFamily: "'Anek Bangla', sans-serif" }}>কোনো পেন্ডিং অর্ডার নেই!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>অর্ডার কোড</th>
                  <th>গেমার</th>
                  <th>গেম / প্যাকেজ</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <code style={{ color: "var(--accent-cyan)", fontSize: "0.8rem" }}>
                        {order.code}
                      </code>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {order.user.name || order.user.email}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {order.game.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {order.package.amountLabel}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        প্রসেস করুন
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

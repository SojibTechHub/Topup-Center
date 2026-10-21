import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import AdminOrderRowActions from "@/components/admin/AdminOrderRowActions";

export const metadata = {
  title: "অর্ডার কিউ ও ফুলফিলমেন্ট | Admin Mission Control",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const session = await auth();

  let orders: any[] = [];

  try {
    orders = await db.order.findMany({
      where: {
        ...(status && status !== "ALL" ? { status: status as any } : {}),
        ...(q
          ? {
              OR: [
                { code: { contains: q, mode: "insensitive" } },
                { user: { email: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        game: true,
        package: true,
        user: { select: { name: true, email: true, phone: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (e) {
    console.error("Admin orders error:", e);
  }

  const currentAdminId = session?.user?.id || "";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            লাইভ অর্ডার কিউ (Order Queue)
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            অর্ডার ক্লেইম করুন, প্লেয়ার আইডিতে টপআপ দিন এবং ডেলিভারি সম্পন্ন করুন
          </p>
        </div>

        {/* Search */}
        <form method="GET" action="/admin/orders" style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="অর্ডার কোড বা ইমেইল..."
            className="input"
            style={{ width: "220px", fontSize: "0.85rem" }}
          />
          <button type="submit" className="btn btn-outline" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            খুঁজুন
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {[
          { key: "ALL", label: "সব" },
          { key: "PAID", label: "⏳ অপেক্ষমাণ (PAID)" },
          { key: "PROCESSING", label: "⚙️ প্রসেসিং" },
          { key: "COMPLETED", label: "✅ সম্পন্ন" },
          { key: "REFUNDED", label: "💰 রিফান্ডেড" },
          { key: "FAILED", label: "❌ ব্যর্থ" },
        ].map((tab) => {
          const isSelected = (!status && tab.key === "ALL") || status === tab.key;
          return (
            <a
              key={tab.key}
              href={`/admin/orders?status=${tab.key}${q ? `&q=${q}` : ""}`}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                textDecoration: "none",
                fontWeight: isSelected ? 700 : 400,
                background: isSelected ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.05)",
                color: isSelected ? "#070A12" : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: "20px" }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            কোনো অর্ডার পাওয়া যায়নি।
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>অর্ডার কোড</th>
                  <th>গ্রাহক</th>
                  <th>গেম ও প্যাকেজ</th>
                  <th>প্লেয়ার তথ্য (UID)</th>
                  <th>মূল্য ও লাভ</th>
                  <th>স্ট্যাটাস</th>
                  <th>দায়িত্বপ্রাপ্ত</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const sellBdt = (Number(ord.pricePoisha) / 100).toFixed(0);
                  const costBdt = (Number(ord.costPoisha) / 100).toFixed(0);
                  const profitBdt = ((Number(ord.pricePoisha) - Number(ord.costPoisha)) / 100).toFixed(0);
                  const playerFields = (ord.playerFields || {}) as Record<string, string>;
                  const uidStr = Object.values(playerFields).join(" | ");

                  return (
                    <tr key={ord.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-cyan)" }}>
                        {ord.code}
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary)", display: "block" }}>
                          {ord.user?.name || "Customer"}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {ord.user?.email || ord.user?.phone}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary)" }}>{ord.game.name}</strong>
                        <span style={{ display: "block", color: "var(--accent-lime)", fontSize: "0.8rem" }}>
                          {ord.package.amountLabel}
                        </span>
                      </td>
                      <td>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "6px", fontFamily: "monospace", color: "#F8FAFC", display: "inline-block" }}>
                          {uidStr}
                        </div>
                      </td>
                      <td>
                        <div>বিক্রয়: ৳{sellBdt}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--accent-lime)" }}>লাভ: +৳{profitBdt}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            ord.status === "COMPLETED"
                              ? "badge-lime"
                              : ord.status === "PROCESSING" || ord.status === "PAID"
                              ? "badge-cyan"
                              : ord.status === "REFUNDED"
                              ? "badge-magenta"
                              : "badge-yellow"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {ord.assignedTo ? ord.assignedTo.name : "—"}
                      </td>
                      <td>
                        <AdminOrderRowActions
                          orderId={ord.id}
                          orderCode={ord.code}
                          currentStatus={ord.status}
                          assignedToId={ord.assignedToId}
                          currentAdminId={currentAdminId}
                          uidStr={uidStr}
                          orderVersion={ord.version}
                        />
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

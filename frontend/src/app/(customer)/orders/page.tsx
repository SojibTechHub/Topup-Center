import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "আমার সকল অর্ডার | Topup Center",
};

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  let orders: any[] = [];

  if (userId) {
    try {
      orders = await db.order.findMany({
        where: {
          userId,
          ...(status && status !== "ALL" ? { status: status as any } : {}),
        },
        include: {
          game: true,
          package: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("Orders page error:", e);
    }
  }

  const tabs = [
    { key: "ALL", label: "সব অর্ডার" },
    { key: "PROCESSING", label: "প্রসেসিং" },
    { key: "COMPLETED", label: "কমপ্লিট" },
    { key: "REFUNDED", label: "রিফান্ডেড" },
    { key: "FAILED", label: "ব্যর্থ / বাতিল" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            আমার অর্ডারসমূহ
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            আপনার সমস্ত টপআপ অর্ডারের লাইভ ট্র্যাকিং ও বিস্তারিত হিস্টোরি
          </p>
        </div>

        <Link href="/games" className="btn btn-cyan" style={{ padding: "10px 22px" }}>
          + নতুন টপআপ করুন
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        {tabs.map((tab) => {
          const isSelected = (!status && tab.key === "ALL") || status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/orders?status=${tab.key}`}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                textDecoration: "none",
                fontWeight: isSelected ? 700 : 400,
                background: isSelected ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.04)",
                color: isSelected ? "#070A12" : "var(--text-secondary)",
                border: isSelected ? "none" : "1px solid var(--border-color)",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="glass-card" style={{ padding: "24px" }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📦</div>
            <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", marginBottom: "8px" }}>
              কোনো অর্ডার পাওয়া যায়নি
            </h3>
            <p style={{ marginBottom: "20px" }}>এখনো কোনো গেম টপআপ করা হয়নি।</p>
            <Link href="/games" className="btn btn-cyan">
              টপআপ ব্রাউজ করুন
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th>অর্ডার কোড</th>
                  <th>গেম ও প্যাকেজ</th>
                  <th>প্লেয়ার ইনফো</th>
                  <th>মূল্য</th>
                  <th>স্ট্যাটাস</th>
                  <th>তারিখ</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const price = (Number(ord.pricePoisha) / 100).toFixed(2);
                  const playerFields = (ord.playerFields || {}) as Record<string, string>;
                  const uidDisplay = Object.values(playerFields)[0] || "—";

                  const isCompleted = ord.status === "COMPLETED";
                  const isProcessing = ord.status === "PROCESSING" || ord.status === "PAID";
                  const isRefunded = ord.status === "REFUNDED";

                  return (
                    <tr key={ord.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-cyan)" }}>
                        {ord.code}
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary)", display: "block" }}>{ord.game.name}</strong>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ord.package.amountLabel}</span>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "var(--accent-lime)" }}>
                        {uidDisplay}
                      </td>
                      <td style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                        ৳ {price}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isCompleted
                              ? "badge-lime"
                              : isProcessing
                              ? "badge-cyan"
                              : isRefunded
                              ? "badge-magenta"
                              : "badge-yellow"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {new Date(ord.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td>
                        <Link
                          href={`/order/${ord.code}`}
                          className="btn btn-outline"
                          style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                        >
                          বিস্তারিত ➔
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

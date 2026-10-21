import { db } from "@/lib/db";

export const metadata = {
  title: "কুপন ও ডিসকাউন্ট ম্যানেজমেন্ট | Admin Mission Control",
};

export default async function AdminCouponsPage() {
  let coupons: any[] = [];

  try {
    coupons = await db.coupon.findMany({
      include: {
        _count: { select: { orders: true, redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Admin coupons error:", e);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            কুপন কোড ও প্রমোশন
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            ডিসকাউন্ট কুপন তৈরি ও ব্যবহার বিশ্লেষণ
          </p>
        </div>
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
                <th>ব্যবহার হয়েছে</th>
                <th>মেয়াদ</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const discount = c.discountType === "PERCENT"
                  ? `${c.discountValue}%`
                  : `৳${(Number(c.discountValue) / 100).toFixed(0)}`;
                const minOrder = (Number(c.minOrderPoisha) / 100).toFixed(0);

                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--accent-cyan)", fontSize: "1rem" }}>
                      {c.code}
                    </td>
                    <td>{c.discountType}</td>
                    <td style={{ fontWeight: 800, color: "var(--accent-lime)" }}>{discount}</td>
                    <td>৳ {minOrder}</td>
                    <td>{c.usedCount} বার</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString("bn-BD") : "লাইফটাইম"}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive ? "badge-lime" : "badge-red"}`}>
                        {c.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

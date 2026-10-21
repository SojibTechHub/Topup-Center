import { db } from "@/lib/db";
import AdminUserRowActions from "@/components/admin/AdminUserRowActions";

export const metadata = {
  title: "ব্যবহারকারী ও ওয়ালেট ম্যানেজমেন্ট | Admin Mission Control",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let users: any[] = [];

  try {
    users = await db.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        _count: {
          select: { orders: true, walletTransactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.error("Admin users error:", e);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            ব্যবহারকারী তালিকা
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            কাস্টমার সার্চ, ওয়ালেট অ্যাডজাস্টমেন্ট ও অ্যাকাউন্ট স্ট্যাটাস
          </p>
        </div>

        <form method="GET" action="/admin/users" style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="নাম, ইমেইল বা ফোন নম্বর..."
            className="input"
            style={{ width: "240px", fontSize: "0.85rem" }}
          />
          <button type="submit" className="btn btn-outline" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            খুঁজুন
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>গ্রাহক</th>
                <th>রোল</th>
                <th>ওয়ালেট ব্যালেন্স</th>
                <th>মোট অর্ডার</th>
                <th>লয়ালটি টিয়ার</th>
                <th>স্ট্যাটাস</th>
                <th>জয়েনিং তারিখ</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const balanceBdt = (Number(u.walletBalancePoisha) / 100).toFixed(2);
                return (
                  <tr key={u.id}>
                    <td>
                      <strong style={{ color: "var(--text-primary)", display: "block" }}>
                        {u.name || "Unnamed"}
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {u.email || u.phone}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-cyan">{u.role}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--accent-lime)" }}>
                      ৳ {balanceBdt}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {u._count.orders} টি
                    </td>
                    <td>
                      <span className="badge badge-lime">🌟 {u.loyaltyTier}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === "ACTIVE" ? "badge-lime" : "badge-red"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {new Date(u.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                    <td>
                      <AdminUserRowActions
                        userId={u.id}
                        userName={u.name || u.email || "User"}
                        currentBalanceBdt={balanceBdt}
                        status={u.status}
                      />
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

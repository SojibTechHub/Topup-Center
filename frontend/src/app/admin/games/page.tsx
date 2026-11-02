import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "গেম ক্যাটালগ ম্যানেজমেন্ট | Admin Mission Control",
};

export default async function AdminGamesPage() {
  let games: any[] = [];

  try {
    games = await db.game.findMany({
      include: {
        _count: {
          select: { packages: true, orders: true },
        },
      },
      orderBy: { sort: "asc" },
    });
  } catch (e) {
    console.error("Admin games error:", e);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            গেম ক্যাটালগ
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            গেম যোগ করুন, ফিল্ডস ও ব্যানার কনফিগার করুন
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>গেমের নাম</th>
                <th>স্লাগ (Slug)</th>
                <th>ক্যাটাগরি</th>
                <th>প্যাকেজ সংখ্যা</th>
                <th>মোট অর্ডার</th>
                <th>স্ট্যাটাস</th>
                <th>ফিচার্ড</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id}>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{g.name}</strong>
                    {g.nameEn && (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                        {g.nameEn}
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>
                    {g.slug}
                  </td>
                  <td>
                    <span className="badge" style={{ textTransform: "capitalize" }}>
                      {g.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--accent-lime)" }}>
                    {g._count.packages} টি
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {g._count.orders}
                  </td>
                  <td>
                    <span className={`badge ${g.isActive ? "badge-lime" : "badge-red"}`}>
                      {g.isActive ? "সক্রিয়" : "বন্ধ"}
                    </span>
                  </td>
                  <td>
                    {g.isFeatured ? (
                      <span className="badge badge-cyan">Featured</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

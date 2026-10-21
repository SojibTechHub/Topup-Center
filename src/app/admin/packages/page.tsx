import { db } from "@/lib/db";

export const metadata = {
  title: "প্যাকেজ ও মূল্য তালিকা | Admin Mission Control",
};

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ gameId?: string }>;
}) {
  const { gameId } = await searchParams;

  let packages: any[] = [];
  let games: any[] = [];

  try {
    games = await db.game.findMany({ select: { id: true, name: true, slug: true } });
    packages = await db.package.findMany({
      where: {
        ...(gameId ? { gameId } : {}),
      },
      include: { game: true },
      orderBy: [{ gameId: "asc" }, { sort: "asc" }],
    });
  } catch (e) {
    console.error("Admin packages error:", e);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            প্যাকেজ ও মূল্যতালিকা
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            ক্রয়মূল্য, বিক্রয়মূল্য ও মার্জিন প্রফিট বিশ্লেষণ
          </p>
        </div>
      </div>

      {/* Game Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        <a
          href="/admin/packages"
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            textDecoration: "none",
            background: !gameId ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
            color: !gameId ? "#070A12" : "var(--text-secondary)",
            fontWeight: !gameId ? 700 : 400,
          }}
        >
          সব গেম
        </a>
        {games.map((g) => (
          <a
            key={g.id}
            href={`/admin/packages?gameId=${g.id}`}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              textDecoration: "none",
              background: gameId === g.id ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
              color: gameId === g.id ? "#070A12" : "var(--text-secondary)",
              fontWeight: gameId === g.id ? 700 : 400,
            }}
          >
            {g.name}
          </a>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>গেম</th>
                <th>প্যাকেজের নাম</th>
                <th>পরিমাণ</th>
                <th>ক্রয়মূল্য (Cost)</th>
                <th>বিক্রয়মূল্য (Sell)</th>
                <th>লাভ (Profit)</th>
                <th>মার্জিন</th>
                <th>স্টক</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const cost = Number(pkg.costPoisha) / 100;
                const sell = Number(pkg.pricePoisha) / 100;
                const profit = sell - cost;
                const margin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : "0";

                return (
                  <tr key={pkg.id}>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{pkg.game.name}</strong>
                    </td>
                    <td>{pkg.name}</td>
                    <td style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{pkg.amountLabel}</td>
                    <td style={{ color: "var(--text-muted)" }}>৳ {cost.toFixed(0)}</td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>৳ {sell.toFixed(0)}</td>
                    <td style={{ fontWeight: 800, color: "var(--accent-lime)" }}>+৳ {profit.toFixed(0)}</td>
                    <td>
                      <span className="badge badge-lime" style={{ fontSize: "0.75rem" }}>
                        {margin}%
                      </span>
                    </td>
                    <td>
                      {pkg.stock === -1 ? (
                        <span style={{ color: "var(--accent-cyan)" }}>অনন্ত</span>
                      ) : (
                        pkg.stock
                      )}
                    </td>
                    <td>
                      <span className={`badge ${pkg.isActive ? "badge-lime" : "badge-red"}`}>
                        {pkg.isActive ? "সক্রিয়" : "বন্ধ"}
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

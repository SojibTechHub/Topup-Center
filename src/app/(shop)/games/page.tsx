import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = {
  title: "সব গেম টপআপ ক্যাটালগ | Topup Center",
  description: "Free Fire, PUBG UC, Mobile Legends, Clash of Clans, Roblox সহ সব গেমের ডায়মন্ড ও টপআপ প্যাকেজ দেখুন।",
};

interface GameDisplay {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  category: string;
  tags: string[];
  isPopular: boolean;
  isFeatured: boolean;
  minPrice: number;
}

const fallbackGames: GameDisplay[] = [
  { id: "1", slug: "free-fire", name: "ফ্রি ফায়ার ডায়মন্ড", nameEn: "Free Fire Diamond", category: "mobile", tags: ["Hot", "Instant"], isPopular: true, isFeatured: true, minPrice: 25 },
  { id: "2", slug: "pubg-mobile", name: "পাবজি মোবাইল ইউসি", nameEn: "PUBG Mobile UC", category: "mobile", tags: ["Popular", "Instant"], isPopular: true, isFeatured: true, minPrice: 115 },
  { id: "3", slug: "mobile-legends", name: "মোবাইল লেজেন্ডস", nameEn: "Mobile Legends MLBB", category: "mobile", tags: ["Hot", "Instant"], isPopular: true, isFeatured: true, minPrice: 165 },
  { id: "4", slug: "clash-of-clans", name: "ক্ল্যাশ অব ক্ল্যানস", nameEn: "Clash of Clans", category: "mobile", tags: ["Supercell"], isPopular: true, isFeatured: false, minPrice: 125 },
  { id: "5", slug: "dream-league-soccer", name: "ড্রিম লিগ সকার", nameEn: "Dream League Soccer", category: "mobile", tags: ["Sports"], isPopular: false, isFeatured: false, minPrice: 190 },
  { id: "6", slug: "roblox", name: "রোবলক্স রোবক্স", nameEn: "Roblox Robux", category: "pc", tags: ["PC", "Robux"], isPopular: true, isFeatured: false, minPrice: 135 },
  { id: "7", slug: "steam-wallet", name: "স্টিম ওয়ালেট কার্ড", nameEn: "Steam Wallet", category: "pc", tags: ["PC", "Code"], isPopular: true, isFeatured: true, minPrice: 550 },
  { id: "8", slug: "google-play", name: "গুগল প্লে গিফট কার্ড", nameEn: "Google Play Gift Card", category: "card", tags: ["Card", "US"], isPopular: false, isFeatured: false, minPrice: 620 },
];

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  let games: GameDisplay[] = [];

  try {
    const dbGames = await db.game.findMany({
      where: {
        isActive: true,
        ...(category && category !== "all" ? { category } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { nameEn: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { pricePoisha: "asc" },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { sort: "asc" }],
    });

    if (dbGames && dbGames.length > 0) {
      games = dbGames.map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        nameEn: g.nameEn,
        category: g.category,
        tags: g.tags,
        isPopular: g.isPopular,
        isFeatured: g.isFeatured,
        minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 25,
      }));
    } else {
      games = fallbackGames;
    }
  } catch {
    games = fallbackGames;
  }

  // Filter fallback if used
  if (category && category !== "all") {
    games = games.filter((g) => g.category === category);
  }
  if (q) {
    const query = q.toLowerCase();
    games = games.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        (g.nameEn && g.nameEn.toLowerCase().includes(query))
    );
  }

  const categories = [
    { key: "all", label: "সব গেম ও কার্ড" },
    { key: "mobile", label: "📱 মোবাইল গেম" },
    { key: "pc", label: "💻 পিসি গেম" },
    { key: "card", label: "🎁 গিফট কার্ড" },
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Title & Search */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "10px",
            background: "linear-gradient(135deg, #F8FAFC, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          গেম ও ভাউচার ক্যাটালগ
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          আপনার প্রিয় গেম সিলেক্ট করুন এবং সরাসরি প্লেয়ার আইডিতে টপআপ নিন
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: "500px", margin: "24px auto 0" }}>
          <form method="GET" action="/games" style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="গেমের নাম দিয়ে সার্চ করুন (e.g. Free Fire, PUBG)..."
              className="input"
              style={{ flex: 1, padding: "12px 18px", fontSize: "0.95rem" }}
            />
            <button type="submit" className="btn btn-cyan" style={{ padding: "12px 20px" }}>
              🔍 খুঁজুন
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "36px",
        }}
      >
        {categories.map((cat) => {
          const isSelected = (!category && cat.key === "all") || category === cat.key;
          return (
            <Link
              key={cat.key}
              href={`/games?category=${cat.key}${q ? `&q=${q}` : ""}`}
              style={{
                padding: "8px 20px",
                borderRadius: "30px",
                fontSize: "0.9rem",
                textDecoration: "none",
                fontWeight: isSelected ? 600 : 400,
                background: isSelected
                  ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))"
                  : "rgba(255, 255, 255, 0.05)",
                color: isSelected ? "#070A12" : "var(--text-secondary)",
                border: isSelected ? "none" : "1px solid var(--border-color)",
                transition: "all 0.2s ease",
              }}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "8px" }}>
            কোনো গেম পাওয়া যায়নি
          </h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            অন্য কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা সব ক্যাটাগরি ব্রাউজ করুন।
          </p>
          <Link href="/games" className="btn btn-outline">
            সব গেম দেখুন
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="glass-card tilt-card"
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
              }}
            >
              {/* Banner Area */}
              <div
                style={{
                  height: "140px",
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(163, 230, 53, 0.1))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div style={{ fontSize: "3.5rem" }}>
                  {game.category === "mobile" ? "📱" : game.category === "pc" ? "💻" : "🎁"}
                </div>
                {game.isPopular && (
                  <span
                    className="badge badge-magenta"
                    style={{ position: "absolute", top: "12px", right: "12px", fontSize: "0.75rem" }}
                  >
                    🔥 Popular
                  </span>
                )}
                {game.isFeatured && (
                  <span
                    className="badge badge-lime"
                    style={{ position: "absolute", top: "12px", left: "12px", fontSize: "0.75rem" }}
                  >
                    ⚡ Fast Delivery
                  </span>
                )}
              </div>

              {/* Details */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {game.name}
                </h3>
                {game.nameEn && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                    {game.nameEn}
                  </div>
                )}

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {game.tags.map((tag) => (
                    <span key={tag} className="badge" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>শুরু মাত্র</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-lime)" }}>
                      ৳ {game.minPrice}
                    </span>
                  </div>
                  <span
                    className="btn btn-cyan"
                    style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: "8px" }}
                  >
                    টপআপ করুন ➔
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

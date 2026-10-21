import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getAllCatalogGames } from "@/lib/catalog-data";
import { Search, Zap, Flame, ShieldCheck, Smartphone, Monitor, Gift, Layers, ArrowRight } from "lucide-react";

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
  image: string;
  tags: string[];
  isPopular: boolean;
  isFeatured: boolean;
  minPrice: number;
  deliverySpeed?: string;
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const catalogGames = getAllCatalogGames();
  const defaultList: GameDisplay[] = catalogGames.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.nameBn,
    nameEn: g.nameEn,
    category: g.category,
    image: g.image,
    tags: g.tags,
    isPopular: g.isPopular,
    isFeatured: g.isFeatured,
    minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 25,
    deliverySpeed: g.deliverySpeed,
  }));

  let games: GameDisplay[] = defaultList;

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
      games = dbGames.map((g) => {
        const catMatch = catalogGames.find((cg) => cg.slug === g.slug);
        return {
          id: g.id,
          slug: g.slug,
          name: g.name,
          nameEn: g.nameEn,
          category: g.category,
          image: catMatch?.image || `/games/${g.slug}.jpg`,
          tags: g.tags,
          isPopular: g.isPopular,
          isFeatured: g.isFeatured,
          minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 25,
          deliverySpeed: catMatch?.deliverySpeed || "১-৫ মিনিট",
        };
      });
    }
  } catch {
    // DB offline, use catalog defaults
  }

  // Filter default list if fallback used
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
    { key: "all", label: "সব গেম ও কার্ড", icon: Layers },
    { key: "mobile", label: "মোবাইল গেম", icon: Smartphone },
    { key: "pc", label: "পিসি গেম", icon: Monitor },
    { key: "card", label: "গিফট কার্ড", icon: Gift },
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Title & Search */}
      <div style={{ marginBottom: "36px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(34, 211, 238, 0.1)",
            border: "1px solid rgba(34, 211, 238, 0.25)",
            borderRadius: "100px",
            padding: "6px 18px",
            marginBottom: "16px",
            fontSize: "0.85rem",
            color: "var(--accent-cyan)",
            fontWeight: 600,
          }}
        >
          <Zap size={14} /> ১০০% অফিশিয়াল ও ইনস্ট্যান্ট টপআপ
        </div>

        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            marginBottom: "12px",
            background: "linear-gradient(135deg, #F8FAFC, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          গেম ও ভাউচার ক্যাটালগ
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
          আপনার প্রিয় গেম সিলেক্ট করুন এবং সরাসরি প্লেয়ার আইডিতে টপআপ নিন সবচেয়ে কম মূল্যে
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: "520px", margin: "26px auto 0" }}>
          <form method="GET" action="/games" style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="গেম খুঁজুন (e.g. Free Fire, PUBG, Roblox)..."
                className="input"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-cyan"
              style={{ padding: "12px 24px", fontSize: "0.95rem", fontWeight: 700, borderRadius: "12px" }}
            >
              খুঁজুন
            </button>
          </form>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        {categories.map((cat) => {
          const isSelected = (!category && cat.key === "all") || category === cat.key;
          const IconComponent = cat.icon;
          return (
            <Link
              key={cat.key}
              href={`/games?category=${cat.key}${q ? `&q=${q}` : ""}`}
              style={{
                padding: "10px 22px",
                borderRadius: "30px",
                fontSize: "0.92rem",
                textDecoration: "none",
                fontWeight: isSelected ? 700 : 500,
                background: isSelected
                  ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))"
                  : "rgba(255, 255, 255, 0.04)",
                color: isSelected ? "#070A12" : "var(--text-secondary)",
                border: isSelected ? "none" : "1px solid var(--border-color)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 0 20px rgba(34, 211, 238, 0.3)" : "none",
              }}
            >
              <IconComponent size={16} />
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <Search size={48} className="text-cyan-400 mx-auto mb-4" />
          <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "8px", fontWeight: 700 }}>
            কোনো গেম পাওয়া যায়নি
          </h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            বানান চেক করে আবার সার্চ করুন অথবা সব ক্যাটাগরি ব্রাউজ করুন।
          </p>
          <Link href="/games" className="btn btn-outline">
            সব গেম দেখুন
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "24px",
          }}
        >
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="glass-card tilt-card group"
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "18px",
                transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                position: "relative",
              }}
            >
              {/* REAL Game Cover Image Area */}
              <div
                style={{
                  height: "200px",
                  position: "relative",
                  overflow: "hidden",
                  background: "#0c101d",
                }}
              >
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                  className="group-hover:scale-105"
                />

                {/* Gradient vignette for readability */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(7, 10, 18, 0.95) 0%, rgba(7, 10, 18, 0.2) 60%, transparent 100%)",
                  }}
                />

                {/* Badges on top of cover */}
                <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "6px" }}>
                  {game.isPopular && (
                    <span className="badge badge-magenta" style={{ fontSize: "0.7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Flame size={11} /> Popular
                    </span>
                  )}
                  {game.isFeatured && (
                    <span className="badge badge-lime" style={{ fontSize: "0.7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Zap size={11} /> Fast
                    </span>
                  )}
                </div>

                <div style={{ position: "absolute", bottom: "12px", left: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: "rgba(0, 0, 0, 0.6)",
                      backdropFilter: "blur(6px)",
                      color: "var(--accent-cyan)",
                      fontSize: "0.72rem",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(34, 211, 238, 0.3)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {game.category}
                  </span>
                  {game.deliverySpeed && (
                    <span
                      style={{
                        background: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(6px)",
                        color: "var(--text-secondary)",
                        fontSize: "0.72rem",
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      ⚡ {game.deliverySpeed}
                    </span>
                  )}
                </div>
              </div>

              {/* Game Details Area */}
              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: "0 0 4px 0",
                  }}
                >
                  {game.name}
                </h3>
                {game.nameEn && (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "14px" }}>
                    {game.nameEn}
                  </div>
                )}

                {/* Price & Action Button */}
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    paddingTop: "14px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>শুরু মাত্র</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-lime)" }}>
                      ৳ {game.minPrice}
                    </div>
                  </div>

                  <span
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: "0.82rem",
                      padding: "6px 14px",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    টপআপ করুন <ArrowRight size={13} />
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

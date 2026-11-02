import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import GameCheckoutForm from "@/components/shop/GameCheckoutForm";
import { getCatalogGame, normalizeSlug } from "@/lib/catalog-data";
import { ShieldCheck, Zap, Star, Info, ChevronRight, Gamepad2, Award } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);

  try {
    const game = await db.game.findUnique({ where: { slug: normalized } });
    if (game) {
      return {
        title: `${game.name} টপআপ | Topup Center`,
        description: `${game.description || `${game.name} ইন-গেম টপআপ ও ডায়মন্ড প্যাকেজ কিনুন সবচেয়ে কম দামে।`}`,
      };
    }
  } catch {
    // fallback
  }

  const catalog = getCatalogGame(normalized);
  if (catalog) {
    return {
      title: `${catalog.nameBn} (${catalog.name}) টপআপ | Topup Center`,
      description: catalog.descriptionBn,
    };
  }

  return {
    title: "গেম টপআপ | Topup Center",
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const session = await auth();

  let game: any = null;
  let savedPlayerIds: Array<{ id: string; label: string | null; playerFields: Record<string, string> }> = [];

  try {
    game = await db.game.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sort: "asc" },
        },
      },
    });

    if (session?.user?.id && game?.id) {
      const saved = await db.savedPlayerId.findMany({
        where: { userId: session.user.id, gameId: game.id },
      });
      savedPlayerIds = saved.map((s) => ({
        id: s.id,
        label: s.label,
        playerFields: s.playerFields as Record<string, string>,
      }));
    }
  } catch (e) {
    console.error("DB query failed, using catalog fallback for slug:", slug);
  }

  // Fallback to rich catalog data if DB is offline or not seeded
  const catalogFallback = getCatalogGame(slug);
  if (!game && catalogFallback) {
    game = {
      id: catalogFallback.id,
      slug: catalogFallback.slug,
      name: catalogFallback.nameBn,
      nameEn: catalogFallback.nameEn,
      category: catalogFallback.category,
      categoryLabel: catalogFallback.categoryLabelBn,
      image: catalogFallback.image,
      bannerGradient: catalogFallback.bannerGradient,
      accentColor: catalogFallback.accentColor,
      description: catalogFallback.descriptionBn,
      publisher: catalogFallback.publisher,
      rating: catalogFallback.rating,
      deliverySpeed: catalogFallback.deliverySpeed,
      howToFind: catalogFallback.howToFind,
      fields: catalogFallback.fields,
      packages: catalogFallback.packages,
    };
  } else if (!game && !catalogFallback) {
    notFound();
  }

  // Ensure image exists for DB game
  if (game && !game.image && catalogFallback) {
    game.image = catalogFallback.image;
    game.publisher = catalogFallback.publisher;
    game.rating = catalogFallback.rating;
    game.deliverySpeed = catalogFallback.deliverySpeed;
  }

  const fields = (Array.isArray(game.fields) ? game.fields : []) as Array<{
    key: string;
    label: string;
    labelBn?: string;
    type?: string;
    placeholder?: string;
    regex?: string;
    required?: boolean;
    errorMessage?: string;
  }>;

  const packagesSerialized = (game.packages || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    amountLabel: p.amountLabel,
    pricePoisha: p.pricePoisha.toString(),
    isPopular: p.isPopular,
    deliveryTime: p.deliveryTime || game.deliverySpeed || "১-৫ মিনিট",
  }));

  const walletBalancePoisha = session?.user?.walletBalancePoisha
    ? session.user.walletBalancePoisha.toString()
    : "0";

  const gameImage = game.image || `/games/${game.slug}.jpg`;

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "30px 20px 80px" }}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: "24px",
        }}
      >
        <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }} className="hover:text-cyan-400">
          হোম
        </Link>
        <ChevronRight size={14} />
        <Link href="/games" style={{ color: "var(--text-secondary)", textDecoration: "none" }} className="hover:text-cyan-400">
          গেমস ক্যাটালগ
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{game.name}</span>
      </nav>

      {/* Hero Game Header Card */}
      <div
        className="glass-card"
        style={{
          padding: "28px",
          marginBottom: "32px",
          display: "flex",
          gap: "28px",
          alignItems: "center",
          flexWrap: "wrap",
          background:
            game.bannerGradient ||
            "linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(7, 10, 18, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "240px",
            height: "240px",
            background: `radial-gradient(circle, ${game.accentColor || "#22D3EE"}25 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Real Game Artwork Thumbnail */}
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: `0 8px 30px ${game.accentColor || "#22D3EE"}40`,
            border: `2px solid ${game.accentColor || "#22D3EE"}80`,
            flexShrink: 0,
          }}
        >
          <Image
            src={gameImage}
            alt={game.name}
            fill
            sizes="120px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Title, Badges & Meta */}
        <div style={{ flex: 1, minWidth: "280px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              {game.name}
            </h1>
            <span className="badge badge-lime" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Zap size={12} /> ইনস্ট্যান্ট ডেলিভারি
            </span>
            <span className="badge badge-cyan" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={12} /> ভেরিফাইড
            </span>
          </div>

          {game.nameEn && (
            <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span>{game.nameEn}</span>
              {game.publisher && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--accent-cyan)", fontSize: "0.8rem" }}>
                  <Award size={13} /> {game.publisher}
                </span>
              )}
              {game.rating && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#FACC15", fontSize: "0.8rem", fontWeight: 700 }}>
                  <Star size={13} fill="#FACC15" /> {game.rating}
                </span>
              )}
            </div>
          )}

          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6, maxWidth: "700px" }}>
            {game.description}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        {/* Main Interactive Checkout Component */}
        <GameCheckoutForm
          gameId={game.id}
          gameSlug={game.slug}
          gameName={game.name}
          fields={fields}
          packages={packagesSerialized}
          walletBalancePoisha={walletBalancePoisha}
          isLoggedIn={!!session?.user}
          savedPlayerIds={savedPlayerIds}
        />

        {/* How to Find UID Instructions Guide */}
        {game.howToFind && (
          <div
            className="glass-card"
            style={{
              padding: "28px",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.03), rgba(0, 0, 0, 0.4))",
            }}
          >
            <h3
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Info size={18} /> আইডি বের করার নিয়ম
            </h3>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.92rem",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
                background: "rgba(0, 0, 0, 0.35)",
                padding: "18px 22px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
              }}
            >
              {game.howToFind}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

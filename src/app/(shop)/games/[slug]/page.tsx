import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import GameCheckoutForm from "@/components/shop/GameCheckoutForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const game = await db.game.findUnique({ where: { slug } });
    if (game) {
      return {
        title: `${game.name} টপআপ | Topup Center`,
        description: `${game.description || `${game.name} ইন-গেম টপআপ ও ডায়মন্ড প্যাকেজ কিনুন সবচেয়ে কম দামে।`}`,
      };
    }
  } catch {
    // fallback
  }
  return {
    title: "গেম টপআপ | Topup Center",
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  let game = null;
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

    if (session?.user?.id) {
      const saved = await db.savedPlayerId.findMany({
        where: { userId: session.user.id, gameId: game?.id },
      });
      savedPlayerIds = saved.map((s) => ({
        id: s.id,
        label: s.label,
        playerFields: s.playerFields as Record<string, string>,
      }));
    }
  } catch (e) {
    console.error("Error loading game detail:", e);
  }

  // Fallback demo game if DB not seeded
  if (!game) {
    if (slug === "free-fire") {
      game = {
        id: "demo-ff",
        slug: "free-fire",
        name: "ফ্রি ফায়ার ডায়মন্ড (Free Fire)",
        nameEn: "Free Fire Diamond",
        category: "mobile",
        description: "গ্যারেনা ফ্রি ফায়ার ইন-গেম ডায়মন্ড টপআপ। প্লেয়ার আইডি দিয়ে মুহূর্তের মধ্যে ডেলিভারি পান।",
        howToFind: "১. গেম ওপেন করুন।\n২. উপরে বামে প্রোফাইল ব্যানারে ট্যাপ করুন।\n৩. আপনার প্রোফাইল আইডি (UID) কপি করুন।",
        fields: [
          {
            key: "player_id",
            label: "Player ID (UID)",
            labelBn: "প্লেয়ার আইডি (UID)",
            type: "text",
            placeholder: "e.g. 123456789",
            regex: "^\\d{8,11}$",
            required: true,
            errorMessage: "সঠিক ৮-১১ ডিজিটের প্লেয়ার আইডি দিন",
          },
        ] as any,
        packages: [
          { id: "ff-1", name: "25 Diamonds", amountLabel: "25 💎", pricePoisha: BigInt(2500), sort: 1, isPopular: false, deliveryTime: "১-৫ মিনিট" },
          { id: "ff-2", name: "50 Diamonds", amountLabel: "50 💎", pricePoisha: BigInt(4500), sort: 2, isPopular: false, deliveryTime: "১-৫ মিনিট" },
          { id: "ff-3", name: "115 Diamonds", amountLabel: "115 💎", pricePoisha: BigInt(9500), sort: 3, isPopular: true, deliveryTime: "১-৫ মিনিট" },
          { id: "ff-4", name: "240 Diamonds", amountLabel: "240 💎", pricePoisha: BigInt(19000), sort: 4, isPopular: false, deliveryTime: "১-৫ মিনিট" },
          { id: "ff-5", name: "610 Diamonds", amountLabel: "610 💎", pricePoisha: BigInt(47000), sort: 5, isPopular: false, deliveryTime: "১-৫ মিনিট" },
          { id: "ff-6", name: "Weekly Membership", amountLabel: "Weekly 🌟", pricePoisha: BigInt(19500), sort: 6, isPopular: true, deliveryTime: "১-৫ মিনিট" },
        ] as any,
      };
    } else {
      notFound();
    }
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

  const packagesSerialized = game.packages.map((p: any) => ({
    id: p.id,
    name: p.name,
    amountLabel: p.amountLabel,
    pricePoisha: p.pricePoisha.toString(),
    isPopular: p.isPopular,
    deliveryTime: p.deliveryTime,
  }));

  const walletBalancePoisha = session?.user?.walletBalancePoisha
    ? session.user.walletBalancePoisha.toString()
    : "0";

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px 60px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>হোম</Link>
        <span>/</span>
        <Link href="/games" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>গেমস</Link>
        <span>/</span>
        <span style={{ color: "var(--accent-cyan)" }}>{game.name}</span>
      </div>

      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: "28px",
          marginBottom: "30px",
          display: "flex",
          gap: "24px",
          alignItems: "center",
          flexWrap: "wrap",
          background: "linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(7, 10, 18, 0.95))",
          border: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.8rem",
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)",
          }}
        >
          🎮
        </div>

        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              {game.name}
            </h1>
            <span className="badge badge-lime">ইনস্ট্যান্ট</span>
          </div>
          {game.nameEn && (
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "10px" }}>
              {game.nameEn}
            </div>
          )}
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
            {game.description}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
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

        {/* How to Find UID Instructions */}
        {game.howToFind && (
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>ℹ️</span> প্লেয়ার আইডি (UID) কিভাবে বের করবেন?
            </h3>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
                background: "rgba(0, 0, 0, 0.3)",
                padding: "16px 20px",
                borderRadius: "10px",
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

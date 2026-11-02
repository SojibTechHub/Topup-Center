import { Router, Request, Response } from "express";
import { db } from "@/lib/db";
import { getAllCatalogGames, getCatalogGame, normalizeSlug } from "@/lib/catalog-data";

const router = Router();

// GET /api/settings/public
router.get("/settings/public", async (_req: Request, res: Response) => {
  try {
    const raw = await db.setting.findMany();
    const map: Record<string, any> = {};
    raw.forEach((s) => {
      map[s.key] = s.value;
    });

    return res.json({
      success: true,
      settings: {
        site_name: map.site_name || { bn: "টপআপ সেন্টার", en: "Topup Center" },
        site_tagline: map.site_tagline || "বাংলাদেশের সবচেয়ে দ্রুত ও নির্ভরযোগ্য গেম টপআপ প্ল্যাটফর্ম",
        maintenance_mode: map.maintenance_mode || false,
        notice_ticker: map.notice_ticker || {
          text: "⚡ ফ্রি ফায়ার ও পাবজি ইউসি ১০০% অটো ইনস্ট্যান্ট ডেলিভারি চালু আছে! বিকাশ, নগদ, রকেটে পেমেন্ট করুন | ২৪/৭ লাইভ সাপোর্ট",
          active: true,
        },
        support_contacts: map.support_contacts || {
          whatsapp: "+8801812345678",
          telegram: "topupcenter_support",
          email: "support@topupcenter.com",
          phone: "+8801812345678",
        },
        manual_payment_numbers: map.manual_payment_numbers || {
          bkash: "01812345678 (Personal / Send Money)",
          nagad: "01912345678 (Personal / Send Money)",
          rocket: "017123456789 (Personal / Send Money)",
          instruction: "টাকা সেন্ড মানি করার পর নিচে সঠিক TrxID এবং প্রেরকের মোবাইল নম্বর দিন।",
        },
      },
    });
  } catch (error) {
    return res.json({
      success: true,
      settings: {
        site_name: { bn: "টপআপ সেন্টার", en: "Topup Center" },
        site_tagline: "বাংলাদেশের সবচেয়ে দ্রুত ও নির্ভরযোগ্য গেম টপআপ প্ল্যাটফর্ম",
        maintenance_mode: false,
        notice_ticker: {
          text: "⚡ ফ্রি ফায়ার ও পাবজি ইউসি ১০০% অটো ইনস্ট্যান্ট ডেলিভারি চালু আছে! বিকাশ, নগদ, রকেটে পেমেন্ট করুন | ২৪/৭ লাইভ সাপোর্ট",
          active: true,
        },
        support_contacts: {
          whatsapp: "+8801812345678",
          telegram: "topupcenter_support",
          email: "support@topupcenter.com",
          phone: "+8801812345678",
        },
        manual_payment_numbers: {
          bkash: "01812345678 (Personal / Send Money)",
          nagad: "01912345678 (Personal / Send Money)",
          rocket: "017123456789 (Personal / Send Money)",
          instruction: "টাকা সেন্ড মানি করার পর নিচে সঠিক TrxID এবং প্রেরকের মোবাইল নম্বর দিন।",
        },
      },
    });
  }
});

// GET /api/games
router.get("/games", async (req: Request, res: Response) => {
  const { category, q } = req.query as { category?: string; q?: string };

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
      const serialized = dbGames.map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        nameEn: g.nameEn,
        category: g.category,
        image: g.logo || `/games/${g.slug}.jpg`,
        tags: g.tags,
        isPopular: g.isPopular,
        isFeatured: g.isFeatured,
        minPricePoisha: g.packages[0] ? g.packages[0].pricePoisha.toString() : "2000",
        minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 20,
      }));
      return res.json({ success: true, games: serialized });
    }
  } catch (error) {
    console.warn("DB catalog query failed, falling back to static catalog:", error);
  }

  // Fallback to static catalog
  let games = getAllCatalogGames().map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.nameBn,
    nameEn: g.nameEn,
    category: g.category,
    image: g.image,
    tags: g.tags,
    isPopular: g.isPopular,
    isFeatured: g.isFeatured,
    minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 20,
    minPricePoisha: g.packages[0] ? g.packages[0].pricePoisha.toString() : "2000",
    deliverySpeed: g.deliverySpeed,
  }));

  if (category && category !== "all") {
    games = games.filter((g) => g.category === category);
  }
  if (q) {
    const query = q.toLowerCase();
    games = games.filter(
      (g) => g.name.toLowerCase().includes(query) || (g.nameEn && g.nameEn.toLowerCase().includes(query))
    );
  }

  return res.json({ success: true, games });
});

// GET /api/games/:slug
router.get("/games/:slug", async (req: Request, res: Response) => {
  const rawSlug = req.params.slug;
  const slug = normalizeSlug(rawSlug);

  try {
    const game = await db.game.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sort: "asc" },
        },
      },
    });

    if (game) {
      const serialized = {
        ...game,
        image: game.logo || `/games/${game.slug}.jpg`,
        packages: game.packages.map((p) => ({
          ...p,
          pricePoisha: p.pricePoisha.toString(),
          costPoisha: p.costPoisha?.toString(),
        })),
      };
      return res.json({ success: true, game: serialized });
    }
  } catch (error) {
    console.warn("DB game slug query failed, falling back to catalog data:", error);
  }

  const catalogGame = getCatalogGame(slug);
  if (!catalogGame) {
    return res.status(404).json({ error: "GAME_NOT_FOUND", message: `Game with slug '${rawSlug}' not found` });
  }

  return res.json({
    success: true,
    game: {
      id: catalogGame.id,
      slug: catalogGame.slug,
      name: catalogGame.nameBn,
      nameEn: catalogGame.nameEn,
      category: catalogGame.category,
      categoryLabel: catalogGame.categoryLabelBn,
      image: catalogGame.image,
      bannerGradient: catalogGame.bannerGradient,
      accentColor: catalogGame.accentColor,
      description: catalogGame.descriptionBn,
      publisher: catalogGame.publisher,
      rating: catalogGame.rating,
      deliverySpeed: catalogGame.deliverySpeed,
      howToFind: catalogGame.howToFind,
      fields: catalogGame.fields,
      packages: catalogGame.packages.map((p) => ({
        ...p,
        pricePoisha: p.pricePoisha.toString(),
        costPoisha: p.costPoisha?.toString(),
      })),
    },
  });
});

// GET /api/packages
router.get("/packages", async (req: Request, res: Response) => {
  const { gameId } = req.query as { gameId?: string };

  try {
    const packages = await db.package.findMany({
      where: {
        isActive: true,
        ...(gameId ? { gameId } : {}),
      },
      orderBy: { sort: "asc" },
    });

    return res.json({
      success: true,
      packages: packages.map((p) => ({
        ...p,
        pricePoisha: p.pricePoisha.toString(),
        costPoisha: p.costPoisha?.toString(),
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: "FAILED_TO_FETCH_PACKAGES" });
  }
});

export default router;

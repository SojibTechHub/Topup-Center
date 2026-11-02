import { Router, Request, Response } from "express";
import { db } from "@/lib/db";
import { getAllCatalogGames, getCatalogGame, normalizeSlug } from "@/lib/catalog-data";

const router = Router();

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
        image: `/games/${g.slug}.jpg`,
        tags: g.tags,
        isPopular: g.isPopular,
        isFeatured: g.isFeatured,
        minPricePoisha: g.packages[0] ? g.packages[0].pricePoisha.toString() : "2500",
        minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 25,
      }));
      return res.json({ success: true, games: serialized });
    }
  } catch (error) {
    console.warn("DB catalog query failed, falling back to static catalog:", error);
  }

  // Fallback
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
    minPrice: g.packages[0] ? Number(g.packages[0].pricePoisha) / 100 : 25,
    minPricePoisha: g.packages[0] ? g.packages[0].pricePoisha.toString() : "2500",
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
        image: `/games/${game.slug}.jpg`,
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


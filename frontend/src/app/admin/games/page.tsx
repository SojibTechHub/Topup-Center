import { db } from "@/lib/db";
import { AdminGamesManager } from "@/components/admin/AdminGamesManager";

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
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    console.error("Admin games error:", e);
  }

  return <AdminGamesManager initialGames={games} />;
}

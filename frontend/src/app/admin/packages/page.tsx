import { db } from "@/lib/db";
import { AdminPackagesManager } from "@/components/admin/AdminPackagesManager";

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
    games = await db.game.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sort: "asc" },
    });

    const rawPackages = await db.package.findMany({
      where: {
        ...(gameId ? { gameId } : {}),
      },
      include: {
        game: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ gameId: "asc" }, { sort: "asc" }],
    });

    packages = rawPackages.map((p) => ({
      ...p,
      pricePoisha: p.pricePoisha.toString(),
      costPoisha: p.costPoisha?.toString() || "0",
    }));
  } catch (e) {
    console.error("Admin packages error:", e);
  }

  return (
    <AdminPackagesManager
      initialPackages={packages}
      games={games}
      selectedGameId={gameId}
    />
  );
}

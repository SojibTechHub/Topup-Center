import { db } from "@/lib/db";
import { AdminCouponsManager } from "@/components/admin/AdminCouponsManager";

export const metadata = {
  title: "কুপন ও ডিসকাউন্ট ম্যানেজমেন্ট | Admin Mission Control",
};

export default async function AdminCouponsPage() {
  let coupons: any[] = [];

  try {
    const rawCoupons = await db.coupon.findMany({
      include: {
        _count: { select: { orders: true, redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    coupons = rawCoupons.map((c) => ({
      ...c,
      discountValue: c.discountValue.toString(),
      minOrderPoisha: c.minOrderPoisha.toString(),
      maxDiscountPoisha: c.maxDiscountPoisha?.toString() || null,
      validUntil: c.validUntil ? c.validUntil.toISOString() : null,
    }));
  } catch (e) {
    console.error("Admin coupons error:", e);
  }

  return <AdminCouponsManager initialCoupons={coupons} />;
}

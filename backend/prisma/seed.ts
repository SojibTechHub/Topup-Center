import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";
import { GAMES_CATALOG } from "../src/lib/catalog-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed for Topup Center...");

  // 1. Super Admin User
  const adminPasswordHash = await hashPassword("Admin@123456");
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@topupcenter.com" },
    update: {
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Topup Center Admin",
      email: "admin@topupcenter.com",
      phone: "01700000000",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      walletBalancePoisha: BigInt(500000), // 5,000 BDT test wallet
      referralCode: "ADMIN001",
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 2. Demo Customer User
  const customerPasswordHash = await hashPassword("Customer@123");
  const demoCustomer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Arif Hossain",
      email: "customer@example.com",
      phone: "01800000000",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      walletBalancePoisha: BigInt(150000), // 1,500 BDT test wallet
      referralCode: "ARIF777",
    },
  });
  console.log(`✅ Demo Customer created: ${demoCustomer.email}`);

  // 3. System Settings
  const settings = [
    { key: "site_name", value: { bn: "টপআপ সেন্টার", en: "Topup Center" } },
    { key: "site_tagline", value: "বাংলাদেশের সবচেয়ে দ্রুত ও নির্ভরযোগ্য গেম টপআপ প্ল্যাটফর্ম" },
    { key: "maintenance_mode", value: false },
    { key: "notice_ticker", value: { text: "⚡ ফ্রি ফায়ার ও পাবজি ইউসি ১০০% অটো ইনস্ট্যান্ট ডেলিভারি চালু আছে! বিকাশ, নগদ, রকেটে পেমেন্ট করুন | ২৪/৭ লাইভ সাপোর্ট", active: true } },
    { key: "payment_methods", value: { uddoktapay: true, manual: true, wallet: true } },
    { key: "manual_payment_numbers", value: {
        bkash: "01812345678 (Personal / Send Money)",
        nagad: "01912345678 (Personal / Send Money)",
        rocket: "017123456789 (Personal / Send Money)",
        instruction: "টাকা সেন্ড মানি করার পর নিচে সঠিক TrxID এবং প্রেরকের মোবাইল নম্বর দিন।"
      }
    },
    { key: "support_contacts", value: { whatsapp: "+8801812345678", telegram: "topupcenter_support", email: "support@topupcenter.com", phone: "+8801812345678" } },
    { key: "wallet_limits", value: { min_topup_poisha: 5000, max_topup_poisha: 2500000 } },
    { key: "loyalty_rates", value: { cashback_percent: 1, referral_bonus_poisha: 2000 } }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log("✅ System settings configured.");

  // 4. Seed all 15 Games and their Packages from GAMES_CATALOG
  for (const g of GAMES_CATALOG) {
    const game = await prisma.game.upsert({
      where: { slug: g.slug },
      update: {
        name: g.nameBn,
        nameEn: g.nameEn,
        category: g.category,
        description: g.descriptionBn,
        howToFind: g.howToFind,
        fields: g.fields as any,
        tags: g.tags,
        isFeatured: g.isFeatured,
        isPopular: g.isPopular,
        sort: g.sort,
        logo: g.image,
      },
      create: {
        slug: g.slug,
        name: g.nameBn,
        nameEn: g.nameEn,
        category: g.category,
        description: g.descriptionBn,
        howToFind: g.howToFind,
        fields: g.fields as any,
        tags: g.tags,
        isFeatured: g.isFeatured,
        isPopular: g.isPopular,
        sort: g.sort,
        logo: g.image,
      },
    });

    for (const p of g.packages) {
      await prisma.package.upsert({
        where: { id: `${g.slug}-${p.sort}` },
        update: {
          name: p.name,
          amountLabel: p.amountLabel,
          pricePoisha: p.pricePoisha,
          costPoisha: p.costPoisha || (p.pricePoisha * 88n) / 100n,
          isPopular: p.isPopular || false,
          isFeatured: p.isFeatured || false,
          sort: p.sort,
          deliveryTime: p.deliveryTime,
          description: p.badge,
        },
        create: {
          id: `${g.slug}-${p.sort}`,
          gameId: game.id,
          name: p.name,
          amountLabel: p.amountLabel,
          pricePoisha: p.pricePoisha,
          costPoisha: p.costPoisha || (p.pricePoisha * 88n) / 100n,
          isPopular: p.isPopular || false,
          isFeatured: p.isFeatured || false,
          sort: p.sort,
          deliveryTime: p.deliveryTime,
          description: p.badge,
        },
      });
    }
    console.log(`🎮 Seeded ${g.nameBn} (${g.packages.length} packages)`);
  }

  // 5. Promotional Coupons
  const coupons = [
    {
      code: "WELCOME50",
      discountType: "FIXED",
      discountValue: BigInt(5000), // 50 BDT
      minOrderPoisha: BigInt(20000), // 200 BDT
      maxUses: 1000,
      isActive: true,
    },
    {
      code: "HOT10",
      discountType: "PERCENT",
      discountValue: BigInt(10), // 10%
      minOrderPoisha: BigInt(10000), // 100 BDT
      maxDiscountPoisha: BigInt(15000), // Max 150 BDT
      maxUses: 500,
      isActive: true,
    },
    {
      code: "FREEFIRE10",
      discountType: "PERCENT",
      discountValue: BigInt(5),
      minOrderPoisha: BigInt(8000),
      maxUses: 2000,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log("✅ Promotional coupons seeded.");

  console.log("✨ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

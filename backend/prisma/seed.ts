import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

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
    { key: "maintenance_mode", value: false },
    { key: "notice_ticker", value: { text: "⚡ ইনস্ট্যান্ট ডেলিভারি | বিকাশ, নগদ, রকেটে পেমেন্ট করুন | ২৪/৭ লাইভ সাপোর্ট", active: true } },
    { key: "payment_methods", value: { uddoktapay: true, manual: true } },
    { key: "manual_payment_numbers", value: {
        bkash: "01812345678 (Personal / Send Money)",
        nagad: "01912345678 (Personal / Send Money)",
        rocket: "017123456789 (Personal / Send Money)"
      }
    },
    { key: "support_contacts", value: { whatsapp: "+8801800000000", telegram: "topupcenter_support", email: "support@topupcenter.com" } },
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

  // 4. Game Catalog
  const gamesData = [
    {
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
      ],
      tags: ["Hot", "Instant", "BD Server"],
      isFeatured: true,
      isPopular: true,
      sort: 1,
      packages: [
        { name: "25 Diamonds", amountLabel: "25 💎", pricePoisha: BigInt(2500), costPoisha: BigInt(2000), sort: 1, deliveryTime: "১-৫ মিনিট" },
        { name: "50 Diamonds", amountLabel: "50 💎", pricePoisha: BigInt(4500), costPoisha: BigInt(3800), sort: 2, deliveryTime: "১-৫ মিনিট" },
        { name: "115 Diamonds", amountLabel: "115 💎", pricePoisha: BigInt(9500), costPoisha: BigInt(8000), sort: 3, isPopular: true, deliveryTime: "১-৫ মিনিট" },
        { name: "240 Diamonds", amountLabel: "240 💎", pricePoisha: BigInt(19000), costPoisha: BigInt(16500), sort: 4, deliveryTime: "১-৫ মিনিট" },
        { name: "610 Diamonds", amountLabel: "610 💎", pricePoisha: BigInt(47000), costPoisha: BigInt(41000), sort: 5, isFeatured: true, deliveryTime: "১-৫ মিনিট" },
        { name: "1240 Diamonds", amountLabel: "1240 💎", pricePoisha: BigInt(95000), costPoisha: BigInt(83000), sort: 6, deliveryTime: "১-৫ মিনিট" },
        { name: "Weekly Membership", amountLabel: "Weekly 🌟", pricePoisha: BigInt(19500), costPoisha: BigInt(17000), sort: 7, isPopular: true, deliveryTime: "১-৫ মিনিট" },
        { name: "Monthly Membership", amountLabel: "Monthly 👑", pricePoisha: BigInt(95000), costPoisha: BigInt(84000), sort: 8, deliveryTime: "১-৫ মিনিট" },
      ],
    },
    {
      slug: "pubg-mobile",
      name: "পাবজি মোবাইল ইউসি (PUBG UC)",
      nameEn: "PUBG Mobile UC",
      category: "mobile",
      description: "PUBG Mobile গ্লোবাল এবং বিডি ভার্সনের ইউসি টপআপ। ক্যারেক্টার আইডি দিন।",
      howToFind: "১. গেমের বামে প্রোফাইল আইকনে যান।\n২. ক্যারেক্টার আইডি ও নাম দেখতে পাবেন।\n৩. আইডি কপি করুন।",
      fields: [
        {
          key: "character_id",
          label: "Character ID (UID)",
          labelBn: "ক্যারেক্টার আইডি",
          type: "text",
          placeholder: "e.g. 5123456789",
          regex: "^\\d{7,12}$",
          required: true,
          errorMessage: "সঠিক ৭-১২ ডিজিটের ক্যারেক্টার আইডি দিন",
        },
      ],
      tags: ["Popular", "Instant"],
      isFeatured: true,
      isPopular: true,
      sort: 2,
      packages: [
        { name: "60 UC", amountLabel: "60 UC", pricePoisha: BigInt(11500), costPoisha: BigInt(9800), sort: 1, deliveryTime: "২-১০ মিনিট" },
        { name: "325 UC", amountLabel: "325 UC", pricePoisha: BigInt(56000), costPoisha: BigInt(49000), sort: 2, isPopular: true, deliveryTime: "২-১০ মিনিট" },
        { name: "660 UC", amountLabel: "660 UC", pricePoisha: BigInt(110000), costPoisha: BigInt(97000), sort: 3, isFeatured: true, deliveryTime: "২-১০ মিনিট" },
        { name: "1800 UC", amountLabel: "1800 UC", pricePoisha: BigInt(295000), costPoisha: BigInt(260000), sort: 4, deliveryTime: "২-১০ মিনিট" },
        { name: "Royale Pass Pack", amountLabel: "Royale Pass 🎫", pricePoisha: BigInt(115000), costPoisha: BigInt(100000), sort: 5, deliveryTime: "২-১০ মিনিট" },
      ],
    },
    {
      slug: "mobile-legends",
      name: "মোবাইল লেজেন্ডস (MLBB Diamonds)",
      nameEn: "Mobile Legends Bang Bang",
      category: "mobile",
      description: "মোবাইল লেজেন্ডস ডায়মন্ড এবং সাপ্তাহিক ডায়মন্ড পাস। ইউজার আইডি ও জোন আইডি দিন।",
      howToFind: "১. গেমের উপরে বামে আপনার অ্যাভাটারে ট্যাপ করুন।\n২. প্রোফাইলে দেখতে পাবেন User ID(Zone ID), যেমন: 12345678(1234)।",
      fields: [
        {
          key: "user_id",
          label: "User ID",
          labelBn: "ইউজার আইডি",
          type: "text",
          placeholder: "e.g. 12345678",
          regex: "^\\d{6,10}$",
          required: true,
          errorMessage: "সঠিক ইউজার আইডি দিন",
        },
        {
          key: "zone_id",
          label: "Zone ID",
          labelBn: "জোন আইডি (ব্র্যাকেটের অংশ)",
          type: "text",
          placeholder: "e.g. 1234",
          regex: "^\\d{3,6}$",
          required: true,
          errorMessage: "সঠিক জোন আইডি দিন",
        },
      ],
      tags: ["Hot", "Auto-Check"],
      isFeatured: true,
      isPopular: true,
      sort: 3,
      packages: [
        { name: "86 Diamonds", amountLabel: "86 💎", pricePoisha: BigInt(16500), costPoisha: BigInt(14000), sort: 1, deliveryTime: "১-৫ মিনিট" },
        { name: "172 Diamonds", amountLabel: "172 💎", pricePoisha: BigInt(32000), costPoisha: BigInt(27500), sort: 2, isPopular: true, deliveryTime: "১-৫ মিনিট" },
        { name: "257 Diamonds", amountLabel: "257 💎", pricePoisha: BigInt(48000), costPoisha: BigInt(41500), sort: 3, deliveryTime: "১-৫ মিনিট" },
        { name: "Weekly Diamond Pass", amountLabel: "Weekly Pass 🎁", pricePoisha: BigInt(22000), costPoisha: BigInt(19000), sort: 4, isFeatured: true, deliveryTime: "১-৫ মিনিট" },
        { name: "Twilight Pass", amountLabel: "Twilight Pass 🌙", pricePoisha: BigInt(125000), costPoisha: BigInt(110000), sort: 5, deliveryTime: "১-৫ মিনিট" },
      ],
    },
    {
      slug: "clash-of-clans",
      name: "ক্ল্যাশ অব ক্ল্যানস (Clash of Clans)",
      nameEn: "Clash of Clans",
      category: "mobile",
      description: "সুপারসেল ক্ল্যাশ অব ক্ল্যানস জেমস ও গোল্ড পাস টপআপ। প্লেয়ার ট্যাগ দিন।",
      howToFind: "১. আপনার গেমের প্রোফাইলে যান।\n২. নামের নিচে # দিয়ে শুরু হওয়া প্লেয়ার ট্যাগ পাবেন (e.g. #P9L829YQ)।",
      fields: [
        {
          key: "player_tag",
          label: "Player Tag",
          labelBn: "প্লেয়ার ট্যাগ (# সহ)",
          type: "text",
          placeholder: "e.g. #P9L829YQ",
          regex: "^#?[0-9A-Za-z]{6,12}$",
          required: true,
          errorMessage: "সঠিক প্লেয়ার ট্যাগ দিন (যেমন #P9L829YQ)",
        },
      ],
      tags: ["Supercell", "Instant"],
      isFeatured: false,
      isPopular: true,
      sort: 4,
      packages: [
        { name: "88 Gems", amountLabel: "88 💎", pricePoisha: BigInt(12500), costPoisha: BigInt(10500), sort: 1, deliveryTime: "৫-১৫ মিনিট" },
        { name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(59000), costPoisha: BigInt(51000), sort: 2, isPopular: true, deliveryTime: "৫-১৫ মিনিট" },
        { name: "1200 Gems", amountLabel: "1200 💎", pricePoisha: BigInt(120000), costPoisha: BigInt(105000), sort: 3, deliveryTime: "৫-১৫ মিনিট" },
        { name: "Gold Pass", amountLabel: "Gold Pass 🏆", pricePoisha: BigInt(85000), costPoisha: BigInt(74000), sort: 4, isFeatured: true, deliveryTime: "৫-১৫ মিনিট" },
      ],
    },
    {
      slug: "dream-league-soccer",
      name: "ড্রিম লিগ সকার (DLS Coins & Gems)",
      nameEn: "Dream League Soccer",
      category: "mobile",
      description: "DLS জেমস ও কয়েন টপআপ। দ্রুত ও বিশ্বস্ত ডেলিভারি।",
      howToFind: "১. গেমে সেটিংস > অ্যাডভান্সড এ যান।\n২. ইউজার আইডি কপি করুন।",
      fields: [
        {
          key: "user_id",
          label: "DLS User ID",
          labelBn: "ডিএলএস ইউজার আইডি",
          type: "text",
          placeholder: "e.g. DLS-98213",
          regex: "^.+$",
          required: true,
          errorMessage: "ইউজার আইডি দিন",
        },
      ],
      tags: ["Sports", "Soccer"],
      isFeatured: false,
      isPopular: false,
      sort: 5,
      packages: [
        { name: "100 Gems", amountLabel: "100 💎", pricePoisha: BigInt(19000), costPoisha: BigInt(16000), sort: 1, deliveryTime: "১০-৩০ মিনিট" },
        { name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(89000), costPoisha: BigInt(78000), sort: 2, isPopular: true, deliveryTime: "১০-৩০ মিনিট" },
        { name: "Season Pass", amountLabel: "Season Pass ⚽", pricePoisha: BigInt(65000), costPoisha: BigInt(56000), sort: 3, deliveryTime: "১০-৩০ মিনিট" },
      ],
    },
    {
      slug: "roblox",
      name: "রোবলক্স রোবক্স (Roblox Robux)",
      nameEn: "Roblox Robux",
      category: "pc",
      description: "রোবলক্স রোবক্স কোড অথবা ডিরেক্ট আইডি টপআপ।",
      howToFind: "আপনার রোবলক্স ইউজারনেম দিন (ডিসপ্লে নাম নয়)।",
      fields: [
        {
          key: "username",
          label: "Roblox Username",
          labelBn: "রোবলক্স ইউজারনেম",
          type: "text",
          placeholder: "e.g. ProGamerBD",
          regex: "^[A-Za-z0-9_]{3,20}$",
          required: true,
          errorMessage: "সঠিক রোবলক্স ইউজারনেম দিন",
        },
      ],
      tags: ["PC", "Mobile", "Robux"],
      isFeatured: false,
      isPopular: true,
      sort: 6,
      packages: [
        { name: "80 Robux", amountLabel: "80 R$", pricePoisha: BigInt(13500), costPoisha: BigInt(11500), sort: 1, deliveryTime: "৫-২০ মিনিট" },
        { name: "400 Robux", amountLabel: "400 R$", pricePoisha: BigInt(59000), costPoisha: BigInt(51000), sort: 2, isPopular: true, deliveryTime: "৫-২০ মিনিট" },
        { name: "800 Robux", amountLabel: "800 R$", pricePoisha: BigInt(118000), costPoisha: BigInt(102000), sort: 3, deliveryTime: "৫-২০ মিনিট" },
        { name: "1700 Robux", amountLabel: "1700 R$", pricePoisha: BigInt(245000), costPoisha: BigInt(215000), sort: 4, deliveryTime: "৫-২০ মিনিট" },
      ],
    },
    {
      slug: "steam-wallet",
      name: "স্টিম ওয়ালেট কার্ড (Steam Wallet BD/USD)",
      nameEn: "Steam Wallet Code",
      category: "pc",
      description: "স্টিম গ্লোবাল এবং ইউএসডি ওয়ালেট কোড। কোড রিডিম করে যে কোনো পিসি গেম কিনুন।",
      howToFind: "ডেলিভারির জন্য আপনার সচল ইমেইল বা ফোন নম্বর দিন। কোড পাঠানো হবে।",
      fields: [
        {
          key: "delivery_email",
          label: "Delivery Email",
          labelBn: "ডেলিভারি ইমেইল",
          type: "email",
          placeholder: "your-email@example.com",
          regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          required: true,
          errorMessage: "সঠিক ডেলিভারি ইমেইল দিন",
        },
      ],
      tags: ["PC", "Code", "Instant"],
      isFeatured: true,
      isPopular: true,
      sort: 7,
      packages: [
        { name: "$5 USD Steam Card", amountLabel: "$5 USD", pricePoisha: BigInt(63000), costPoisha: BigInt(58000), sort: 1, deliveryTime: "১-১০ মিনিট" },
        { name: "$10 USD Steam Card", amountLabel: "$10 USD", pricePoisha: BigInt(125000), costPoisha: BigInt(115000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট" },
        { name: "$20 USD Steam Card", amountLabel: "$20 USD", pricePoisha: BigInt(248000), costPoisha: BigInt(230000), sort: 3, deliveryTime: "১-১০ মিনিট" },
        { name: "500 BDT Steam Code", amountLabel: "৳৫০০ BDT", pricePoisha: BigInt(55000), costPoisha: BigInt(50000), sort: 4, deliveryTime: "১-১০ মিনিট" },
      ],
    },
    {
      slug: "google-play",
      name: "গুগল প্লে গিফট কার্ড (Google Play Gift Card)",
      nameEn: "Google Play Gift Card US",
      category: "card",
      description: "ইউএস রিজিয়ন গুগল প্লে গিফট কার্ড কোড। ইন-অ্যাপ পারচেজের জন্য সেরা।",
      howToFind: "আপনার গুগল অ্যাকাউন্ট রিজিয়ন অবশ্যই United States (US) হতে হবে।",
      fields: [
        {
          key: "delivery_email",
          label: "Delivery Email",
          labelBn: "ডেলিভারি ইমেইল",
          type: "email",
          placeholder: "your-email@example.com",
          regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          required: true,
          errorMessage: "সঠিক ডেলিভারি ইমেইল দিন",
        },
      ],
      tags: ["Card", "US Region"],
      isFeatured: false,
      isPopular: false,
      sort: 8,
      packages: [
        { name: "$5 Google Play (US)", amountLabel: "$5 US", pricePoisha: BigInt(62000), costPoisha: BigInt(57000), sort: 1, deliveryTime: "১-১০ মিনিট" },
        { name: "$10 Google Play (US)", amountLabel: "$10 US", pricePoisha: BigInt(122000), costPoisha: BigInt(112000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট" },
        { name: "$25 Google Play (US)", amountLabel: "$25 US", pricePoisha: BigInt(300000), costPoisha: BigInt(280000), sort: 3, deliveryTime: "১-১০ মিনিট" },
      ],
    },
  ];

  for (const g of gamesData) {
    const { packages, ...gameInfo } = g;
    const game = await prisma.game.upsert({
      where: { slug: g.slug },
      update: {
        ...gameInfo,
      },
      create: {
        ...gameInfo,
      },
    });

    console.log(`🎮 Game created/updated: ${game.nameEn}`);

    // Create or update packages
    for (const pkg of packages) {
      const existingPkg = await prisma.package.findFirst({
        where: { gameId: game.id, name: pkg.name },
      });

      if (existingPkg) {
        await prisma.package.update({
          where: { id: existingPkg.id },
          data: {
            ...pkg,
          },
        });
      } else {
        await prisma.package.create({
          data: {
            gameId: game.id,
            ...pkg,
          },
        });
      }
    }
  }

  // 5. Coupons
  const coupons = [
    {
      code: "WELCOME50",
      discountType: "FIXED",
      discountValue: BigInt(5000), // 50 BDT off
      minOrderPoisha: BigInt(20000), // Min 200 BDT
      maxUses: 1000,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: "HOT10",
      discountType: "PERCENT",
      discountValue: BigInt(10), // 10%
      maxDiscountPoisha: BigInt(10000), // Max 100 BDT
      minOrderPoisha: BigInt(10000),
      maxUses: 500,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log("✅ Coupons created: WELCOME50, HOT10");

  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export interface CatalogPackage {
  id: string;
  name: string;
  amountLabel: string;
  pricePoisha: bigint;
  costPoisha?: bigint;
  sort: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  deliveryTime: string;
  badge?: string;
}

export interface CatalogField {
  key: string;
  label: string;
  labelBn: string;
  type: string;
  placeholder: string;
  regex?: string;
  required: boolean;
  errorMessage: string;
}

export interface CatalogGame {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  nameEn: string;
  category: "mobile" | "pc" | "card";
  categoryLabel: string;
  categoryLabelBn: string;
  image: string;
  bannerGradient: string;
  accentColor: string;
  description: string;
  descriptionBn: string;
  publisher: string;
  rating: number;
  deliverySpeed: string;
  howToFind: string;
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
  sort: number;
  fields: CatalogField[];
  packages: CatalogPackage[];
}

export const GAMES_CATALOG: CatalogGame[] = [
  // 1. Free Fire
  {
    id: "game-ff",
    slug: "free-fire",
    name: "Free Fire Diamond",
    nameBn: "ফ্রি ফায়ার ডায়মন্ড",
    nameEn: "Garena Free Fire",
    category: "mobile",
    categoryLabel: "Mobile Game",
    categoryLabelBn: "মোবাইল গেম",
    image: "/games/free-fire.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.15))",
    accentColor: "#F97316",
    description: "Instant Garena Free Fire Diamond top-up via Player UID. Fast, 100% safe, and automated delivery.",
    descriptionBn: "গ্যারেনা ফ্রি ফায়ার ইন-গেম ডায়মন্ড টপআপ। প্লেয়ার আইডি দিয়ে মুহূর্তের মধ্যে ১-৫ মিনিটে ১০০% নিরাপদ ডেলিভারি পান।",
    publisher: "Garena",
    rating: 4.9,
    deliverySpeed: "১-৫ মিনিট",
    howToFind: "১. গেম ওপেন করুন।\n২. উপরে বামে প্রোফাইল ব্যানারে ট্যাপ করুন।\n৩. আপনার প্রোফাইল আইডি (UID) কপি করুন।",
    tags: ["Hot", "Instant", "BD Server", "Most Popular"],
    isFeatured: true,
    isPopular: true,
    sort: 1,
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
    packages: [
      { id: "ff-1", name: "25 Diamonds", amountLabel: "25 💎", pricePoisha: BigInt(2000), costPoisha: BigInt(1700), sort: 1, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-2", name: "50 Diamonds", amountLabel: "50 💎", pricePoisha: BigInt(4000), costPoisha: BigInt(3400), sort: 2, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-3", name: "115 Diamonds", amountLabel: "115 💎", pricePoisha: BigInt(8000), costPoisha: BigInt(7000), sort: 3, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "বেস্টসেলার" },
      { id: "ff-4", name: "240 Diamonds", amountLabel: "240 💎", pricePoisha: BigInt(16500), costPoisha: BigInt(14800), sort: 4, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-5", name: "355 Diamonds", amountLabel: "355 💎", pricePoisha: BigInt(24500), costPoisha: BigInt(22000), sort: 5, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-6", name: "610 Diamonds", amountLabel: "610 💎", pricePoisha: BigInt(41500), costPoisha: BigInt(37500), sort: 6, isFeatured: true, deliveryTime: "১-৫ মিনিট", badge: "বোনাস" },
      { id: "ff-7", name: "1240 Diamonds", amountLabel: "1240 💎", pricePoisha: BigInt(82500), costPoisha: BigInt(75000), sort: 7, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-8", name: "2530 Diamonds", amountLabel: "2530 💎", pricePoisha: BigInt(165000), costPoisha: BigInt(150000), sort: 8, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-9", name: "Weekly Membership", amountLabel: "Weekly 🌟", pricePoisha: BigInt(16500), costPoisha: BigInt(14500), sort: 9, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "সঞ্চয়ী" },
      { id: "ff-10", name: "Monthly Membership", amountLabel: "Monthly 👑", pricePoisha: BigInt(82000), costPoisha: BigInt(73000), sort: 10, deliveryTime: "১-৫ মিনিট", badge: "ভিআইপি" },
      { id: "ff-11", name: "Level Up Pass", amountLabel: "Level Up 🏆", pricePoisha: BigInt(15500), costPoisha: BigInt(13500), sort: 11, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-12", name: "Weekly Lite", amountLabel: "Lite ⚡", pricePoisha: BigInt(4500), costPoisha: BigInt(3800), sort: 12, deliveryTime: "১-৫ মিনিট" },
    ],
  },

  // 2. PUBG Mobile UC
  {
    id: "game-pubg",
    slug: "pubg-mobile",
    name: "PUBG Mobile UC",
    nameBn: "পাবজি মোবাইল ইউসি",
    nameEn: "PUBG Mobile UC",
    category: "mobile",
    categoryLabel: "Mobile Game",
    categoryLabelBn: "মোবাইল গেম",
    image: "/games/pubg-mobile.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(180, 83, 9, 0.15))",
    accentColor: "#F59E0B",
    description: "Official PUBG Mobile Unknown Cash (UC) top-up. Global & BD region supported with instant crediting.",
    descriptionBn: "PUBG Mobile গ্লোবাল এবং বিডি ভার্সনের ইউসি টপআপ। ক্যারেক্টার আইডি দিন এবং দ্রুত ইউসি পান।",
    publisher: "Krafton / Tencent",
    rating: 4.8,
    deliverySpeed: "২-১০ মিনিট",
    howToFind: "১. গেমের উপরে বামে প্রোফাইল আইকনে ক্লিক করুন।\n২. ক্যারেক্টার আইডি (Character ID) দেখতে পাবেন।\n৩. কপি আইকনে ট্যাপ করে আইডি কপি করুন।",
    tags: ["Hot", "Instant", "Royale Pass"],
    isFeatured: true,
    isPopular: true,
    sort: 2,
    fields: [
      {
        key: "character_id",
        label: "Character ID (UID)",
        labelBn: "ক্যারেক্টার আইডি (Character ID)",
        type: "text",
        placeholder: "e.g. 5123456789",
        regex: "^\\d{7,12}$",
        required: true,
        errorMessage: "সঠিক ৭-১২ ডিজিটের ক্যারেক্টার আইডি দিন",
      },
    ],
    packages: [
      { id: "pubg-1", name: "60 UC", amountLabel: "60 UC", pricePoisha: BigInt(9500), costPoisha: BigInt(8200), sort: 1, deliveryTime: "২-১০ মিনিট" },
      { id: "pubg-2", name: "355 UC (325+30)", amountLabel: "355 UC", pricePoisha: BigInt(49500), costPoisha: BigInt(44000), sort: 2, isPopular: true, deliveryTime: "২-১০ মিনিট", badge: "সেরা ডিল" },
      { id: "pubg-3", name: "720 UC (660+60)", amountLabel: "720 UC", pricePoisha: BigInt(98000), costPoisha: BigInt(87500), sort: 3, isFeatured: true, deliveryTime: "২-১০ মিনিট", badge: "Royale Pass" },
      { id: "pubg-4", name: "1800 UC", amountLabel: "1800 UC", pricePoisha: BigInt(255000), costPoisha: BigInt(230000), sort: 4, deliveryTime: "২-১০ মিনিট" },
      { id: "pubg-5", name: "3850 UC", amountLabel: "3850 UC", pricePoisha: BigInt(510000), costPoisha: BigInt(460000), sort: 5, deliveryTime: "২-১০ মিনিট", badge: "মেগা প্যাক" },
      { id: "pubg-6", name: "Royale Pass Upgrade", amountLabel: "Royale Pass 🎫", pricePoisha: BigInt(49500), costPoisha: BigInt(44000), sort: 6, isPopular: true, deliveryTime: "২-১০ মিনিট" },
      { id: "pubg-7", name: "Elite Pass Plus", amountLabel: "Elite Pass Plus 🌟", pricePoisha: BigInt(125000), costPoisha: BigInt(112000), sort: 7, deliveryTime: "২-১০ মিনিট" },
    ],
  },

  // 3. Mobile Legends MLBB
  {
    id: "game-mlbb",
    slug: "mobile-legends",
    name: "Mobile Legends MLBB",
    nameBn: "মোবাইল লেজেন্ডস",
    nameEn: "Mobile Legends: Bang Bang",
    category: "mobile",
    categoryLabel: "Mobile Game",
    categoryLabelBn: "মোবাইল গেম",
    image: "/games/mobile-legends.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(147, 51, 234, 0.2))",
    accentColor: "#3B82F6",
    description: "Official Mobile Legends Bang Bang Diamonds and Weekly Diamond Pass topup via User ID and Zone ID.",
    descriptionBn: "মোবাইল লেজেন্ডস ডায়মন্ড এবং সাপ্তাহিক ডায়মন্ড পাস। ইউজার আইডি ও জোন আইডি দিয়ে সরাসরি টপআপ নিন।",
    publisher: "Moonton",
    rating: 4.9,
    deliverySpeed: "১-৫ মিনিট",
    howToFind: "১. গেমের উপরে বামে আপনার অ্যাভাটারে ট্যাপ করুন।\n২. প্রোফাইলে দেখতে পাবেন User ID(Zone ID), যেমন: 12345678(1234)।\n৩. প্রথম অংশ ইউজার আইডি এবং ব্র্যাকেটের অংশ জোন আইডি।",
    tags: ["Hot", "Auto-Check", "Weekly Pass"],
    isFeatured: true,
    isPopular: true,
    sort: 3,
    fields: [
      {
        key: "user_id",
        label: "User ID",
        labelBn: "ইউজার আইডি (User ID)",
        type: "text",
        placeholder: "e.g. 12345678",
        regex: "^\\d{6,10}$",
        required: true,
        errorMessage: "সঠিক ইউজার আইডি দিন",
      },
      {
        key: "zone_id",
        label: "Zone ID",
        labelBn: "জোন আইডি (Zone ID - ব্র্যাকেটের ভেতরের অংশ)",
        type: "text",
        placeholder: "e.g. 1234",
        regex: "^\\d{3,6}$",
        required: true,
        errorMessage: "সঠিক জোন আইডি দিন",
      },
    ],
    packages: [
      { id: "mlbb-1", name: "86 Diamonds", amountLabel: "86 💎", pricePoisha: BigInt(14500), costPoisha: BigInt(12800), sort: 1, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-2", name: "172 Diamonds", amountLabel: "172 💎", pricePoisha: BigInt(28500), costPoisha: BigInt(25500), sort: 2, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "সেরা রেট" },
      { id: "mlbb-3", name: "257 Diamonds", amountLabel: "257 💎", pricePoisha: BigInt(42000), costPoisha: BigInt(38000), sort: 3, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-4", name: "344 Diamonds", amountLabel: "344 💎", pricePoisha: BigInt(56000), costPoisha: BigInt(50500), sort: 4, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-5", name: "429 Diamonds", amountLabel: "429 💎", pricePoisha: BigInt(70000), costPoisha: BigInt(63000), sort: 5, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-6", name: "514 Diamonds", amountLabel: "514 💎", pricePoisha: BigInt(84000), costPoisha: BigInt(76000), sort: 6, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-7", name: "706 Diamonds", amountLabel: "706 💎", pricePoisha: BigInt(114000), costPoisha: BigInt(103000), sort: 7, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-8", name: "Weekly Diamond Pass", amountLabel: "Weekly Pass 🎁", pricePoisha: BigInt(18500), costPoisha: BigInt(16000), sort: 8, isFeatured: true, deliveryTime: "১-৫ মিনিট", badge: "বেস্টসেলার" },
      { id: "mlbb-9", name: "Twilight Pass", amountLabel: "Twilight Pass 🌙", pricePoisha: BigInt(108000), costPoisha: BigInt(97000), sort: 9, deliveryTime: "১-৫ মিনিট" },
    ],
  },

  // 4. Call of Duty: Mobile (CODM)
  {
    id: "game-codm",
    slug: "call-of-duty-mobile",
    name: "Call of Duty: Mobile CP",
    nameBn: "কল অব ডিউটি মোবাইল (CODM)",
    nameEn: "Call of Duty: Mobile CP",
    category: "mobile",
    categoryLabel: "Mobile Game",
    categoryLabelBn: "মোবাইল গেম",
    image: "/games/call-of-duty-mobile.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.2))",
    accentColor: "#F59E0B",
    description: "Official Call of Duty: Mobile COD Points (CP) top-up directly via Player ID. Battle Pass and crates made easy.",
    descriptionBn: "কল অব ডিউটি মোবাইল CP টপআপ। প্লেয়ার আইডি দিয়ে দ্রুত ব্যাটেল পাস ও সিজনাল ড্র এর CP কিনুন।",
    publisher: "Activision / Garena",
    rating: 4.9,
    deliverySpeed: "২-৮ মিনিট",
    howToFind: "১. গেমে ঢুকে প্রোফাইলে ট্যাপ করুন।\n২. Basic ট্যাবে Player UID নম্বর দেখতে পাবেন।\n৩. আইডি কপি করুন।",
    tags: ["Hot", "COD Points", "Battle Pass"],
    isFeatured: true,
    isPopular: true,
    sort: 4,
    fields: [
      {
        key: "player_id",
        label: "Player UID",
        labelBn: "প্লেয়ার UID",
        type: "text",
        placeholder: "e.g. 6749182390123",
        regex: "^\\d{10,20}$",
        required: true,
        errorMessage: "সঠিক প্লেয়ার UID দিন",
      },
    ],
    packages: [
      { id: "codm-1", name: "80 CP", amountLabel: "80 CP", pricePoisha: BigInt(9500), costPoisha: BigInt(8000), sort: 1, deliveryTime: "২-৮ মিনিট" },
      { id: "codm-2", name: "420 CP", amountLabel: "420 CP", pricePoisha: BigInt(48000), costPoisha: BigInt(42000), sort: 2, isPopular: true, deliveryTime: "২-৮ মিনিট", badge: "সেরা অফার" },
      { id: "codm-3", name: "880 CP", amountLabel: "880 CP", pricePoisha: BigInt(98000), costPoisha: BigInt(87000), sort: 3, isFeatured: true, deliveryTime: "২-৮ মিনিট", badge: "জনপ্রিয়" },
      { id: "codm-4", name: "Battle Pass Pack", amountLabel: "Battle Pass 🎖️", pricePoisha: BigInt(39000), costPoisha: BigInt(34000), sort: 4, deliveryTime: "২-৮ মিনিট" },
      { id: "codm-5", name: "2400 CP", amountLabel: "2400 CP", pricePoisha: BigInt(255000), costPoisha: BigInt(228000), sort: 5, deliveryTime: "২-৮ মিনিট" },
    ],
  },

  // 5. Clash of Clans
  {
    id: "game-coc",
    slug: "clash-of-clans",
    name: "Clash of Clans",
    nameBn: "ক্ল্যাশ অব ক্ল্যানস",
    nameEn: "Clash of Clans",
    category: "mobile",
    categoryLabel: "Strategy",
    categoryLabelBn: "স্ট্র্যাটেজি গেম",
    image: "/games/clash-of-clans.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.15))",
    accentColor: "#22C55E",
    description: "Supercell Clash of Clans Green Gems and Gold Pass topup directly to your player tag.",
    descriptionBn: "সুপারসেল ক্ল্যাশ অব ক্ল্যানস জেমস ও গোল্ড পাস টপআপ। আপনার প্লেয়ার ট্যাগ দিয়ে নিরাপদে কিনুন।",
    publisher: "Supercell",
    rating: 4.8,
    deliverySpeed: "৫-১৫ মিনিট",
    howToFind: "১. আপনার গেমের প্রোফাইলে যান।\n২. নামের নিচে # দিয়ে শুরু হওয়া প্লেয়ার ট্যাগ পাবেন (e.g. #P9L829YQ)।\n৩. ট্যাগ কপি করে পেস্ট করুন।",
    tags: ["Supercell", "Gold Pass", "Instant"],
    isFeatured: false,
    isPopular: true,
    sort: 5,
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
    packages: [
      { id: "coc-1", name: "88 Gems", amountLabel: "88 💎", pricePoisha: BigInt(9500), costPoisha: BigInt(8200), sort: 1, deliveryTime: "৫-১৫ মিনিট" },
      { id: "coc-2", name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(49000), costPoisha: BigInt(43000), sort: 2, isPopular: true, deliveryTime: "৫-১৫ মিনিট", badge: "ভ্যালু প্যাক" },
      { id: "coc-3", name: "1200 Gems", amountLabel: "1200 💎", pricePoisha: BigInt(99000), costPoisha: BigInt(88000), sort: 3, deliveryTime: "৫-১৫ মিনিট" },
      { id: "coc-4", name: "2500 Gems", amountLabel: "2500 💎", pricePoisha: BigInt(198000), costPoisha: BigInt(175000), sort: 4, deliveryTime: "৫-১৫ মিনিট" },
      { id: "coc-5", name: "Gold Pass", amountLabel: "Gold Pass 🏆", pricePoisha: BigInt(69000), costPoisha: BigInt(61000), sort: 5, isFeatured: true, deliveryTime: "৫-১৫ মিনিট", badge: "সিজনাল" },
    ],
  },

  // 6. Clash Royale
  {
    id: "game-cr",
    slug: "clash-royale",
    name: "Clash Royale",
    nameBn: "ক্ল্যাশ রয়্যাল",
    nameEn: "Clash Royale",
    category: "mobile",
    categoryLabel: "Strategy",
    categoryLabelBn: "স্ট্র্যাটেজি গেম",
    image: "/games/clash-royale.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(30, 64, 175, 0.2))",
    accentColor: "#3B82F6",
    description: "Official Supercell Clash Royale Gems, Gold, and Pass Royale top-up directly via Player Tag.",
    descriptionBn: "ক্ল্যাশ রয়্যাল জেমস এবং পাস রয়্যাল টপআপ। প্লেয়ার ট্যাগ দিয়ে সহজে কিনুন।",
    publisher: "Supercell",
    rating: 4.8,
    deliverySpeed: "৫-১৫ মিনিট",
    howToFind: "১. গেমে নিজের প্রোফাইলে ট্যাপ করুন।\n২. নামের নিচে থাকা # ট্যাগ কপি করুন।",
    tags: ["Supercell", "Pass Royale", "Gems"],
    isFeatured: false,
    isPopular: false,
    sort: 6,
    fields: [
      {
        key: "player_tag",
        label: "Player Tag",
        labelBn: "প্লেয়ার ট্যাগ (# সহ)",
        type: "text",
        placeholder: "e.g. #CR98231",
        regex: "^#?[0-9A-Za-z]{6,12}$",
        required: true,
        errorMessage: "সঠিক প্লেয়ার ট্যাগ দিন",
      },
    ],
    packages: [
      { id: "cr-1", name: "80 Gems", amountLabel: "80 💎", pricePoisha: BigInt(9500), costPoisha: BigInt(8200), sort: 1, deliveryTime: "৫-১৫ মিনিট" },
      { id: "cr-2", name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(49000), costPoisha: BigInt(43000), sort: 2, deliveryTime: "৫-১৫ মিনিট" },
      { id: "cr-3", name: "Pass Royale Gold", amountLabel: "Pass Gold 👑", pricePoisha: BigInt(69000), costPoisha: BigInt(61000), sort: 3, isPopular: true, deliveryTime: "৫-১৫ মিনিট", badge: "সেরা ভ্যালু" },
      { id: "cr-4", name: "Pass Royale Diamond", amountLabel: "Pass Diamond 💎", pricePoisha: BigInt(129000), costPoisha: BigInt(115000), sort: 4, deliveryTime: "৫-১৫ মিনিট" },
    ],
  },

  // 7. Brawl Stars
  {
    id: "game-bs",
    slug: "brawl-stars",
    name: "Brawl Stars",
    nameBn: "ব্রল স্টারস",
    nameEn: "Brawl Stars",
    category: "mobile",
    categoryLabel: "Action",
    categoryLabelBn: "অ্যাকশন গেম",
    image: "/games/brawl-stars.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(168, 85, 247, 0.2))",
    accentColor: "#FBBF24",
    description: "Supercell Brawl Stars Gems and Brawl Pass Plus top-up directly to your player tag.",
    descriptionBn: "ব্রল স্টারস জেমস ও ব্রল পাস প্লাস সরাসরি প্লেয়ার ট্যাগ দিয়ে নিরাপদে রিচার্জ করুন।",
    publisher: "Supercell",
    rating: 4.9,
    deliverySpeed: "৫-১৫ মিনিট",
    howToFind: "১. গেমে প্রোফাইলে ক্লিক করুন।\n২. আপনার নামের নিচে প্লেয়ার ট্যাগ (# সহ) দেখতে পাবেন।",
    tags: ["Supercell", "Brawl Pass", "Instant"],
    isFeatured: false,
    isPopular: false,
    sort: 7,
    fields: [
      {
        key: "player_tag",
        label: "Player Tag",
        labelBn: "প্লেয়ার ট্যাগ (# সহ)",
        type: "text",
        placeholder: "e.g. #BS89213",
        regex: "^#?[0-9A-Za-z]{6,12}$",
        required: true,
        errorMessage: "সঠিক প্লেয়ার ট্যাগ দিন",
      },
    ],
    packages: [
      { id: "bs-1", name: "30 Gems", amountLabel: "30 💎", pricePoisha: BigInt(25000), costPoisha: BigInt(21500), sort: 1, deliveryTime: "৫-১৫ মিনিট" },
      { id: "bs-2", name: "80 Gems", amountLabel: "80 💎", pricePoisha: BigInt(59000), costPoisha: BigInt(52000), sort: 2, isPopular: true, deliveryTime: "৫-১৫ মিনিট", badge: "জনপ্রিয়" },
      { id: "bs-3", name: "170 Gems", amountLabel: "170 💎", pricePoisha: BigInt(118000), costPoisha: BigInt(104000), sort: 3, deliveryTime: "৫-১৫ মিনিট" },
      { id: "bs-4", name: "Brawl Pass Plus", amountLabel: "Brawl Pass Plus ⭐", pricePoisha: BigInt(115000), costPoisha: BigInt(101000), sort: 4, isFeatured: true, deliveryTime: "৫-১৫ মিনিট", badge: "এক্সক্লুসিভ" },
    ],
  },

  // 8. Roblox
  {
    id: "game-roblox",
    slug: "roblox",
    name: "Roblox Robux",
    nameBn: "রোবলক্স রোবক্স",
    nameEn: "Roblox Robux",
    category: "pc",
    categoryLabel: "PC / Metaverse",
    categoryLabelBn: "পিসি / মেটাভার্স",
    image: "/games/roblox.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))",
    accentColor: "#EF4444",
    description: "Buy Roblox Robux directly to your account. Best rate in Bangladesh with fast processing.",
    descriptionBn: "রোবলক্স রোবক্স কোড অথবা ডিরেক্ট আইডি টপআপ। সবচেয়ে কম মূল্যে দ্রুত রোবক্স পান।",
    publisher: "Roblox Corporation",
    rating: 4.9,
    deliverySpeed: "৫-২০ মিনিট",
    howToFind: "আপনার রোবলক্স আসল ইউজারনেম দিন (ডিসপ্লে নাম নয়)।",
    tags: ["PC", "Mobile", "Robux", "Fast"],
    isFeatured: false,
    isPopular: true,
    sort: 8,
    fields: [
      {
        key: "username",
        label: "Roblox Username",
        labelBn: "রোবলক্স ইউজারনেম (Display Name নয়)",
        type: "text",
        placeholder: "e.g. ProGamerBD",
        regex: "^[A-Za-z0-9_]{3,20}$",
        required: true,
        errorMessage: "সঠিক রোবলক্স ইউজারনেম দিন",
      },
    ],
    packages: [
      { id: "rbx-1", name: "80 Robux", amountLabel: "80 R$", pricePoisha: BigInt(12500), costPoisha: BigInt(10800), sort: 1, deliveryTime: "৫-২০ মিনিট" },
      { id: "rbx-2", name: "400 Robux", amountLabel: "400 R$", pricePoisha: BigInt(59000), costPoisha: BigInt(51000), sort: 2, isPopular: true, deliveryTime: "৫-২০ মিনিট", badge: "বেস্টসেলার" },
      { id: "rbx-3", name: "800 Robux", amountLabel: "800 R$", pricePoisha: BigInt(118000), costPoisha: BigInt(102000), sort: 3, deliveryTime: "৫-২০ মিনিট" },
      { id: "rbx-4", name: "1700 Robux", amountLabel: "1700 R$", pricePoisha: BigInt(245000), costPoisha: BigInt(215000), sort: 4, deliveryTime: "৫-২০ মিনিট", badge: "মেগা সেভ" },
      { id: "rbx-5", name: "4500 Robux", amountLabel: "4500 R$", pricePoisha: BigInt(595000), costPoisha: BigInt(525000), sort: 5, deliveryTime: "৫-২০ মিনিট" },
    ],
  },

  // 9. Valorant (VP)
  {
    id: "game-valorant",
    slug: "valorant",
    name: "Valorant Points (VP)",
    nameBn: "ভ্যালোরেন্ট পয়েন্টস (VP)",
    nameEn: "Valorant Points Riot",
    category: "pc",
    categoryLabel: "PC Gaming",
    categoryLabelBn: "পিসি গেমিং",
    image: "/games/valorant.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(255, 70, 85, 0.25), rgba(220, 38, 38, 0.2))",
    accentColor: "#FF4655",
    description: "Official Riot Games Valorant Points (VP) for Bangladesh / Asia Pacific server. Instant skin and battle pass purchase.",
    descriptionBn: "ভ্যালোরেন্ট পয়েন্টস (VP) টপআপ। রায়ট আইডি ও ট্যাগ দিয়ে সরাসরি রিডিম কোড বা একাউন্টে ডেলিভারি নিন।",
    publisher: "Riot Games",
    rating: 5.0,
    deliverySpeed: "২-১০ মিনিট",
    howToFind: "১. রায়ট ক্লায়েন্টে আপনার Riot ID এবং Tagline দেখুন (যেমন: JettBD#1234)।\n২. সম্পূর্ণ Riot ID#Tagline দিন।",
    tags: ["PC", "Riot Points", "Instant", "Competitive"],
    isFeatured: true,
    isPopular: true,
    sort: 9,
    fields: [
      {
        key: "riot_id",
        label: "Riot ID (Name#Tag)",
        labelBn: "রায়ট আইডি (Name#Tag)",
        type: "text",
        placeholder: "e.g. Phoenix#BD1",
        regex: "^.+#.+$",
        required: true,
        errorMessage: "সঠিক Riot ID#Tagline দিন (যেমন JettBD#1234)",
      },
    ],
    packages: [
      { id: "val-1", name: "475 VP", amountLabel: "475 VP", pricePoisha: BigInt(55000), costPoisha: BigInt(48000), sort: 1, deliveryTime: "২-১০ মিনিট" },
      { id: "val-2", name: "1000 VP", amountLabel: "1000 VP", pricePoisha: BigInt(110000), costPoisha: BigInt(97000), sort: 2, isPopular: true, deliveryTime: "২-১০ মিনিট", badge: "ব্যাটল পাস" },
      { id: "val-3", name: "2050 VP", amountLabel: "2050 VP", pricePoisha: BigInt(220000), costPoisha: BigInt(195000), sort: 3, deliveryTime: "২-১০ মিনিট", badge: "সেরা ডিল" },
      { id: "val-4", name: "3650 VP", amountLabel: "3650 VP", pricePoisha: BigInt(385000), costPoisha: BigInt(342000), sort: 4, deliveryTime: "২-১০ মিনিট" },
    ],
  },

  // 10. Genshin Impact
  {
    id: "game-genshin",
    slug: "genshin-impact",
    name: "Genshin Impact",
    nameBn: "জেনশিন ইমপ্যাক্ট",
    nameEn: "Genshin Impact",
    category: "mobile",
    categoryLabel: "RPG",
    categoryLabelBn: "আরপিজি গেম",
    image: "/games/genshin-impact.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(147, 51, 234, 0.2))",
    accentColor: "#60A5FA",
    description: "Official Genshin Impact Genesis Crystals and Blessing of the Welkin Moon topup via UID & Server.",
    descriptionBn: "জেনশিন ইমপ্যাক্ট জেনেসিস ক্রিস্টাল ও ওয়েলকিন মুন। UID ও সার্ভার সিলেক্ট করে সরাসরি টপআপ নিন।",
    publisher: "HoYoverse",
    rating: 4.9,
    deliverySpeed: "১-৫ মিনিট",
    howToFind: "১. গেম স্ক্রিনের নিচে ডানে UID দেখতে পাবেন।\n২. আপনার একাউন্টের সার্ভার (Asia, America, Europe ইত্যাদি) কনফার্ম করুন।",
    tags: ["Hot", "Welkin Moon", "HoYoverse"],
    isFeatured: false,
    isPopular: true,
    sort: 10,
    fields: [
      {
        key: "uid",
        label: "Player UID",
        labelBn: "প্লেয়ার UID",
        type: "text",
        placeholder: "e.g. 812345678",
        regex: "^\\d{9}$",
        required: true,
        errorMessage: "সঠিক ৯ ডিজিটের Genshin UID দিন",
      },
      {
        key: "server",
        label: "Server",
        labelBn: "সার্ভার (Server)",
        type: "text",
        placeholder: "Asia / America / Europe / TW_HK_MO",
        regex: "^.+$",
        required: true,
        errorMessage: "সার্ভার নাম লিখুন (e.g. Asia)",
      },
    ],
    packages: [
      { id: "gi-1", name: "Blessing of the Welkin Moon", amountLabel: "Welkin Moon 🌙", pricePoisha: BigInt(56000), costPoisha: BigInt(49500), sort: 1, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "বেস্টসেলার" },
      { id: "gi-2", name: "60 Genesis Crystals", amountLabel: "60 💎", pricePoisha: BigInt(11500), costPoisha: BigInt(9800), sort: 2, deliveryTime: "১-৫ মিনিট" },
      { id: "gi-3", name: "330 Genesis Crystals (300+30)", amountLabel: "330 💎", pricePoisha: BigInt(56000), costPoisha: BigInt(49500), sort: 3, deliveryTime: "১-৫ মিনিট" },
      { id: "gi-4", name: "1090 Genesis Crystals (980+110)", amountLabel: "1090 💎", pricePoisha: BigInt(165000), costPoisha: BigInt(148000), sort: 4, deliveryTime: "১-৫ মিনিট" },
      { id: "gi-5", name: "2240 Genesis Crystals (1980+260)", amountLabel: "2240 💎", pricePoisha: BigInt(325000), costPoisha: BigInt(290000), sort: 5, deliveryTime: "১-৫ মিনিট" },
    ],
  },

  // 11. Dream League Soccer (DLS)
  {
    id: "game-dls",
    slug: "dream-league-soccer",
    name: "Dream League Soccer",
    nameBn: "ড্রিম লিগ সকার (DLS)",
    nameEn: "Dream League Soccer",
    category: "mobile",
    categoryLabel: "Sports",
    categoryLabelBn: "স্পোর্টস গেম",
    image: "/games/dream-league-soccer.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.15))",
    accentColor: "#06B6D4",
    description: "DLS Gems and Season Pass topup. Build your dream football squad with instant resources.",
    descriptionBn: "DLS জেমস ও সিজন পাস টপআপ। দ্রুত ও বিশ্বস্ত ডেলিভারি দিয়ে নিজের ড্রিম ফুটবল স্কোয়াড সাজান।",
    publisher: "First Touch Games",
    rating: 4.7,
    deliverySpeed: "১০-৩০ মিনিট",
    howToFind: "১. গেমে সেটিংস > Advanced এ যান।\n২. ইউজার আইডি কপি করে পেস্ট করুন।",
    tags: ["Sports", "Soccer", "Season Pass"],
    isFeatured: false,
    isPopular: false,
    sort: 11,
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
    packages: [
      { id: "dls-1", name: "100 Gems", amountLabel: "100 💎", pricePoisha: BigInt(12000), costPoisha: BigInt(10000), sort: 1, deliveryTime: "১০-৩০ মিনিট" },
      { id: "dls-2", name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(49000), costPoisha: BigInt(42000), sort: 2, isPopular: true, deliveryTime: "১০-৩০ মিনিট", badge: "সেরা ডিল" },
      { id: "dls-3", name: "Season Pass", amountLabel: "Season Pass ⚽", pricePoisha: BigInt(45000), costPoisha: BigInt(39000), sort: 3, deliveryTime: "১০-৩০ মিনিট", badge: "পাস" },
    ],
  },

  // 12. Steam Wallet Card
  {
    id: "game-steam",
    slug: "steam-wallet",
    name: "Steam Wallet Card",
    nameBn: "স্টিম ওয়ালেট কার্ড",
    nameEn: "Steam Wallet BD/USD",
    category: "pc",
    categoryLabel: "PC Gaming",
    categoryLabelBn: "পিসি গেমিং",
    image: "/games/steam-wallet.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))",
    accentColor: "#6366F1",
    description: "Official Steam Wallet Gift Card codes. Redeem on Steam to buy any PC games, DLCs, and items.",
    descriptionBn: "স্টিম গ্লোবাল এবং ইউএসডি ওয়ালেট কোড। কোড রিডিম করে যে কোনো পিসি গেম ও আইটেম কিনুন।",
    publisher: "Valve",
    rating: 5.0,
    deliverySpeed: "১-১০ মিনিট",
    howToFind: "ডেলিভারির জন্য আপনার সচল ইমেইল বা ফোন নম্বর দিন। সেখানে ভাউচার কোড তাৎক্ষণিক পাঠানো হবে।",
    tags: ["PC", "Code", "Instant", "Global"],
    isFeatured: true,
    isPopular: true,
    sort: 12,
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
    packages: [
      { id: "stm-1", name: "$5 USD Steam Card", amountLabel: "$5 USD", pricePoisha: BigInt(63000), costPoisha: BigInt(59000), sort: 1, deliveryTime: "১-১০ মিনিট" },
      { id: "stm-2", name: "$10 USD Steam Card", amountLabel: "$10 USD", pricePoisha: BigInt(126000), costPoisha: BigInt(118000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট", badge: "জনপ্রিয়" },
      { id: "stm-3", name: "$20 USD Steam Card", amountLabel: "$20 USD", pricePoisha: BigInt(249000), costPoisha: BigInt(234000), sort: 3, deliveryTime: "১-১০ মিনিট" },
      { id: "stm-4", name: "500 BDT Steam Code", amountLabel: "৳৫০০ BDT", pricePoisha: BigInt(53000), costPoisha: BigInt(49000), sort: 4, deliveryTime: "১-১০ মিনিট", badge: "লোকাল রেট" },
      { id: "stm-5", name: "1000 BDT Steam Code", amountLabel: "৳১০০০ BDT", pricePoisha: BigInt(105000), costPoisha: BigInt(98000), sort: 5, deliveryTime: "১-১০ মিনিট" },
    ],
  },

  // 13. Google Play Gift Card
  {
    id: "game-gplay",
    slug: "google-play",
    name: "Google Play Gift Card",
    nameBn: "গুগল প্লে গিফট কার্ড",
    nameEn: "Google Play Gift Card US",
    category: "card",
    categoryLabel: "Gift Card",
    categoryLabelBn: "গিফট কার্ড",
    image: "/games/google-play.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(163, 230, 53, 0.2), rgba(101, 163, 13, 0.15))",
    accentColor: "#A3E635",
    description: "US Region Google Play Gift Card codes for Android apps, games, books, and in-app purchases.",
    descriptionBn: "ইউএস রিজিয়ন গুগল প্লে গিফট কার্ড কোড। যেকোনো অ্যান্ড্রয়েড অ্যাপ, গেম ও ইন-অ্যাপ পারচেজে ব্যবহার করুন।",
    publisher: "Google",
    rating: 4.8,
    deliverySpeed: "১-১০ মিনিট",
    howToFind: "আপনার গুগল অ্যাকাউন্ট রিজিয়ন অবশ্যই United States (US) হতে হবে। কোড ইমেইলে যাবে।",
    tags: ["Card", "US Region", "Instant"],
    isFeatured: false,
    isPopular: false,
    sort: 13,
    fields: [
      {
        key: "delivery_email",
        label: "Delivery Email",
        labelBn: "ডেলিভারি ইমেইল (কোড রিসিভ করার জন্য)",
        type: "email",
        placeholder: "your-email@example.com",
        regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        required: true,
        errorMessage: "সঠিক ডেলিভারি ইমেইল দিন",
      },
    ],
    packages: [
      { id: "gp-1", name: "$5 USD Google Play", amountLabel: "$5 USD", pricePoisha: BigInt(63000), costPoisha: BigInt(59000), sort: 1, deliveryTime: "১-১০ মিনিট" },
      { id: "gp-2", name: "$10 USD Google Play", amountLabel: "$10 USD", pricePoisha: BigInt(125000), costPoisha: BigInt(117000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট", badge: "সেরা ডিল" },
      { id: "gp-3", name: "$25 USD Google Play", amountLabel: "$25 USD", pricePoisha: BigInt(310000), costPoisha: BigInt(290000), sort: 3, deliveryTime: "১-১০ মিনিট" },
      { id: "gp-4", name: "$50 USD Google Play", amountLabel: "$50 USD", pricePoisha: BigInt(615000), costPoisha: BigInt(575000), sort: 4, deliveryTime: "১-১০ মিনিট" },
    ],
  },

  // 14. Apple App Store & iTunes (US)
  {
    id: "game-apple",
    slug: "apple-gift-card",
    name: "Apple Gift Card US",
    nameBn: "অ্যাপল ও আইটিউনস কার্ড",
    nameEn: "Apple Gift Card US",
    category: "card",
    categoryLabel: "Gift Card",
    categoryLabelBn: "গিফট কার্ড",
    image: "/games/apple-gift-card.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2))",
    accentColor: "#38BDF8",
    description: "US Region Apple Gift Card for App Store, Apple Arcade, iCloud storage, and in-game iOS purchases.",
    descriptionBn: "ইউএস রিজিয়ন অ্যাপল ও আইটিউনস গিফট কার্ড। আইফোনে যেকোনো ইন-গেম পারচেজ ও অ্যাপ কিনুন।",
    publisher: "Apple Inc.",
    rating: 4.9,
    deliverySpeed: "১-১০ মিনিট",
    howToFind: "আপনার অ্যাপল আইডি রিজিয়ন United States (US) হতে হবে। কোড ইমেইলে সরবরাহ করা হবে।",
    tags: ["Apple", "iOS", "US Region", "Digital Code"],
    isFeatured: false,
    isPopular: false,
    sort: 14,
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
    packages: [
      { id: "ap-1", name: "$5 USD Apple Card", amountLabel: "$5 USD", pricePoisha: BigInt(65000), costPoisha: BigInt(60000), sort: 1, deliveryTime: "১-১০ মিনিট" },
      { id: "ap-2", name: "$10 USD Apple Card", amountLabel: "$10 USD", pricePoisha: BigInt(129000), costPoisha: BigInt(120000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট", badge: "জনপ্রিয়" },
      { id: "ap-3", name: "$25 USD Apple Card", amountLabel: "$25 USD", pricePoisha: BigInt(315000), costPoisha: BigInt(295000), sort: 3, deliveryTime: "১-১০ মিনিট" },
    ],
  },

  // 15. PlayStation Network (PSN US)
  {
    id: "game-psn",
    slug: "playstation-network",
    name: "PlayStation Network (PSN)",
    nameBn: "প্লেস্টেশন নেটওয়ার্ক (PSN)",
    nameEn: "PlayStation Network US",
    category: "card",
    categoryLabel: "Gift Card",
    categoryLabelBn: "গিফট কার্ড",
    image: "/games/playstation-network.jpg",
    bannerGradient: "linear-gradient(135deg, rgba(0, 111, 205, 0.25), rgba(10, 17, 40, 0.2))",
    accentColor: "#00A3FF",
    description: "US Region PlayStation Store Gift Cards for PS4 and PS5 games, add-ons, and subscriptions.",
    descriptionBn: "ইউএস রিজিয়ন প্লেস্টেশন নেটওয়ার্ক (PSN) কার্ড। PS4 ও PS5 গেম ও প্লাস সাবস্ক্রিপশন কিনতে কোড রিডিম করুন।",
    publisher: "Sony Interactive Entertainment",
    rating: 4.9,
    deliverySpeed: "১-১০ মিনিট",
    howToFind: "আপনার প্লেস্টেশন অ্যাকাউন্ট রিজিয়ন United States হতে হবে। ডিজিটাল কোড ইমেইলে যাবে।",
    tags: ["Console", "PS4", "PS5", "US Code"],
    isFeatured: false,
    isPopular: false,
    sort: 15,
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
    packages: [
      { id: "psn-1", name: "$10 USD PSN Card", amountLabel: "$10 USD", pricePoisha: BigInt(129000), costPoisha: BigInt(120000), sort: 1, isPopular: true, deliveryTime: "১-১০ মিনিট", badge: "সেরা রেট" },
      { id: "psn-2", name: "$25 USD PSN Card", amountLabel: "$25 USD", pricePoisha: BigInt(319000), costPoisha: BigInt(298000), sort: 2, deliveryTime: "১-১০ মিনিট" },
    ],
  },
];

// Helper to normalize aliases
export function normalizeSlug(slug: string): string {
  const s = slug.toLowerCase();
  if (s === "steam") return "steam-wallet";
  if (s === "dls") return "dream-league-soccer";
  if (s === "coc") return "clash-of-clans";
  if (s === "cr") return "clash-royale";
  if (s === "bs") return "brawl-stars";
  if (s === "pubg") return "pubg-mobile";
  if (s === "mlbb") return "mobile-legends";
  if (s === "ff") return "free-fire";
  if (s === "codm" || s === "cod") return "call-of-duty-mobile";
  if (s === "val") return "valorant";
  if (s === "genshin") return "genshin-impact";
  if (s === "apple") return "apple-gift-card";
  if (s === "psn") return "playstation-network";
  return s;
}

export function getCatalogGame(slug: string): CatalogGame | undefined {
  const normalized = normalizeSlug(slug);
  return GAMES_CATALOG.find((g) => g.slug === normalized);
}

export function getAllCatalogGames(): CatalogGame[] {
  return GAMES_CATALOG;
}

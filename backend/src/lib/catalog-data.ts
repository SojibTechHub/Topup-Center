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
    descriptionBn: "গ্যারেনা ফ্রি ফায়ার ইন-গেম ডায়মন্ড টপআপ। প্লেয়ার আইডি দিয়ে মুহূর্তের মধ্যে ১-৫ মিনিটে ডেলিভারি পান।",
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
      { id: "ff-1", name: "25 Diamonds", amountLabel: "25 💎", pricePoisha: BigInt(2500), sort: 1, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-2", name: "50 Diamonds", amountLabel: "50 💎", pricePoisha: BigInt(4500), sort: 2, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-3", name: "115 Diamonds", amountLabel: "115 💎", pricePoisha: BigInt(9500), sort: 3, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "বেস্টসেলার" },
      { id: "ff-4", name: "240 Diamonds", amountLabel: "240 💎", pricePoisha: BigInt(19000), sort: 4, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-5", name: "610 Diamonds", amountLabel: "610 💎", pricePoisha: BigInt(47000), sort: 5, isFeatured: true, deliveryTime: "১-৫ মিনিট", badge: "বোনাস" },
      { id: "ff-6", name: "1240 Diamonds", amountLabel: "1240 💎", pricePoisha: BigInt(95000), sort: 6, deliveryTime: "১-৫ মিনিট" },
      { id: "ff-7", name: "Weekly Membership", amountLabel: "Weekly 🌟", pricePoisha: BigInt(19500), sort: 7, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "সঞ্চয়ী" },
      { id: "ff-8", name: "Monthly Membership", amountLabel: "Monthly 👑", pricePoisha: BigInt(95000), sort: 8, deliveryTime: "১-৫ মিনিট", badge: "ভিআইপি" },
    ],
  },
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
      { id: "pubg-1", name: "60 UC", amountLabel: "60 UC", pricePoisha: BigInt(11500), sort: 1, deliveryTime: "২-১০ মিনিট" },
      { id: "pubg-2", name: "325 UC", amountLabel: "325 UC", pricePoisha: BigInt(56000), sort: 2, isPopular: true, deliveryTime: "২-১০ মিনিট", badge: "জনপ্রিয়" },
      { id: "pubg-3", name: "660 UC", amountLabel: "660 UC", pricePoisha: BigInt(110000), sort: 3, isFeatured: true, deliveryTime: "২-১০ মিনিট", badge: "Royale Pass" },
      { id: "pubg-4", name: "1800 UC", amountLabel: "1800 UC", pricePoisha: BigInt(295000), sort: 4, deliveryTime: "২-১০ মিনিট" },
      { id: "pubg-5", name: "Royale Pass Pack", amountLabel: "Royale Pass 🎫", pricePoisha: BigInt(115000), sort: 5, deliveryTime: "২-১০ মিনিট", badge: "স্পেশাল" },
    ],
  },
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
      { id: "mlbb-1", name: "86 Diamonds", amountLabel: "86 💎", pricePoisha: BigInt(16500), sort: 1, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-2", name: "172 Diamonds", amountLabel: "172 💎", pricePoisha: BigInt(32000), sort: 2, isPopular: true, deliveryTime: "১-৫ মিনিট", badge: "সেরা রেট" },
      { id: "mlbb-3", name: "257 Diamonds", amountLabel: "257 💎", pricePoisha: BigInt(48000), sort: 3, deliveryTime: "১-৫ মিনিট" },
      { id: "mlbb-4", name: "Weekly Diamond Pass", amountLabel: "Weekly Pass 🎁", pricePoisha: BigInt(22000), sort: 4, isFeatured: true, deliveryTime: "১-৫ মিনিট", badge: "জনপ্রিয়" },
      { id: "mlbb-5", name: "Twilight Pass", amountLabel: "Twilight Pass 🌙", pricePoisha: BigInt(125000), sort: 5, deliveryTime: "১-৫ মিনিট", badge: "এক্সক্লুসিভ" },
    ],
  },
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
    sort: 4,
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
      { id: "coc-1", name: "88 Gems", amountLabel: "88 💎", pricePoisha: BigInt(12500), sort: 1, deliveryTime: "৫-১৫ মিনিট" },
      { id: "coc-2", name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(59000), sort: 2, isPopular: true, deliveryTime: "৫-১৫ মিনিট", badge: "ভ্যালু প্যাক" },
      { id: "coc-3", name: "1200 Gems", amountLabel: "1200 💎", pricePoisha: BigInt(120000), sort: 3, deliveryTime: "৫-১৫ মিনিট" },
      { id: "coc-4", name: "Gold Pass", amountLabel: "Gold Pass 🏆", pricePoisha: BigInt(85000), sort: 4, isFeatured: true, deliveryTime: "৫-১৫ মিনিট", badge: "সিজনাল" },
    ],
  },
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
    description: "DLS 2024 Gems and Season Pass topup. Build your dream football squad with instant resources.",
    descriptionBn: "DLS জেমস ও সিজন পাস টপআপ। দ্রুত ও বিশ্বস্ত ডেলিভারি দিয়ে নিজের ড্রিম ফুটবল স্কোয়াড সাজান।",
    publisher: "First Touch Games",
    rating: 4.7,
    deliverySpeed: "১০-৩০ মিনিট",
    howToFind: "১. গেমে সেটিংস > Advanced এ যান।\n২. ইউজার আইডি কপি করে পেস্ট করুন।",
    tags: ["Sports", "Soccer", "Season Pass"],
    isFeatured: false,
    isPopular: false,
    sort: 5,
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
      { id: "dls-1", name: "100 Gems", amountLabel: "100 💎", pricePoisha: BigInt(19000), sort: 1, deliveryTime: "১০-৩০ মিনিট" },
      { id: "dls-2", name: "500 Gems", amountLabel: "500 💎", pricePoisha: BigInt(89000), sort: 2, isPopular: true, deliveryTime: "১০-৩০ মিনিট", badge: "সেরা ডিল" },
      { id: "dls-3", name: "Season Pass", amountLabel: "Season Pass ⚽", pricePoisha: BigInt(65000), sort: 3, deliveryTime: "১০-৩০ মিনিট", badge: "পাস" },
    ],
  },
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
    sort: 6,
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
      { id: "rbx-1", name: "80 Robux", amountLabel: "80 R$", pricePoisha: BigInt(13500), sort: 1, deliveryTime: "৫-২০ মিনিট" },
      { id: "rbx-2", name: "400 Robux", amountLabel: "400 R$", pricePoisha: BigInt(59000), sort: 2, isPopular: true, deliveryTime: "৫-২০ মিনিট", badge: "বেস্টসেলার" },
      { id: "rbx-3", name: "800 Robux", amountLabel: "800 R$", pricePoisha: BigInt(118000), sort: 3, deliveryTime: "৫-২০ মিনিট" },
      { id: "rbx-4", name: "1700 Robux", amountLabel: "1700 R$", pricePoisha: BigInt(245000), sort: 4, deliveryTime: "৫-২০ মিনিট", badge: "মেগা সেভ" },
    ],
  },
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
    sort: 7,
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
      { id: "stm-1", name: "$5 USD Steam Card", amountLabel: "$5 USD", pricePoisha: BigInt(63000), sort: 1, deliveryTime: "১-১০ মিনিট" },
      { id: "stm-2", name: "$10 USD Steam Card", amountLabel: "$10 USD", pricePoisha: BigInt(125000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট", badge: "জনপ্রিয়" },
      { id: "stm-3", name: "$20 USD Steam Card", amountLabel: "$20 USD", pricePoisha: BigInt(248000), sort: 3, deliveryTime: "১-১০ মিনিট" },
      { id: "stm-4", name: "500 BDT Steam Code", amountLabel: "৳৫০০ BDT", pricePoisha: BigInt(55000), sort: 4, deliveryTime: "১-১০ মিনিট", badge: "লোকাল রেট" },
    ],
  },
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
    sort: 8,
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
      { id: "gp-1", name: "$5 USD Google Play", amountLabel: "$5 USD", pricePoisha: BigInt(62000), sort: 1, deliveryTime: "১-১০ মিনিট" },
      { id: "gp-2", name: "$10 USD Google Play", amountLabel: "$10 USD", pricePoisha: BigInt(122000), sort: 2, isPopular: true, deliveryTime: "১-১০ মিনিট", badge: "সেরা ডিল" },
      { id: "gp-3", name: "$25 USD Google Play", amountLabel: "$25 USD", pricePoisha: BigInt(300000), sort: 3, deliveryTime: "১-১০ মিনিট" },
    ],
  },
];

// Helper to normalize aliases (e.g., "steam" -> "steam-wallet", "dls" -> "dream-league-soccer")
export function normalizeSlug(slug: string): string {
  const s = slug.toLowerCase();
  if (s === "steam") return "steam-wallet";
  if (s === "dls") return "dream-league-soccer";
  if (s === "coc") return "clash-of-clans";
  if (s === "pubg") return "pubg-mobile";
  if (s === "mlbb") return "mobile-legends";
  if (s === "ff") return "free-fire";
  return s;
}

export function getCatalogGame(slug: string): CatalogGame | undefined {
  const normalized = normalizeSlug(slug);
  return GAMES_CATALOG.find((g) => g.slug === normalized);
}

export function getAllCatalogGames(): CatalogGame[] {
  return GAMES_CATALOG;
}

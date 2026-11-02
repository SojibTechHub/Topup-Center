"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  ShieldCheck,
  Headphones,
  BadgePercent,
  Flame,
  ArrowRight,
  Search,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Star,
  Tag,
} from "lucide-react";

// ─── Live Stats Ticker ────────────────────────────────────────────────────────
const tickerItems = [
  "রাফিউল PUBG UC কিনেছেন — ৳৪৯৫ (৩৫৫ UC)",
  "সাকিব Free Fire Diamond পেয়েছেন — ১১৫ Diamond",
  "তামিম COC Gold Pass নিয়েছেন — ৳৬৯০",
  "রিয়া MLBB Weekly Pass পেয়েছেন — ৳১৮৫",
  "জাহিন Steam Wallet $10 কোড পেয়েছেন — ৳১২৬০",
  "মারিয়া DLS Gems নিয়েছেন — ৫০০ Gems",
  "আসিফ Roblox Robux পেয়েছেন — ৪০০ Robux",
  "তানভীর CODM 420 CP টপআপ সম্পন্ন — ৳৪৮০",
  "ফারহান Valorant 1000 VP কিনেছেন — ৳১১০০",
  "সায়মুন Genshin Welkin Moon পেয়েছেন — ৳৫৬০",
];

// ─── All 15 Games with Real Rates & Artwork ──────────────────────────────────
const allGames = [
  {
    slug: "free-fire",
    name: "Free Fire Diamond",
    nameBn: "ফ্রি ফায়ার ডায়মন্ড",
    category: "mobile",
    categoryLabel: "Battle Royale",
    image: "/games/free-fire.jpg",
    accentColor: "#F97316",
    minPrice: "৳২০",
    deliveryTime: "১-৫ মিনিট",
    popular: true,
    rating: 4.9,
    badge: "হট ডিল",
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile UC",
    nameBn: "পাবজি মোবাইল ইউসি",
    category: "mobile",
    categoryLabel: "Battle Royale",
    image: "/games/pubg-mobile.jpg",
    accentColor: "#F59E0B",
    minPrice: "৳৯৫",
    deliveryTime: "২-১০ মিনিট",
    popular: true,
    rating: 4.8,
    badge: "Royale Pass",
  },
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    nameBn: "মোবাইল লেজেন্ডস",
    category: "mobile",
    categoryLabel: "MOBA",
    image: "/games/mobile-legends.jpg",
    accentColor: "#3B82F6",
    minPrice: "৳১৪৫",
    deliveryTime: "১-৫ মিনিট",
    popular: true,
    rating: 4.9,
    badge: "Weekly Pass",
  },
  {
    slug: "call-of-duty-mobile",
    name: "Call of Duty: Mobile CP",
    nameBn: "কল অব ডিউটি মোবাইল CP",
    category: "mobile",
    categoryLabel: "Action Shooter",
    image: "/games/call-of-duty-mobile.jpg",
    accentColor: "#F59E0B",
    minPrice: "৳৯৫",
    deliveryTime: "২-৮ মিনিট",
    popular: true,
    rating: 4.9,
    badge: "Battle Pass",
  },
  {
    slug: "clash-of-clans",
    name: "Clash of Clans",
    nameBn: "ক্ল্যাশ অব ক্ল্যানস",
    category: "mobile",
    categoryLabel: "Strategy",
    image: "/games/clash-of-clans.jpg",
    accentColor: "#22C55E",
    minPrice: "৳৯৫",
    deliveryTime: "৫-১৫ মিনিট",
    popular: true,
    rating: 4.8,
    badge: "Gold Pass",
  },
  {
    slug: "clash-royale",
    name: "Clash Royale",
    nameBn: "ক্ল্যাশ রয়্যাল",
    category: "mobile",
    categoryLabel: "Strategy",
    image: "/games/clash-royale.jpg",
    accentColor: "#3B82F6",
    minPrice: "৳৯৫",
    deliveryTime: "৫-১৫ মিনিট",
    popular: false,
    rating: 4.8,
    badge: "Pass Royale",
  },
  {
    slug: "brawl-stars",
    name: "Brawl Stars",
    nameBn: "ব্রল স্টারস",
    category: "mobile",
    categoryLabel: "Action",
    image: "/games/brawl-stars.jpg",
    accentColor: "#FBBF24",
    minPrice: "৳২৫০",
    deliveryTime: "৫-১৫ মিনিট",
    popular: false,
    rating: 4.9,
    badge: "Brawl Pass",
  },
  {
    slug: "roblox",
    name: "Roblox Robux",
    nameBn: "রোবলক্স রোবক্স",
    category: "pc",
    categoryLabel: "Metaverse",
    image: "/games/roblox.jpg",
    accentColor: "#EF4444",
    minPrice: "৳১২৫",
    deliveryTime: "৫-২০ মিনিট",
    popular: true,
    rating: 4.9,
    badge: "বেস্টসেলার",
  },
  {
    slug: "valorant",
    name: "Valorant Points (VP)",
    nameBn: "ভ্যালোরেন্ট পয়েন্টস VP",
    category: "pc",
    categoryLabel: "Tactical FPS",
    image: "/games/valorant.jpg",
    accentColor: "#FF4655",
    minPrice: "৳৫৫০",
    deliveryTime: "২-১০ মিনিট",
    popular: true,
    rating: 5.0,
    badge: "Riot Points",
  },
  {
    slug: "genshin-impact",
    name: "Genshin Impact",
    nameBn: "জেনশিন ইমপ্যাক্ট",
    category: "mobile",
    categoryLabel: "Open-World RPG",
    image: "/games/genshin-impact.jpg",
    accentColor: "#60A5FA",
    minPrice: "৳১১৫",
    deliveryTime: "১-৫ মিনিট",
    popular: true,
    rating: 4.9,
    badge: "Welkin Moon",
  },
  {
    slug: "dream-league-soccer",
    name: "Dream League Soccer",
    nameBn: "ড্রিম লিগ সকার (DLS)",
    category: "mobile",
    categoryLabel: "Sports",
    image: "/games/dream-league-soccer.jpg",
    accentColor: "#06B6D4",
    minPrice: "৳১২০",
    deliveryTime: "১০-৩০ মিনিট",
    popular: false,
    rating: 4.7,
  },
  {
    slug: "steam-wallet",
    name: "Steam Wallet",
    nameBn: "স্টিম ওয়ালেট কার্ড",
    category: "pc",
    categoryLabel: "PC Gaming",
    image: "/games/steam-wallet.jpg",
    accentColor: "#6366F1",
    minPrice: "৳৫৩০",
    deliveryTime: "১-১০ মিনিট",
    popular: true,
    rating: 5.0,
    badge: "গ্লোবাল কোড",
  },
  {
    slug: "google-play",
    name: "Google Play",
    nameBn: "গুগল প্লে গিফট কার্ড",
    category: "card",
    categoryLabel: "Gift Card",
    image: "/games/google-play.jpg",
    accentColor: "#A3E635",
    minPrice: "৳৬৩০",
    deliveryTime: "১-১০ মিনিট",
    popular: false,
    rating: 4.8,
    badge: "US Region",
  },
  {
    slug: "apple-gift-card",
    name: "Apple Gift Card",
    nameBn: "অ্যাপল ও আইটিউনস কার্ড",
    category: "card",
    categoryLabel: "Gift Card",
    image: "/games/apple-gift-card.jpg",
    accentColor: "#38BDF8",
    minPrice: "৳৬৫০",
    deliveryTime: "১-১০ মিনিট",
    popular: false,
    rating: 4.9,
    badge: "App Store",
  },
  {
    slug: "playstation-network",
    name: "PlayStation Network",
    nameBn: "প্লেস্টেশন নেটওয়ার্ক (PSN)",
    category: "card",
    categoryLabel: "Console Gift Card",
    image: "/games/playstation-network.jpg",
    accentColor: "#00A3FF",
    minPrice: "৳১২৯০",
    deliveryTime: "১-১০ মিনিট",
    popular: false,
    rating: 4.9,
    badge: "PS4/PS5",
  },
];

const trustItems = [
  { icon: Zap, label: "তাৎক্ষণিক ডেলিভারি", desc: "গড় ১-৫ মিনিটের মধ্যে স্বয়ংক্রিয়", color: "#22D3EE" },
  { icon: ShieldCheck, label: "১০০% নিরাপদ ও সুরক্ষিত", desc: "অফিশিয়াল ডায়মন্ড ও লাইসেন্সড কোড", color: "#A3E635" },
  { icon: Headphones, label: "২৪/৭ লাইভ সাপোর্ট", desc: "হোয়াটসঅ্যাপ, টেলিগ্রাম ও এআই অ্যাসিস্ট্যান্ট", color: "#F43F5E" },
  { icon: BadgePercent, label: "সর্বনিম্ন বাজারদর", desc: "বিকাশ, নগদ ও রকেটে সেরা রেট", color: "#FBBF24" },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    orders: 14850,
    customers: 9420,
    games: 15,
  });

  // Animate stats counter
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((s) => ({
        orders: s.orders + Math.floor(Math.random() * 2),
        customers: s.customers + (Math.random() > 0.8 ? 1 : 0),
        games: 15,
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredGames = allGames.filter((g) => {
    const matchesCategory = activeCategory === "all" || g.category === activeCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nameBn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* ── Live Ticker ── */}
      <div
        style={{
          background: "rgba(34, 211, 238, 0.05)",
          borderBottom: "1px solid rgba(34, 211, 238, 0.15)",
          padding: "10px 0",
          overflow: "hidden",
        }}
      >
        <div
          className="ticker-content"
          style={{
            display: "inline-flex",
            gap: "50px",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            alignItems: "center",
          }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Zap size={13} className="text-cyan-400" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section
        style={{
          padding: "70px 24px 90px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        {/* Glow ambient lights */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "500px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(34,211,238,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "10%",
            width: "500px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(163,230,53,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(34, 211, 238, 0.1)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                  borderRadius: "100px",
                  padding: "6px 16px",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                  color: "var(--accent-cyan)",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--accent-lime)",
                    display: "inline-block",
                    boxShadow: "0 0 10px #A3E635",
                  }}
                />
                বাংলাদেশের সবচেয়ে বিশ্বস্ত গেমিং টপআপ প্ল্যাটফর্ম
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.3rem, 5vw, 3.4rem)",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: "20px",
                  letterSpacing: "-1px",
                }}
              >
                গেমিং টপআপ এখন{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #22D3EE 0%, #A3E635 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  এক ক্লিকে ইনস্ট্যান্ট
                </span>
              </h1>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                  marginBottom: "36px",
                  maxWidth: "520px",
                }}
              >
                Free Fire, PUBG, Mobile Legends, Call of Duty, CoC সহ ১৫+ জনপ্রিয় গেমের ডায়মন্ড ও ইউসি কিনুন
                বিকাশ, নগদ, রকেটে। ১-৫ মিনিটে সরাসরি অ্যাকাউন্টে পৌঁছে যাবে।
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "40px" }}>
                <Link
                  href="/games"
                  className="btn btn-cyan btn-xl"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 0 30px rgba(34, 211, 238, 0.4)",
                  }}
                >
                  <Gamepad2 size={20} />
                  <span>এখনই টপআপ করুন</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/price-list"
                  className="btn btn-secondary btn-xl"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderColor: "var(--accent-lime)",
                    color: "var(--accent-lime)",
                  }}
                >
                  <Tag size={18} />
                  <span>প্রাইস লিস্ট দেখুন</span>
                </Link>
              </div>

              {/* Mini Stats Banner */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--accent-cyan)" }}>
                    {stats.orders.toLocaleString("bn-BD")}+
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>সফল টপআপ</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--accent-lime)" }}>
                    {stats.customers.toLocaleString("bn-BD")}+
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>সন্তুষ্ট গেমার</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--accent-magenta)" }}>
                    ১-৫ মিনিট
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>গড় ডেলিভারি</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Artwork Banner */}
            <div style={{ position: "relative" }}>
              <div
                className="glass-card"
                style={{
                  position: "relative",
                  borderRadius: "24px",
                  overflow: "hidden",
                  border: "2px solid rgba(34, 211, 238, 0.3)",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(34, 211, 238, 0.2)",
                  height: "440px",
                }}
              >
                <Image
                  src="/brand/hero-banner.jpg"
                  alt="Topup Center Hero Showcase"
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                />

                {/* Floating Fast Deal Pill */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "24px",
                    right: "24px",
                    background: "rgba(7, 10, 18, 0.9)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                  }}
                >
                  <div style={{ width: "42px", height: "42px", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
                    <Image src="/games/free-fire.jpg" alt="Free Fire" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFFFFF" }}>ফ্রি ফায়ার ১১৫ 💎</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent-lime)", fontWeight: 700 }}>৳ ৮০ (ইনস্ট্যান্ট ডেলিভারি)</div>
                  </div>
                  <Link href="/games/free-fire" className="btn btn-cyan" style={{ padding: "6px 14px", fontSize: "0.8rem", textDecoration: "none" }}>
                    কিনুন
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Features Strip ── */}
      <section
        style={{
          padding: "36px 24px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {trustItems.map((item, i) => {
              const IconComp = item.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}35`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={24} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginBottom: "2px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Games Grid (All 15 Games) ── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="container">
          {/* Section Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                জনপ্রিয় গেমস ক্যাটালগ
              </div>
              <h2 style={{ fontSize: "2.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                আপনার পছন্দের গেম বেছে নিন
              </h2>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Link
                href="/price-list"
                className="btn btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderColor: "var(--accent-lime)",
                  color: "var(--accent-lime)",
                  fontWeight: 700,
                }}
              >
                ⚡ সম্পূর্ণ প্রাইস লিস্ট
              </Link>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            {/* Category Tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "সব গেম (১৫)" },
                { id: "mobile", label: "মোবাইল গেম (৯)" },
                { id: "pc", label: "পিসি গেম (৩)" },
                { id: "card", label: "গিফট কার্ড (৩)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "24px",
                    fontSize: "0.9rem",
                    border: "none",
                    cursor: "pointer",
                    background: activeCategory === tab.id ? "var(--accent-cyan)" : "rgba(255,255,255,0.06)",
                    color: activeCategory === tab.id ? "#070A12" : "var(--text-secondary)",
                    fontWeight: activeCategory === tab.id ? 800 : 500,
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "260px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="গেম খুঁজুন..."
                className="input"
                style={{ paddingLeft: "38px", width: "100%", borderRadius: "24px", fontSize: "0.9rem" }}
              />
            </div>
          </div>

          {/* Grid of 15 Games */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredGames.map((game) => (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="glass-card tilt-card group"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                {/* Game Artwork */}
                <div
                  style={{
                    height: "190px",
                    position: "relative",
                    overflow: "hidden",
                    background: "#0d111d",
                  }}
                >
                  <Image
                    src={game.image}
                    alt={game.nameBn}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                    className="group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(7, 10, 18, 0.95) 0%, rgba(7, 10, 18, 0.3) 50%, transparent 100%)",
                    }}
                  />

                  {/* Badges */}
                  <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
                    {game.badge && (
                      <span className="badge badge-lime" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                        {game.badge}
                      </span>
                    )}
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "100px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {game.categoryLabel}
                    </span>
                  </div>

                  {/* Rating */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      padding: "3px 8px",
                      borderRadius: "100px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#FBBF24",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Star size={12} fill="#FBBF24" />
                    <span>{game.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
                      {game.nameBn}
                    </h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "14px" }}>
                      {game.name}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingTop: "14px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>শুরু মাত্র</span>
                      <span
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 900,
                          color: "var(--accent-lime)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {game.minPrice}
                      </span>
                    </div>

                    <div
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>টপআপ</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

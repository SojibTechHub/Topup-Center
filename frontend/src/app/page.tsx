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
} from "lucide-react";

// ─── Live Stats Ticker ────────────────────────────────────────────────────────
const tickerItems = [
  "রাফিউল PUBG UC কিনেছেন — ৳৮০০",
  "সাকিব Free Fire Diamond পেয়েছেন — ১০০০ Diamond",
  "তামিম COC Gems নিয়েছেন — ৳৫৫০",
  "রিয়া MLBB Diamond পেয়েছেন — ৩২৮ Diamond",
  "জাহিন Steam Wallet পেয়েছেন — $10",
  "মারিয়া DLS Gems নিয়েছেন — ৫০০ Gems",
  "আসিফ Roblox Robux পেয়েছেন — ৪০০ Robux",
];

// ─── Games Data with REAL Artwork & Verified Slugs ────────────────────────────
const featuredGames = [
  {
    slug: "free-fire",
    name: "Free Fire Diamond",
    nameBn: "ফ্রি ফায়ার ডায়মন্ড",
    category: "Battle Royale",
    image: "/games/free-fire.jpg",
    accentColor: "#F97316",
    minPrice: "৳২৫",
    deliveryTime: "১-৫ মিনিট",
    popular: true,
    rating: 4.9,
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile UC",
    nameBn: "পাবজি মোবাইল ইউসি",
    category: "Battle Royale",
    image: "/games/pubg-mobile.jpg",
    accentColor: "#F59E0B",
    minPrice: "৳১১৫",
    deliveryTime: "২-১০ মিনিট",
    popular: true,
    rating: 4.8,
  },
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    nameBn: "মোবাইল লেজেন্ডস",
    category: "MOBA",
    image: "/games/mobile-legends.jpg",
    accentColor: "#3B82F6",
    minPrice: "৳১৬৫",
    deliveryTime: "১-৫ মিনিট",
    popular: true,
    rating: 4.9,
  },
  {
    slug: "clash-of-clans",
    name: "Clash of Clans",
    nameBn: "ক্ল্যাশ অব ক্ল্যানস",
    category: "Strategy",
    image: "/games/clash-of-clans.jpg",
    accentColor: "#22C55E",
    minPrice: "৳১২৫",
    deliveryTime: "৫-১৫ মিনিট",
    popular: false,
    rating: 4.8,
  },
  {
    slug: "roblox",
    name: "Roblox Robux",
    nameBn: "রোবলক্স রোবক্স",
    category: "Metaverse",
    image: "/games/roblox.jpg",
    accentColor: "#EF4444",
    minPrice: "৳১৩৫",
    deliveryTime: "৫-২০ মিনিট",
    popular: true,
    rating: 4.9,
  },
  {
    slug: "steam-wallet",
    name: "Steam Wallet",
    nameBn: "স্টিম ওয়ালেট কার্ড",
    category: "PC Gaming",
    image: "/games/steam-wallet.jpg",
    accentColor: "#6366F1",
    minPrice: "৳৫৫০",
    deliveryTime: "১-১০ মিনিট",
    popular: false,
    rating: 5.0,
  },
  {
    slug: "dream-league-soccer",
    name: "Dream League Soccer",
    nameBn: "ড্রিম লিগ সকার (DLS)",
    category: "Sports",
    image: "/games/dream-league-soccer.jpg",
    accentColor: "#06B6D4",
    minPrice: "৳১৯০",
    deliveryTime: "১০-৩০ মিনিট",
    popular: false,
    rating: 4.7,
  },
  {
    slug: "google-play",
    name: "Google Play",
    nameBn: "গুগল প্লে গিফট কার্ড",
    category: "Gift Card",
    image: "/games/google-play.jpg",
    accentColor: "#A3E635",
    minPrice: "৳৬২০",
    deliveryTime: "১-১০ মিনিট",
    popular: false,
    rating: 4.8,
  },
];

const trustItems = [
  { icon: Zap, label: "তাৎক্ষণিক ডেলিভারি", desc: "গড় ১-৫ মিনিটের মধ্যে স্বয়ংক্রিয়", color: "#22D3EE" },
  { icon: ShieldCheck, label: "১০০% নিরাপদ ও সুরক্ষিত", desc: "অফিশিয়াল ডায়মন্ড ও লাইসেন্সড কোড", color: "#A3E635" },
  { icon: Headphones, label: "২৪/৭ লাইভ সাপোর্ট", desc: "হোয়াটসঅ্যাপ, টেলিগ্রাম ও এআই অ্যাসিস্ট্যান্ট", color: "#F43F5E" },
  { icon: BadgePercent, label: "সর্বনিম্ন বাজারদর", desc: "বিকাশ, নগদ ও রকেটে সেরা রেট", color: "#FBBF24" },
];

const howItWorks = [
  {
    step: "০১",
    title: "গেম বেছে নিন",
    desc: "আমাদের ক্যাটালগ থেকে আপনার পছন্দের গেম বা ভাউচার সিলেক্ট করুন",
    color: "var(--accent-cyan)",
  },
  {
    step: "০২",
    title: "আইডি ও প্যাকেজ দিন",
    desc: "আপনার প্লেয়ার আইডি লিখে কাঙ্ক্ষিত ডায়মন্ড বা ইউসি প্যাকেজ বেছে নিন",
    color: "var(--accent-lime)",
  },
  {
    step: "০৩",
    title: "পেমেন্ট সম্পন্ন করুন",
    desc: "বিকাশ, নগদ, রকেট বা কার্ডে মুহূর্তেই নিরাপদ পেমেন্ট করুন",
    color: "var(--accent-magenta)",
  },
  {
    step: "০৪",
    title: "ইনস্ট্যান্ট ডেলিভারি পান",
    desc: "১ থেকে ৫ মিনিটের মধ্যে সরাসরি আপনার ইন-গেম অ্যাকাউন্টে টপআপ যোগ হয়ে যাবে",
    color: "var(--accent-gold)",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({
    orders: 12847,
    customers: 8923,
    games: 8,
  });

  // Animate stats counter periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((s) => ({
        orders: s.orders + Math.floor(Math.random() * 2),
        customers: s.customers + (Math.random() > 0.8 ? 1 : 0),
        games: s.games,
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
                বাংলাদেশের বিশ্বস্ত গেমিং টপআপ প্ল্যাটফর্ম
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
                Free Fire, PUBG, Mobile Legends, Clash of Clans সহ সব গেমের ডায়মন্ড ও ইউসি কিনুন
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
                  href="/games?category=mobile"
                  className="btn btn-secondary btn-xl"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <span>জনপ্রিয় গেমস</span>
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

                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(7, 10, 18, 0.9) 0%, transparent 60%)",
                  }}
                />

                {/* Floating Badge 1: Free Fire */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "20px",
                    background: "rgba(7, 10, 18, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(249, 115, 22, 0.4)",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div style={{ width: "38px", height: "38px", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
                    <Image src="/games/free-fire.jpg" alt="Free Fire" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#F97316" }}>Free Fire 25💎</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent-lime)", fontWeight: 700 }}>৳ ২৫ (ইনস্ট্যান্ট)</div>
                  </div>
                </div>

                {/* Floating Badge 2: PUBG UC */}
                <div
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "20px",
                    background: "rgba(7, 10, 18, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div style={{ width: "38px", height: "38px", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
                    <Image src="/games/pubg-mobile.jpg" alt="PUBG" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#F59E0B" }}>PUBG 60 UC</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent-lime)", fontWeight: 700 }}>৳ ১১৫ (সেরা রেট)</div>
                  </div>
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

      {/* ── Featured Games Grid with REAL ARTWORK ── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                জনপ্রিয় গেমস
              </div>
              <h2 style={{ fontSize: "2.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                আপনার পছন্দের গেম বেছে নিন
              </h2>
            </div>
            <Link
              href="/games"
              className="btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              সব গেম দেখুন ({featuredGames.length}) <ChevronRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {featuredGames.map((game) => (
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
                {/* REAL Game Cover Area */}
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
                    alt={game.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    style={{
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    className="group-hover:scale-105"
                  />

                  {/* Gradient vignette */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(7, 10, 18, 0.95) 0%, rgba(7, 10, 18, 0.2) 60%, transparent 100%)",
                    }}
                  />

                  {/* Badges */}
                  <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                    {game.popular && (
                      <span className="badge badge-magenta" style={{ fontSize: "0.68rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <Flame size={11} /> Popular
                      </span>
                    )}
                  </div>

                  <div style={{ position: "absolute", bottom: "10px", left: "14px", display: "flex", gap: "6px" }}>
                    <span
                      style={{
                        background: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(6px)",
                        color: "var(--accent-cyan)",
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 600,
                      }}
                    >
                      {game.category}
                    </span>
                    <span
                      style={{
                        background: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(6px)",
                        color: "var(--accent-lime)",
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 600,
                      }}
                    >
                      ⚡ {game.deliveryTime}
                    </span>
                  </div>
                </div>

                {/* Info Area */}
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {game.nameBn}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.78rem", color: "#FACC15" }}>
                      <Star size={12} fill="#FACC15" />
                      <span>{game.rating}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                    {game.name}
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingTop: "12px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>শুরু মাত্র</span>
                      <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--accent-lime)" }}>
                        {game.minPrice}
                      </span>
                    </div>

                    <span
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: "0.8rem", padding: "6px 12px", borderRadius: "8px" }}
                    >
                      টপআপ ➔
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (৪ সহজ ধাপ) ── */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-default)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "12px" }}>
              কীভাবে টপআপ করবেন? <span className="gradient-text">(৪টি সহজ ধাপ)</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
              কোনো জটিলতা ছাড়াই মাত্র ২ মিনিটে আপনার পছন্দের গেম টপআপ করুন
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {howItWorks.map((step, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "28px 24px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    color: "rgba(255, 255, 255, 0.07)",
                    lineHeight: 1,
                    marginBottom: "16px",
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: step.color,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment Methods with REAL Official SVG Logos ── */}
      <section style={{ padding: "70px 24px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--accent-lime)",
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            <ShieldCheck size={16} /> ১০০% অনুমোদিত পেমেন্ট গেটওয়ে
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "32px", color: "var(--text-primary)" }}>
            আমাদের পেমেন্ট মাধ্যমসমূহ
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {[
              { name: "bKash", file: "/payments/bkash.svg", desc: "বিকাশ অটোমেটেড" },
              { name: "Nagad", file: "/payments/nagad.svg", desc: "নগদ ইনস্ট্যান্ট" },
              { name: "Rocket", file: "/payments/rocket.svg", desc: "রকেট পেমেন্ট" },
              { name: "Cards", file: "/payments/card.svg", desc: "ভিসা / মাস্টারকার্ড" },
            ].map((method) => (
              <div
                key={method.name}
                className="glass-card"
                style={{
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  minWidth: "160px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div style={{ height: "36px", width: "100px", position: "relative" }}>
                  <Image src={method.file} alt={method.name} fill style={{ objectFit: "contain" }} />
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {method.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action ── */}
      <section
        style={{
          padding: "90px 24px",
          background: "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(163,230,53,0.08) 100%)",
          borderTop: "1px solid var(--border-default)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "680px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.3rem", fontWeight: 900, marginBottom: "16px" }}>
            আজই জয়েন করুন <span className="gradient-text">Topup Center-এ</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "32px" }}>
            ফ্রি অ্যাকাউন্ট তৈরি করুন এবং প্রথম অর্ডারে কুপন কোড <strong>WELCOME50</strong> ব্যবহার করে ৫০ টাকা ছাড় উপভোগ করুন।
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/register"
              className="btn btn-primary btn-xl"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 30px rgba(34, 211, 238, 0.35)",
              }}
            >
              <span>ফ্রি অ্যাকাউন্ট খুলুন</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/games" className="btn btn-outline btn-xl">
              ক্যাটালগ ব্রাউজ করুন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

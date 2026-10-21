"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Live Stats Ticker ────────────────────────────────────────────────────────
const tickerItems = [
  "🎮 রাফিউল UC কিনেছেন — ৳৮০০",
  "⚡ সাকিব FF Diamond পেয়েছেন — ১০০০ Diamond",
  "💎 তামিম COC Gems নিয়েছেন — ৳৫৫০",
  "🏆 রিয়া MLBB Diamond পেয়েছেন — ৩২৮ Diamond",
  "🔥 জাহিন Steam Wallet পেয়েছেন — $10",
  "✅ মারিয়া DLS Coins নিয়েছেন — ২০০০ Coins",
];

// ─── Games Data ───────────────────────────────────────────────────────────────
const featuredGames = [
  {
    slug: "free-fire",
    name: "Free Fire",
    nameBn: "ফ্রি ফায়ার",
    category: "Battle Royale",
    gradient: "linear-gradient(135deg, #FF6B35, #F7C59F)",
    icon: "🔥",
    minPrice: "৳৯০",
    popular: true,
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    nameBn: "পাবজি মোবাইল",
    category: "Battle Royale",
    gradient: "linear-gradient(135deg, #F59E0B, #78350F)",
    icon: "🎯",
    minPrice: "৳১৬০",
    popular: true,
  },
  {
    slug: "clash-of-clans",
    name: "Clash of Clans",
    nameBn: "ক্ল্যাশ অব ক্ল্যান্স",
    category: "Strategy",
    gradient: "linear-gradient(135deg, #10B981, #064E3B)",
    icon: "⚔️",
    minPrice: "৳১১০",
    popular: false,
  },
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    nameBn: "মোবাইল লিজেন্ডস",
    category: "MOBA",
    gradient: "linear-gradient(135deg, #3B82F6, #1E1B4B)",
    icon: "🗡️",
    minPrice: "৳৮৫",
    popular: true,
  },
  {
    slug: "roblox",
    name: "Roblox",
    nameBn: "রোবলক্স",
    category: "Metaverse",
    gradient: "linear-gradient(135deg, #EF4444, #7F1D1D)",
    icon: "🧱",
    minPrice: "৳৯৫",
    popular: false,
  },
  {
    slug: "steam",
    name: "Steam Wallet",
    nameBn: "স্টিম ওয়ালেট",
    category: "PC Gaming",
    gradient: "linear-gradient(135deg, #6366F1, #1E1B4B)",
    icon: "🖥️",
    minPrice: "৳৮৫০",
    popular: false,
  },
  {
    slug: "dls",
    name: "Dream League Soccer",
    nameBn: "ড্রিম লিগ সকার",
    category: "Sports",
    gradient: "linear-gradient(135deg, #22D3EE, #164E63)",
    icon: "⚽",
    minPrice: "৳৬০",
    popular: false,
  },
  {
    slug: "google-play",
    name: "Google Play",
    nameBn: "গুগল প্লে",
    category: "Gift Card",
    gradient: "linear-gradient(135deg, #A3E635, #365314)",
    icon: "🎁",
    minPrice: "৳৮৫০",
    popular: false,
  },
];

const trustItems = [
  { icon: "⚡", label: "তাৎক্ষণিক ডেলিভারি", desc: "গড় ৫-১০ মিনিট" },
  { icon: "🔒", label: "১০০% সুরক্ষিত", desc: "SSL + বাংলাদেশ পেমেন্ট" },
  { icon: "💬", label: "২৪/৭ সাপোর্ট", desc: "AI + মানবিক সহায়তা" },
  { icon: "💰", label: "সর্বনিম্ন দাম", desc: "মার্কেটের সেরা রেট" },
];

const howItWorks = [
  {
    step: "০১",
    title: "গেম বেছে নিন",
    desc: "আমাদের ক্যাটালগ থেকে আপনার পছন্দের গেম সিলেক্ট করুন",
    color: "var(--accent-cyan)",
  },
  {
    step: "০২",
    title: "প্যাকেজ সিলেক্ট করুন",
    desc: "আপনার বাজেট অনুযায়ী সেরা ডায়মন্ড/UC প্যাকেজ বেছে নিন",
    color: "var(--accent-lime)",
  },
  {
    step: "০৩",
    title: "পেমেন্ট করুন",
    desc: "bKash, Nagad, Rocket বা কার্ডে পেমেন্ট করুন",
    color: "var(--accent-magenta)",
  },
  {
    step: "০৪",
    title: "ডায়মন্ড পান",
    desc: "৫-১০ মিনিটের মধ্যে আপনার একাউন্টে ডায়মন্ড/UC জমা হয়ে যাবে",
    color: "var(--accent-gold)",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [stats, setStats] = useState({
    orders: 12847,
    customers: 8923,
    games: 12,
  });

  // Animate stats counter
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((s) => ({
        orders: s.orders + Math.floor(Math.random() * 3),
        customers: s.customers + (Math.random() > 0.7 ? 1 : 0),
        games: s.games,
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "'Space Grotesk', 'Anek Bangla', sans-serif" }}>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(7, 10, 18, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-default)",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🎮
          </div>
          <div>
            <div
              className="gradient-text"
              style={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1 }}
            >
              Topup Center
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", lineHeight: 1 }}>
              গেমারদের বিশ্বস্ত বন্ধু
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link href="/games" className="btn btn-ghost btn-sm">
            গেমস
          </Link>
          <Link href="/login" className="btn btn-secondary btn-sm">
            লগইন
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            শুরু করুন
          </Link>
        </div>
      </nav>

      {/* ── Live Ticker ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(34, 211, 238, 0.05)",
          borderBottom: "1px solid rgba(34, 211, 238, 0.1)",
          padding: "8px 0",
          overflow: "hidden",
        }}
      >
        <div
          className="ticker-content"
          style={{
            display: "inline-flex",
            gap: "48px",
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
          }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ whiteSpace: "nowrap" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="alpona-bg"
        style={{
          padding: "80px 24px 100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hero glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(34, 211, 238, 0.1)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "24px",
              fontSize: "0.8rem",
              color: "var(--accent-cyan)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--accent-lime)",
                display: "inline-block",
                animation: "pulse-glow 2s infinite",
              }}
            />
            ১২,৮০০+ সফল টপআপ সম্পন্ন
          </div>

          <h1
            style={{
              marginBottom: "20px",
              maxWidth: "700px",
              margin: "0 auto 20px",
            }}
          >
            <span className="gradient-text">গেমিং টপআপ</span>
            <br />
            <span style={{ color: "var(--text-primary)", fontFamily: "'Anek Bangla', sans-serif" }}>
              এখন আরও সহজ
            </span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.15rem",
              maxWidth: "560px",
              margin: "0 auto 40px",
              lineHeight: "1.7",
              fontFamily: "'Anek Bangla', sans-serif",
            }}
          >
            Free Fire, PUBG, Clash of Clans সহ ১২+ গেমের টপআপ। bKash,
            Nagad, Rocket-এ পেমেন্ট করুন। মিনিটের মধ্যে পান।
          </p>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/games" className="btn btn-primary btn-xl">
              🎮 এখনই টপআপ করুন
            </Link>
            <Link href="/register" className="btn btn-secondary btn-xl">
              বিনামূল্যে যোগ দিন
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              marginTop: "64px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: stats.orders.toLocaleString("bn-BD") + "+", label: "সফল অর্ডার" },
              { value: stats.customers.toLocaleString("bn-BD") + "+", label: "সন্তুষ্ট গেমার" },
              { value: stats.games + "+", label: "গেম ক্যাটালগ" },
              { value: "৳৫০ থেকে", label: "শুরু হয়" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  className="gradient-text"
                  style={{ fontSize: "2rem", fontWeight: 800 }}
                >
                  {stat.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ───────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "32px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-default)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          {trustItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "28px" }}>{item.icon}</div>
              <div>
                <div
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    fontFamily: "'Anek Bangla', sans-serif",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Games Grid ────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2>
              <span className="gradient-text">জনপ্রিয় গেমস</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: "12px",
                fontFamily: "'Anek Bangla', sans-serif",
              }}
            >
              আপনার পছন্দের গেম বেছে নিন এবং এখনই টপআপ করুন
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {featuredGames.map((game) => (
              <Link key={game.slug} href={`/games/${game.slug}`} style={{ textDecoration: "none" }}>
                <div
                  className="glass-card tilt-card"
                  style={{
                    padding: "24px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {game.popular && (
                    <div
                      className="badge badge-cyan"
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        fontSize: "0.65rem",
                      }}
                    >
                      🔥 জনপ্রিয়
                    </div>
                  )}

                  {/* Game icon */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: game.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      marginBottom: "16px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    }}
                  >
                    {game.icon}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                      fontFamily: "'Anek Bangla', 'Space Grotesk', sans-serif",
                    }}
                  >
                    {game.nameBn}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "12px" }}>
                    {game.category}
                  </div>
                  <div style={{ color: "var(--accent-lime)", fontWeight: 600, fontSize: "0.85rem" }}>
                    {game.minPrice} থেকে শুরু →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href="/games" className="btn btn-outline">
              সব গেম দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-default)",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2>
              <span style={{ color: "var(--text-primary)" }}>কিভাবে কাজ করে?</span>
            </h2>
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
                style={{ padding: "28px", position: "relative" }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: step.color,
                    opacity: 0.3,
                    fontFamily: "'Space Grotesk', sans-serif",
                    lineHeight: 1,
                    marginBottom: "16px",
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "8px",
                    color: step.color,
                    fontFamily: "'Anek Bangla', sans-serif",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    fontFamily: "'Anek Bangla', sans-serif",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment Methods ────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontWeight: 400, marginBottom: "24px", fontFamily: "'Anek Bangla', sans-serif" }}>
            পেমেন্ট পদ্ধতি
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {[
              { name: "bKash", color: "#E2136E", icon: "📱" },
              { name: "Nagad", color: "#F7941D", icon: "💳" },
              { name: "Rocket", color: "#8B2FC9", icon: "🚀" },
              { name: "Card", color: "#1A56DB", icon: "💳" },
            ].map((method) => (
              <div
                key={method.name}
                className="glass-card"
                style={{
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: method.color,
                  minWidth: "120px",
                  justifyContent: "center",
                }}
              >
                {method.icon} {method.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.05) 0%, rgba(163,230,53,0.05) 100%)",
          borderTop: "1px solid var(--border-default)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2 style={{ marginBottom: "16px", fontFamily: "'Anek Bangla', sans-serif" }}>
            আজই শুরু করুন
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "32px",
              fontFamily: "'Anek Bangla', sans-serif",
            }}
          >
            বিনামূল্যে অ্যাকাউন্ট খুলুন এবং প্রথম অর্ডারে বিশেষ ছাড় পান
          </p>
          <Link href="/register" className="btn btn-primary btn-xl">
            🎮 বিনামূল্যে যোগ দিন
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-default)",
          padding: "48px 24px 32px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "32px",
              marginBottom: "40px",
            }}
          >
            {/* Brand */}
            <div>
              <div className="gradient-text" style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>
                🎮 Topup Center
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "'Anek Bangla', sans-serif" }}>
                বাংলাদেশের গেমারদের বিশ্বস্ত টপআপ মার্কেটপ্লেস
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "সেবাসমূহ",
                links: [
                  { label: "গেম ক্যাটালগ", href: "/games" },
                  { label: "ওয়ালেট", href: "/wallet" },
                  { label: "অর্ডার ট্র্যাক", href: "/orders" },
                  { label: "সাপোর্ট", href: "/support" },
                ],
              },
              {
                title: "কোম্পানি",
                links: [
                  { label: "আমাদের সম্পর্কে", href: "/about" },
                  { label: "FAQ", href: "/faq" },
                  { label: "রিভিউ", href: "/reviews" },
                  { label: "যোগাযোগ", href: "/contact" },
                ],
              },
              {
                title: "নীতিমালা",
                links: [
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Refund Policy", href: "/refund" },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    marginBottom: "12px",
                    fontSize: "0.9rem",
                    fontFamily: "'Anek Bangla', sans-serif",
                  }}
                >
                  {section.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                        fontFamily: "'Anek Bangla', 'Space Grotesk', sans-serif",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-default)",
              paddingTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "'Anek Bangla', sans-serif" }}>
              © ২০২৪ Topup Center। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              Powered by Next.js + Neon + UddoktaPay
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

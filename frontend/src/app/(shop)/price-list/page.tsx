import Link from "next/link";
import Image from "next/image";
import { getAllCatalogGames } from "@/lib/catalog-data";
import { Zap, ShieldCheck, ArrowRight, Tag, Search, Sparkles } from "lucide-react";

export const metadata = {
  title: "সকল গেমের রিয়েল প্রাইস লিস্ট | Topup Center",
  description: "Free Fire, PUBG UC, MLBB, CODM, CoC, Roblox সহ সকল জনপ্রিয় গেমের আসল বাংলাদেশি রেট তালিকা।",
};

export default function PriceListPage() {
  const games = getAllCatalogGames();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px 80px" }}>
      {/* Hero Title */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "rgba(34, 211, 238, 0.1)",
            border: "1px solid rgba(34, 211, 238, 0.3)",
            color: "var(--accent-cyan)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          <Sparkles style={{ width: "16px", height: "16px" }} />
          লাইভ মার্কেট রেট আপডেট
        </div>

        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900,
            color: "var(--text-primary)",
            marginBottom: "12px",
            letterSpacing: "-0.5px",
          }}
        >
          সকল গেমের রিয়েল প্রাইস লিস্ট
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "650px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          বাংলাদেশি গেমারদের জন্য ১০০% নিরাপদ, অফিসিয়াল এবং সবচেয়ে কম মূল্যের ইন-গেম ডায়মন্ড, ইউসি ও গিফট কার্ড রেট
        </p>
      </div>

      {/* Trust Badges Bar */}
      <div
        className="glass-card"
        style={{
          padding: "16px 24px",
          borderRadius: "14px",
          marginBottom: "36px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "rgba(11, 15, 25, 0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Zap style={{ color: "var(--accent-lime)", width: "20px", height: "20px" }} />
          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600 }}>
            ১-৫ মিনিটে ইনস্ট্যান্ট ডেলিভারি
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldCheck style={{ color: "var(--accent-cyan)", width: "20px", height: "20px" }} />
          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600 }}>
            ১০০% নিরাপদ ও আইডি ব্যান প্রুফ
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Tag style={{ color: "var(--accent-magenta)", width: "20px", height: "20px" }} />
          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600 }}>
            বিকাশ, নগদ ও রকেটে নো এক্সট্রা ফি
          </span>
        </div>
      </div>

      {/* Games Pricing Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
        {games.map((game, idx) => (
          <div
            key={game.id}
            id={game.slug}
            className="glass-card"
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Image
                    src={game.image}
                    alt={game.nameBn}
                    width={52}
                    height={52}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {game.nameBn}
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 400,
                        color: "var(--text-muted)",
                        marginLeft: "10px",
                      }}
                    >
                      ({game.nameEn})
                    </span>
                  </h2>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    ডেলিভারি গতি: {game.deliverySpeed} • {game.publisher}
                  </span>
                </div>
              </div>

              <Link
                href={`/games/${game.slug}`}
                className="btn btn-primary"
                style={{
                  padding: "8px 20px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                এখনই টপআপ করুন
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>

            {/* Packages Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
                <thead>
                  <tr>
                    <th>প্যাকেজের নাম</th>
                    <th>ইন-গেম পরিমাণ</th>
                    <th>অফিসিয়াল প্রাইস (BDT)</th>
                    <th>ডেলিভারি সময়</th>
                    <th style={{ textAlign: "right" }}>অর্ডার</th>
                  </tr>
                </thead>
                <tbody>
                  {game.packages.map((pkg) => {
                    const price = Number(pkg.pricePoisha) / 100;

                    return (
                      <tr key={pkg.id}>
                        <td>
                          <strong style={{ color: "var(--text-primary)" }}>{pkg.name}</strong>
                          {pkg.badge && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: "rgba(163, 230, 53, 0.15)",
                                color: "var(--accent-lime)",
                                fontWeight: 700,
                              }}
                            >
                              {pkg.badge}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--accent-lime)" }}>
                          {pkg.amountLabel}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 800,
                            fontSize: "1.05rem",
                            color: "var(--accent-cyan)",
                          }}
                        >
                          ৳ {price.toFixed(0)}
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          ⚡ {pkg.deliveryTime || game.deliverySpeed}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Link
                            href={`/games/${game.slug}`}
                            className="btn btn-secondary"
                            style={{
                              padding: "4px 12px",
                              fontSize: "0.8rem",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            কিনুন
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

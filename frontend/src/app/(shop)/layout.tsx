import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(7, 10, 18, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "14px 20px",
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
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#070A12",
                fontSize: "1.1rem",
              }}
            >
              ⚡
            </div>
            <div>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: "linear-gradient(135deg, #22D3EE, #F8FAFC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "block",
                  lineHeight: 1.1,
                }}
              >
                Topup Center
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--accent-lime)",
                  fontFamily: "'Anek Bangla', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                টপআপ সেন্টার • ইনস্ট্যান্ট ডেলিভারি
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }} className="hidden-mobile">
            <Link
              href="/"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.2s",
              }}
            >
              হোম
            </Link>
            <Link
              href="/games"
              style={{
                color: "var(--accent-cyan)",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              সব গেম
            </Link>
            <Link
              href="/wallet"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              ওয়ালেট
            </Link>
            <Link
              href="/faq"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              সাহায্য / FAQ
            </Link>
          </nav>

          {/* Right Action */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {session?.user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link
                  href="/wallet"
                  className="badge badge-cyan"
                  style={{ textDecoration: "none", padding: "6px 12px", display: "flex", gap: "6px", alignItems: "center" }}
                >
                  <span>💰</span>
                  <span>
                    ৳ {session.user.walletBalancePoisha ? (Number(session.user.walletBalancePoisha) / 100).toFixed(2) : "0.00"}
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="btn btn-outline"
                  style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                >
                  ড্যাশবোর্ড
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  href="/login"
                  className="btn btn-outline"
                  style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                >
                  লগইন
                </Link>
                <Link
                  href="/register"
                  className="btn btn-cyan"
                  style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                >
                  রেজিস্টার
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          background: "#05070D",
          padding: "40px 20px 24px",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "30px",
            marginBottom: "30px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.2rem" }}>⚡</span>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>Topup Center</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              বাংলাদেশের সবচেয়ে দ্রুত ও বিশ্বস্ত গেম টপআপ মার্কেটপ্লেস। ২৪/৭ অটোমেটেড ডেলিভারি এবং সার্বক্ষণিক কাস্টমার কেয়ার।
            </p>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "14px" }}>জনপ্রিয় গেম</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <Link href="/games/free-fire" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Free Fire Diamonds</Link>
              <Link href="/games/pubg-mobile" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>PUBG Mobile UC</Link>
              <Link href="/games/mobile-legends" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Mobile Legends</Link>
              <Link href="/games/clash-of-clans" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Clash of Clans Gems</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "14px" }}>গ্রাহক সেবা ও নীতি</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <Link href="/faq" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>সচরাচর জিজ্ঞাসা (FAQ)</Link>
              <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>শর্তাবলী (Terms)</Link>
              <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>গোপনীয়তা নীতি (Privacy)</Link>
              <Link href="/refund" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>রিফান্ড পলিসি (Refund)</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "14px" }}>পেমেন্ট পার্টনার</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px" }}>
              বিকাশ, নগদ, রকেট, উপাই এবং ডেবিট/ক্রেডিট কার্ডের মাধ্যমে নিরাপদ লেনদেন।
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "rgba(226, 19, 110, 0.15)", color: "#E2136E", border: "1px solid rgba(226,19,110,0.3)" }}>bKash</span>
              <span className="badge" style={{ background: "rgba(247, 148, 29, 0.15)", color: "#F7941D", border: "1px solid rgba(247,148,29,0.3)" }}>Nagad</span>
              <span className="badge" style={{ background: "rgba(140, 43, 137, 0.15)", color: "#8C2B89", border: "1px solid rgba(140,43,137,0.3)" }}>Rocket</span>
              <span className="badge badge-cyan">Visa / Master</span>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
          }}
        >
          <div>© {new Date().getFullYear()} Topup Center. সর্বস্বত্ব সংরক্ষিত।</div>
          <div>Made with ❤️ for Bangladeshi Gamers</div>
        </div>
      </footer>
    </div>
  );
}

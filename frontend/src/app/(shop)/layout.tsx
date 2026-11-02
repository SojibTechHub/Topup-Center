import Link from "next/link";
import { auth } from "@/lib/auth";
import { NoticeMarquee } from "@/components/layout/NoticeMarquee";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { LiveDeliveryTicker } from "@/components/layout/LiveDeliveryTicker";
import { ShieldCheck, Zap, HelpCircle, FileText, Phone, Settings } from "lucide-react";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdminOrStaff =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "STAFF";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Top Notice Marquee Banner */}
      <NoticeMarquee />

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(7, 10, 18, 0.88)",
          backdropFilter: "blur(14px)",
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
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#070A12",
                fontSize: "1.2rem",
                boxShadow: "0 0 16px rgba(34, 211, 238, 0.4)",
              }}
            >
              ⚡
            </div>
            <div>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 900,
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
          <nav style={{ display: "flex", alignItems: "center", gap: "22px" }} className="hidden-mobile">
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
              href="/price-list"
              style={{
                color: "var(--accent-lime)",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>⚡</span>
              <span>প্রাইস লিস্ট</span>
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
            {isAdminOrStaff && (
              <Link
                href="/admin"
                className="btn btn-primary"
                style={{
                  padding: "6px 14px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                <Settings style={{ width: "15px", height: "15px" }} />
                <span>অ্যাডমিন প্যানেল</span>
              </Link>
            )}

            {session?.user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

      {/* Floating Elements */}
      <LiveDeliveryTicker />
      <WhatsAppFloatingButton />

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          background: "#05070D",
          padding: "48px 20px 28px",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "36px",
            marginBottom: "36px",
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ fontSize: "1.4rem" }}>⚡</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>Topup Center</strong>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "16px" }}>
              বাংলাদেশের ১ নম্বর নির্ভরযোগ্য ও দ্রুততম গেম টপআপ মার্কেটপ্লেস। বিকাশ, নগদ, রকেটে অটোমেটিক ইনস্ট্যান্ট পেমেন্ট ও ২৪/৭ লাইভ সাপোর্ট।
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span className="badge badge-lime">100% Safe</span>
              <span className="badge badge-cyan">Instant Topup</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", marginBottom: "14px", fontWeight: 700 }}>
              দ্রুত লিঙ্কসমূহ
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <Link href="/games" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
                  🎮 সকল গেম তালিকা
                </Link>
              </li>
              <li>
                <Link href="/price-list" style={{ color: "var(--accent-lime)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
                  ⚡ অফিসিয়াল প্রাইস লিস্ট
                </Link>
              </li>
              <li>
                <Link href="/wallet" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
                  💼 ওয়ালেট টপআপ
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
                  ❓ সাধারণ জিজ্ঞাসা (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", marginBottom: "14px", fontWeight: 700 }}>
              নীতিমালা ও শর্তাবলী
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
                  ব্যবহারের শর্তাবলী (Terms)
                </Link>
              </li>
              <li>
                <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
                  গোপনীয়তা নীতি (Privacy)
                </Link>
              </li>
              <li>
                <Link href="/refund" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>
                  রিফান্ড ও রিটার্ন পলিসি
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", marginBottom: "14px", fontWeight: 700 }}>
              যোগাযোগ ও সহায়তা
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <div>📞 হোয়াটসঅ্যাপ: +880 1812-345678</div>
              <div>✉️ ইমেইল: support@topupcenter.com</div>
              <div>⏰ সার্ভিস সময়: সকাল ৯:০০ — রাত ২:০০</div>
              <div style={{ marginTop: "8px" }}>
                <span className="badge badge-yellow">অটোমেটিক গেটওয়ে ২৪/৭ চালু</span>
              </div>
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
            gap: "12px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <div>© {new Date().getFullYear()} Topup Center. সর্বস্বত্ব সংরক্ষিত।</div>
          <div>Made with ❤️ for Bangladeshi Gamers</div>
        </div>
      </footer>
    </div>
  );
}

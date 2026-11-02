import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const walletBdt = session.user.walletBalancePoisha
    ? (Number(session.user.walletBalancePoisha) / 100).toFixed(2)
    : "0.00";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <header
        style={{
          background: "rgba(7, 10, 18, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "12px 20px",
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
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#070A12",
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #22D3EE, #F8FAFC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Topup Center
            </span>
          </Link>

          {/* Customer Nav */}
          <nav style={{ display: "flex", gap: "20px", alignItems: "center" }} className="hidden-mobile">
            <Link href="/dashboard" style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "0.9rem" }}>
              📊 ড্যাশবোর্ড
            </Link>
            <Link href="/wallet" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
              💰 ওয়ালেট
            </Link>
            <Link href="/orders" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
              📦 আমার অর্ডার
            </Link>
            <Link href="/profile" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
              👤 প্রোফাইল
            </Link>
            <Link href="/support" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
              💬 সাপোর্ট
            </Link>
          </nav>

          {/* User & Wallet */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/wallet"
              className="badge badge-cyan"
              style={{
                textDecoration: "none",
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 700,
              }}
            >
              <span>৳</span>
              <span>{walletBdt}</span>
            </Link>
            <Link href="/games" className="btn btn-cyan" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              + টপআপ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Customer Workspace */}
      <main style={{ flex: 1, padding: "30px 20px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}

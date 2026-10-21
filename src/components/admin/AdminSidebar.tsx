"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const navItems: NavSection[] = [
  {
    section: "মূল",
    items: [
      { href: "/admin", label: "ড্যাশবোর্ড", icon: "📊", exact: true },
      { href: "/admin/orders", label: "অর্ডার কিউ", icon: "📦", badge: "queue" },
    ],
  },
  {
    section: "ক্যাটালগ",
    items: [
      { href: "/admin/games", label: "গেমস", icon: "🎮" },
      { href: "/admin/packages", label: "প্যাকেজ", icon: "💎" },
    ],
  },
  {
    section: "পেমেন্ট",
    items: [
      { href: "/admin/payments", label: "পেমেন্ট লগ", icon: "💳" },
      { href: "/admin/wallet", label: "ম্যানুয়াল টপআপ", icon: "💰" },
    ],
  },
  {
    section: "ইউজার",
    items: [
      { href: "/admin/users", label: "ব্যবহারকারী", icon: "👥" },
      { href: "/admin/support", label: "সাপোর্ট", icon: "💬" },
    ],
  },
  {
    section: "মার্কেটিং",
    items: [
      { href: "/admin/coupons", label: "কুপন", icon: "🏷️" },
      { href: "/admin/banners", label: "ব্যানার", icon: "🖼️" },
      { href: "/admin/reviews", label: "রিভিউ", icon: "⭐" },
    ],
  },
  {
    section: "সিস্টেম",
    items: [
      { href: "/admin/audit-logs", label: "অডিট লগ", icon: "📋" },
      { href: "/admin/ai-insights", label: "AI ইনসাইটস", icon: "🤖" },
      { href: "/admin/settings", label: "সেটিংস", icon: "⚙️" },
    ],
  },
];

interface AdminSidebarProps {
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "260px",
        height: "100vh",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="gradient-text" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
          🎮 Topup Center
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--accent-cyan)",
            fontWeight: 600,
            marginTop: "2px",
          }}
        >
          Admin Mission Control
        </div>
      </div>

      {/* User Info */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--gradient-magenta)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "white",
            flexShrink: 0,
          }}
        >
          {(user.name || user.email)[0]?.toUpperCase()}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name || user.email}
          </div>
          <div
            className="badge badge-cyan"
            style={{ fontSize: "0.65rem", marginTop: "2px" }}
          >
            {user.role}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {navItems.map((section) => (
          <div key={section.section} style={{ marginBottom: "16px" }}>
            <div
              style={{
                padding: "4px 20px 8px",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {section.section}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 20px",
                  fontSize: "0.875rem",
                  fontWeight: isActive(item.href, item.exact) ? 600 : 400,
                  color: isActive(item.href, item.exact)
                    ? "var(--accent-cyan)"
                    : "var(--text-secondary)",
                  background: isActive(item.href, item.exact)
                    ? "rgba(34, 211, 238, 0.08)"
                    : "transparent",
                  borderLeft: isActive(item.href, item.exact)
                    ? "2px solid var(--accent-cyan)"
                    : "2px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  fontFamily: "'Anek Bangla', 'Space Grotesk', sans-serif",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-default)" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            textDecoration: "none",
            padding: "8px 0",
          }}
        >
          🏠 মূল সাইট
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#EF4444",
            fontSize: "0.8rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 0",
            fontFamily: "'Anek Bangla', sans-serif",
            width: "100%",
            textAlign: "left",
          }}
          id="admin-logout"
        >
          🚪 লগআউট
        </button>
      </div>
    </aside>
  );
}

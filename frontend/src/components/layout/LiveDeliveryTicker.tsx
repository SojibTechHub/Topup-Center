"use client";

import { useState, useEffect } from "react";
import { Zap, CheckCircle2, X } from "lucide-react";

interface NotificationItem {
  id: string;
  phone: string;
  game: string;
  amount: string;
  timeAgo: string;
}

const SAMPLE_DELIVERIES: NotificationItem[] = [
  { id: "1", phone: "০১৭***৯৫২", game: "Free Fire", amount: "115 💎", timeAgo: "১ মিনিট আগে" },
  { id: "2", phone: "০১৮***২২১", game: "PUBG Mobile", amount: "60 UC", timeAgo: "২ মিনিট আগে" },
  { id: "3", phone: "০১৯***৮৪৩", game: "Mobile Legends", amount: "Weekly Diamond Pass", timeAgo: "৩ মিনিট আগে" },
  { id: "4", phone: "০১৬***১২০", game: "Free Fire", amount: "Weekly Membership", timeAgo: "৪ মিনিট আগে" },
  { id: "5", phone: "০১৭***৭৭৬", game: "CODM CP", amount: "80 CP", timeAgo: "৫ মিনিট আগে" },
  { id: "6", phone: "০১৮***৫৬৯", game: "Clash of Clans", amount: "Gold Pass", timeAgo: "৭ মিনিট আগে" },
  { id: "7", phone: "০১৯***৩০১", game: "Roblox", amount: "400 Robux", timeAgo: "৮ মিনিট আগে" },
  { id: "8", phone: "০১৭***৪০২", game: "Valorant", amount: "1000 VP", timeAgo: "১০ মিনিট আগে" },
];

export function LiveDeliveryTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SAMPLE_DELIVERIES.length);
        setVisible(true);
      }, 500);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const item = SAMPLE_DELIVERIES[index];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "28px",
        zIndex: 90,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        maxWidth: "340px",
        pointerEvents: visible ? "auto" : "none",
      }}
      className="hidden-mobile"
    >
      <div
        className="glass-card"
        style={{
          padding: "10px 14px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: "1px solid rgba(34, 211, 238, 0.25)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
          background: "rgba(11, 15, 25, 0.95)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(163, 230, 53, 0.15)",
            color: "var(--accent-lime)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap style={{ width: "16px", height: "16px" }} />
        </div>

        <div style={{ flex: 1, fontSize: "0.8rem", lineHeight: 1.3 }}>
          <div style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            <span style={{ color: "var(--accent-cyan)", fontFamily: "monospace" }}>{item.phone}</span>{" "}
            টপআপ সফল
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            {item.game} ({item.amount}) • {item.timeAgo}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X style={{ width: "12px", height: "12px" }} />
        </button>
      </div>
    </div>
  );
}

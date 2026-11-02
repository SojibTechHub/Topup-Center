"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";

export function NoticeMarquee() {
  const [notice, setNotice] = useState<string>(
    "⚡ ফ্রি ফায়ার ও পাবজি ইউসি ১০০% অটো ইনস্ট্যান্ট ডেলিভারি চালু আছে! বিকাশ, নগদ, রকেটে পেমেন্ট করুন | ২৪/৭ লাইভ সাপোর্ট"
  );
  const [active, setActive] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.notice_ticker) {
          if (data.settings.notice_ticker.text) {
            setNotice(data.settings.notice_ticker.text);
          }
          if (data.settings.notice_ticker.active !== undefined) {
            setActive(Boolean(data.settings.notice_ticker.active));
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!active || dismissed) return null;

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #070A12 0%, #151D33 50%, #070A12 100%)",
        borderBottom: "1px solid rgba(34, 211, 238, 0.2)",
        color: "var(--text-primary)",
        fontSize: "0.85rem",
        padding: "6px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, zIndex: 2 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(34, 211, 238, 0.15)",
            color: "var(--accent-cyan)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        >
          <Megaphone style={{ width: "12px", height: "12px" }} />
          নোটিশ
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          margin: "0 16px",
        }}
      >
        <div
          className="marquee-text"
          style={{
            display: "inline-block",
            color: "#E2E8F0",
            animation: "marquee 25s linear infinite",
          }}
        >
          {notice} &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; {notice}
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
          flexShrink: 0,
        }}
        title="বন্ধ করুন"
      >
        <X style={{ width: "14px", height: "14px" }} />
      </button>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

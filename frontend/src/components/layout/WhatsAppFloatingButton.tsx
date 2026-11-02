"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton() {
  const [phone, setPhone] = useState("+8801812345678");

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.support_contacts?.whatsapp) {
          setPhone(data.settings.support_contacts.whatsapp);
        }
      })
      .catch(() => {});
  }, []);

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "আসসালামু আলাইকুম! Topup Center থেকে অর্ডার ও সাপোর্ট সম্পর্কিত সহায়তা চাচ্ছি।"
  )}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 99,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(37, 211, 102, 0.4)",
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(37, 211, 102, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 211, 102, 0.4)";
        }}
        title="WhatsApp Live Support"
      >
        <span
          style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#10B981",
            border: "2px solid #070A12",
          }}
        />
        <MessageCircle style={{ width: "30px", height: "30px" }} />
      </a>
    </aside>
  );
}

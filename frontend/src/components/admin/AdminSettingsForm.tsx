"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, AlertTriangle, Shield, Phone, Bell, DollarSign, RefreshCw } from "lucide-react";

interface AdminSettingsFormProps {
  initialSettings: Record<string, any>;
}

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const [siteNameBn, setSiteNameBn] = useState(initialSettings.site_name?.bn || "টপআপ সেন্টার");
  const [siteNameEn, setSiteNameEn] = useState(initialSettings.site_name?.en || "Topup Center");
  const [tagline, setTagline] = useState(initialSettings.site_tagline || "বাংলাদেশের সবচেয়ে দ্রুত ও নির্ভরযোগ্য গেম টপআপ প্ল্যাটফর্ম");
  const [maintenance, setMaintenance] = useState(Boolean(initialSettings.maintenance_mode));

  const [noticeText, setNoticeText] = useState(
    initialSettings.notice_ticker?.text ||
      "⚡ ফ্রি ফায়ার ও পাবজি ইউসি ১০০% অটো ইনস্ট্যান্ট ডেলিভারি চালু আছে! বিকাশ, নগদ, রকেটে পেমেন্ট করুন | ২৪/৭ লাইভ সাপোর্ট"
  );
  const [noticeActive, setNoticeActive] = useState(initialSettings.notice_ticker?.active !== false);

  const [whatsapp, setWhatsapp] = useState(initialSettings.support_contacts?.whatsapp || "+8801812345678");
  const [telegram, setTelegram] = useState(initialSettings.support_contacts?.telegram || "topupcenter_support");
  const [email, setEmail] = useState(initialSettings.support_contacts?.email || "support@topupcenter.com");
  const [hotline, setHotline] = useState(initialSettings.support_contacts?.phone || "+8801812345678");

  const [bkash, setBkash] = useState(initialSettings.manual_payment_numbers?.bkash || "01812345678 (Personal / Send Money)");
  const [nagad, setNagad] = useState(initialSettings.manual_payment_numbers?.nagad || "01912345678 (Personal / Send Money)");
  const [rocket, setRocket] = useState(initialSettings.manual_payment_numbers?.rocket || "017123456789 (Personal / Send Money)");
  const [instruction, setInstruction] = useState(
    initialSettings.manual_payment_numbers?.instruction ||
      "টাকা সেন্ড মানি করার পর নিচে সঠিক TrxID এবং প্রেরকের মোবাইল নম্বর দিন।"
  );

  const [minDeposit, setMinDeposit] = useState(
    initialSettings.wallet_limits?.min_topup_poisha
      ? Number(initialSettings.wallet_limits.min_topup_poisha) / 100
      : 50
  );
  const [maxDeposit, setMaxDeposit] = useState(
    initialSettings.wallet_limits?.max_topup_poisha
      ? Number(initialSettings.wallet_limits.max_topup_poisha) / 100
      : 25000
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: { bn: siteNameBn, en: siteNameEn },
          site_tagline: tagline,
          maintenance_mode: maintenance,
          notice_ticker: { text: noticeText, active: noticeActive },
          support_contacts: { whatsapp, telegram, email, phone: hotline },
          manual_payment_numbers: { bkash, nagad, rocket, instruction },
          wallet_limits: {
            min_topup_poisha: Math.round(minDeposit * 100),
            max_topup_poisha: Math.round(maxDeposit * 100),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে");

      toast.success("✅ সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. General & Brand */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Shield style={{ color: "var(--accent-cyan)", width: "22px", height: "22px" }} />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            সাইটের ব্র্যান্ডিং ও মূল তথ্য
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              সাইটের নাম (বাংলা)
            </label>
            <input
              type="text"
              value={siteNameBn}
              onChange={(e) => setSiteNameBn(e.target.value)}
              className="input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              সাইটের নাম (English)
            </label>
            <input
              type="text"
              value={siteNameEn}
              onChange={(e) => setSiteNameEn(e.target.value)}
              className="input"
              style={{ width: "100%" }}
              required
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            সাইট ট্যাগলাইন (Tagline)
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="input"
            style={{ width: "100%" }}
          />
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "14px 18px",
            background: maintenance ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.03)",
            borderRadius: "10px",
            border: `1px solid ${maintenance ? "rgba(239, 68, 68, 0.3)" : "var(--border-color)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong style={{ color: maintenance ? "#EF4444" : "var(--text-primary)", display: "block" }}>
              মেইনটেন্যান্স মোড (Maintenance Mode)
            </strong>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              চালু করলে গ্রাহকরা ওয়েবসাইটে ঢুকলে রক্ষণাবেক্ষণ নোটিশ দেখতে পাবেন
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMaintenance(!maintenance)}
            className={`btn ${maintenance ? "btn-red" : "btn-secondary"}`}
            style={{ padding: "6px 16px", fontSize: "0.85rem" }}
          >
            {maintenance ? "🛑 চালু আছে" : "বন্ধ (স্বাভাবিক)"}
          </button>
        </div>
      </div>

      {/* 2. Notice Marquee */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Bell style={{ color: "var(--accent-lime)", width: "22px", height: "22px" }} />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            হেডার নোটিশ টিকার (মারকুই ব্যানার)
          </h2>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            টিকার মেসেজ (ওয়েবসাইটের একদম উপরে স্ক্রল হবে):
          </label>
          <textarea
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            className="input"
            rows={2}
            style={{ width: "100%", resize: "vertical" }}
            required
          />
        </div>

        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            id="noticeActive"
            checked={noticeActive}
            onChange={(e) => setNoticeActive(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--accent-lime)", cursor: "pointer" }}
          />
          <label htmlFor="noticeActive" style={{ fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
            হেডারে নোটিশ টিকার প্রদর্শন করুন
          </label>
        </div>
      </div>

      {/* 3. WhatsApp & Support Contacts */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Phone style={{ color: "#22C55E", width: "22px", height: "22px" }} />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            সাপোর্ট ও হোয়াটসঅ্যাপ কনফিগারেশন
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              WhatsApp নম্বর (দেশীয় কোড সহ e.g. +8801812345678)
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
              required
            />
            <span style={{ fontSize: "0.75rem", color: "var(--accent-lime)" }}>
              * এটি সরাসরি ওয়েবসাইটের ফ্লোটিং হোয়াটসঅ্যাপ বাটনে কানেক্ট হবে
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              সাপোর্ট হটলাইন / ফোন
            </label>
            <input
              type="text"
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              সাপোর্ট ইমেইল
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Telegram ইউজারনেম
            </label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="input"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* 4. Manual Payment Numbers */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <DollarSign style={{ color: "var(--accent-magenta)", width: "22px", height: "22px" }} />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            ম্যানুয়াল পেমেন্ট নম্বর (Send Money)
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#F0447C", marginBottom: "6px", fontWeight: 600 }}>
              বিকাশ নম্বর (bKash)
            </label>
            <input
              type="text"
              value={bkash}
              onChange={(e) => setBkash(e.target.value)}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#F97316", marginBottom: "6px", fontWeight: 600 }}>
              নগদ নম্বর (Nagad)
            </label>
            <input
              type="text"
              value={nagad}
              onChange={(e) => setNagad(e.target.value)}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#8B5CF6", marginBottom: "6px", fontWeight: 600 }}>
              রকেট নম্বর (Rocket)
            </label>
            <input
              type="text"
              value={rocket}
              onChange={(e) => setRocket(e.target.value)}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              গ্রাহকের জন্য নির্দেশনা টেক্সট
            </label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="input"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* 5. Wallet Limits */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
          ওয়ালেট ডিপোজিট লিমিট
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              সর্বনিম্ন ডিপোজিট (৳ BDT)
            </label>
            <input
              type="number"
              min="10"
              value={minDeposit}
              onChange={(e) => setMinDeposit(Number(e.target.value))}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              সর্বোচ্চ ডিপোজিট (৳ BDT)
            </label>
            <input
              type="number"
              min="100"
              value={maxDeposit}
              onChange={(e) => setMaxDeposit(Number(e.target.value))}
              className="input"
              style={{ width: "100%", fontFamily: "monospace" }}
              required
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{
            padding: "14px 32px",
            fontSize: "1.05rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" style={{ width: "20px", height: "20px" }} />
              সংরক্ষণ হচ্ছে...
            </>
          ) : (
            <>
              <Save style={{ width: "20px", height: "20px" }} />
              সেটিংস সংরক্ষণ করুন
            </>
          )}
        </button>
      </div>
    </form>
  );
}

import { db } from "@/lib/db";

export const metadata = {
  title: "সিস্টেম সেটিংস | Admin Mission Control",
};

export default async function AdminSettingsPage() {
  const settings: Record<string, any> = {};

  try {
    const rawSettings = await db.setting.findMany();
    rawSettings.forEach((s) => {
      settings[s.key] = s.value;
    });
  } catch (e) {
    console.error("Admin settings error:", e);
  }

  const manualNumbers = settings.manual_payment_numbers || {
    bkash: "01812345678",
    nagad: "01912345678",
    rocket: "017123456789",
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          সিস্টেম ও স্টোর সেটিংস
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          পেমেন্ট নম্বর, নোটিশ টিকার ও রক্ষণাবেক্ষণ মোড কনফিগারেশন
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Maintenance & General */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            সাধারণ সেটিংস
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "var(--text-primary)", display: "block" }}>মেইনটেন্যান্স মোড</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>চালু করলে গ্রাহকরা সাইটে ঢুকতে পারবে না</span>
              </div>
              <span className={`badge ${settings.maintenance_mode ? "badge-red" : "badge-lime"}`}>
                {settings.maintenance_mode ? "অন (সক্রিয়)" : "অফ (স্বাভাবিক)"}
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                হেডার নোটিশ টিকার টেক্সট:
              </label>
              <input
                type="text"
                readOnly
                defaultValue={settings.notice_ticker?.text || "⚡ ইনস্ট্যান্ট ডেলিভারি | বিকাশ, নগদ, রকেটে পেমেন্ট করুন"}
                className="input"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Manual Payment Numbers */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent-lime)", marginBottom: "16px" }}>
            ম্যানুয়াল পেমেন্ট নম্বরসমূহ
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                বিকাশ নম্বর:
              </label>
              <input
                type="text"
                readOnly
                defaultValue={manualNumbers.bkash}
                className="input"
                style={{ width: "100%", fontFamily: "monospace" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                নগদ নম্বর:
              </label>
              <input
                type="text"
                readOnly
                defaultValue={manualNumbers.nagad}
                className="input"
                style={{ width: "100%", fontFamily: "monospace" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                রকেট নম্বর:
              </label>
              <input
                type="text"
                readOnly
                defaultValue={manualNumbers.rocket}
                className="input"
                style={{ width: "100%", fontFamily: "monospace" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

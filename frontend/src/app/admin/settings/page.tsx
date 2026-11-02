import { db } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

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

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          সিস্টেম ও স্টোর সেটিংস
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          হোয়াটসঅ্যাপ নম্বর, পেমেন্ট নম্বর, নোটিশ টিকার ও রক্ষণাবেক্ষণ মোড সরাসরি নিয়ন্ত্রণ করুন
        </p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}

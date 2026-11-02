import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "কাস্টমার সাপোর্ট ও হেল্পডেস্ক | Topup Center",
};

export default async function CustomerSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ orderCode?: string }>;
}) {
  const { orderCode } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  let tickets: any[] = [];

  if (userId) {
    try {
      tickets = await db.supportTicket.findMany({
        where: { userId },
        include: { messages: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("Support tickets error:", e);
    }
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            সাপোর্ট হেল্পডেস্ক
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
            যেকোনো সমস্যায় আমাদের ২৪/৭ সাপোর্ট টিম ও এআই অ্যাসিস্ট্যান্টের সাহায্য নিন
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href="https://t.me/topupcenter_support"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ padding: "8px 18px", fontSize: "0.85rem", textDecoration: "none" }}
          >
            ✈️ টেলিগ্রাম সাপোর্ট
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Create Ticket Form */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "16px" }}>
            নতুন সাপোর্ট টিকিট খুলুন
          </h3>

          <form action="/api/support/tickets" method="POST">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  বিষয় (Subject)
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. ডায়মন্ড এখনো অ্যাকাউন্টে আসেনি"
                  className="input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  সম্পর্কিত অর্ডার কোড (যদি থাকে)
                </label>
                <input
                  type="text"
                  name="orderCode"
                  defaultValue={orderCode || ""}
                  placeholder="e.g. TC-ABC123"
                  className="input"
                  style={{ width: "100%", fontFamily: "monospace" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                সমস্যার বিস্তারিত বিবরণ
              </label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="আপনার সমস্যার কথা বিস্তারিত লিখুন। প্লেয়ার আইডি বা ট্রানজেকশন তথ্য উল্লেখ করুন..."
                className="input"
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            <button type="submit" className="btn btn-cyan" style={{ padding: "10px 24px", fontSize: "0.95rem" }}>
              টিকিট সাবমিট করুন ➔
            </button>
          </form>
        </div>

        {/* Existing Tickets List */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            আপনার টিকিট হিস্টোরি
          </h3>

          {tickets.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0, textAlign: "center", padding: "30px 0" }}>
              আপনার কোনো সক্রিয় সাপোর্ট টিকিট নেই।
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-primary)", fontSize: "1rem", display: "block" }}>
                      {t.subject}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(t.createdAt).toLocaleString("bn-BD")}
                      {t.orderId && ` • অর্ডার: ${t.orderId}`}
                    </span>
                  </div>

                  <span
                    className={`badge ${
                      t.status === "RESOLVED"
                        ? "badge-lime"
                        : t.status === "OPEN"
                        ? "badge-yellow"
                        : "badge-cyan"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

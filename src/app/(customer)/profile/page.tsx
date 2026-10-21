import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "প্রোফাইল ও সেটিংস | Topup Center",
};

export default async function CustomerProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  let user = null;
  let savedIds: any[] = [];
  let referralCount = 0;

  if (userId) {
    try {
      user = await db.user.findUnique({
        where: { id: userId },
      });

      savedIds = await db.savedPlayerId.findMany({
        where: { userId },
      });

      referralCount = await db.referral.count({
        where: { referrerId: userId },
      });
    } catch (e) {
      console.error("Profile page error:", e);
    }
  }

  const referralUrl = `${process.env.APP_URL || "http://localhost:3000"}/register?ref=${user?.referralCode || ""}`;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          প্রোফাইল ও অ্যাকাউন্ট
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          ব্যক্তিগত তথ্য, রেফারেল বোনাস এবং সংরক্ষিত প্লেয়ার আইডি
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Personal Info */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
            ব্যক্তিগত তথ্য
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>নাম</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{user?.name || "নাম দেওয়া হয়নি"}</strong>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>ইমেইল</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{user?.email || "—"}</strong>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>মোবাইল নম্বর</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{user?.phone || "—"}</strong>
            </div>

            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>লয়ালটি টিয়ার</span>
              <span className="badge badge-lime">🌟 {user?.loyaltyTier || "BRONZE"}</span>
            </div>
          </div>
        </div>

        {/* Referral Program */}
        <div className="glass-card" style={{ padding: "28px", border: "1px solid var(--accent-magenta)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent-magenta)", margin: 0 }}>
              🎁 রেফারেল ও বোনাস
            </h3>
            <span className="badge badge-magenta">মোট রেফারেল: {referralCount} জন</span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "16px" }}>
            আপনার বন্ধুদের ইনভাইট করুন! আপনার রেফারেল লিংক ব্যবহার করে তারা প্রথম টপআপ সম্পন্ন করলেই আপনার ওয়ালেটে ৳২০ বোনাস ক্রেডিট হবে।
          </p>

          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            আপনার ইউনিক রেফারেল লিংক:
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="input"
              style={{ flex: 1, fontFamily: "monospace", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        {/* Saved Player IDs */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            ⭐ সংরক্ষিত প্লেয়ার আইডিসমূহ (Saved IDs)
          </h3>

          {savedIds.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              এখনো কোনো প্লেয়ার আইডি সেভ করা হয়নি। চেকআউটের সময় প্লেয়ার আইডি সেভ করে রাখলে পরবর্তীতে দ্রুত টপআপ করা যাবে।
            </p>
          ) : (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {savedIds.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <strong style={{ color: "var(--accent-cyan)", display: "block" }}>{item.label || "আইডি"}</strong>
                  <span style={{ fontFamily: "monospace", color: "#F8FAFC", fontSize: "0.95rem" }}>
                    {Object.values(item.playerFields as Record<string, string>)[0]}
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

import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const metadata = {
  title: "AI ইনসাইটস ও কি পুল হেলথ | Admin Mission Control",
};

export default async function AdminAiInsightsPage() {
  let aiLogs: any[] = [];
  let totalCalls = 0;
  let totalTokens = 0;

  try {
    aiLogs = await db.aiUsageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    totalCalls = await db.aiUsageLog.count();
    const tokenSum = await db.aiUsageLog.aggregate({
      _sum: { tokens: true },
    });
    totalTokens = tokenSum._sum.tokens || 0;
  } catch (e) {
    console.error("AI insights error:", e);
  }

  // Key pool status
  const geminiKeys = [
    { index: 1, active: !!env.GEMINI_API_KEY_1 },
    { index: 2, active: !!env.GEMINI_API_KEY_2 },
    { index: 3, active: !!env.GEMINI_API_KEY_3 },
    { index: 4, active: !!env.GEMINI_API_KEY_4 },
  ];

  const grokKeys = [
    { index: 1, active: !!env.GROK_API_KEY_1 },
    { index: 2, active: !!env.GROK_API_KEY_2 },
    { index: 3, active: !!env.GROK_API_KEY_3 },
    { index: 4, active: !!env.GROK_API_KEY_4 },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          AI ইঞ্জিন ও কি পুল ইনসাইটস
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          Gemini ×4 এবং Grok ×4 মাল্টি-কি রাউন্ড-রবিন ও অটো ফেইলওভার হেলথ
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>মোট AI রিকোয়েস্ট</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "4px" }}>
            {totalCalls}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>টোকেন ব্যবহার</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-lime)", marginTop: "4px" }}>
            {totalTokens.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>প্রাইমারি ইঞ্জিন</span>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-magenta)", marginTop: "4px", textTransform: "uppercase" }}>
            {env.AI_PRIMARY} ({env.AI_PRIMARY === "gemini" ? env.GEMINI_MODEL : env.GROK_MODEL})
          </div>
        </div>
      </div>

      {/* Key Pools Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Gemini Pool */}
        <div className="glass-card" style={{ padding: "24px", border: "1px solid rgba(34, 211, 238, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-cyan)", margin: 0 }}>
              🔷 Gemini Key Pool (Google)
            </h3>
            <span className="badge badge-cyan">{env.GEMINI_MODEL}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {geminiKeys.map((k) => (
              <div
                key={k.index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span>GEMINI_API_KEY_{k.index}</span>
                <span className={`badge ${k.active ? "badge-lime" : "badge-yellow"}`}>
                  {k.active ? "✓ কনফিগার করা" : "⚠️ খালি"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grok Pool */}
        <div className="glass-card" style={{ padding: "24px", border: "1px solid rgba(163, 230, 53, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-lime)", margin: 0 }}>
              ⚡ Grok Key Pool (xAI)
            </h3>
            <span className="badge badge-lime">{env.GROK_MODEL}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {grokKeys.map((k) => (
              <div
                key={k.index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span>GROK_API_KEY_{k.index}</span>
                <span className={`badge ${k.active ? "badge-lime" : "badge-yellow"}`}>
                  {k.active ? "✓ কনফিগার করা" : "⚠️ খালি"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Usage Logs */}
      <div className="glass-card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          সর্বশেষ AI কল লগ (Failover & Latency)
        </h3>

        {aiLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
            এখনো কোনো AI রিকোয়েস্ট লগ হয়নি।
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>সময়</th>
                  <th>ফিচার</th>
                  <th>প্রোভাইডার</th>
                  <th>কি ইনডেক্স</th>
                  <th>মডেল</th>
                  <th>লেটেন্সি</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {aiLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(log.createdAt).toLocaleTimeString("bn-BD")}
                    </td>
                    <td>
                      <span className="badge badge-cyan">{log.feature}</span>
                    </td>
                    <td style={{ fontWeight: 700, textTransform: "capitalize" }}>{log.provider}</td>
                    <td>Key #{log.keyIndex + 1}</td>
                    <td style={{ fontFamily: "monospace" }}>{log.model}</td>
                    <td>{log.latencyMs ? `${log.latencyMs}ms` : "—"}</td>
                    <td>
                      <span className={`badge ${log.status === "success" ? "badge-lime" : "badge-red"}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

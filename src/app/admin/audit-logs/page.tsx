import { db } from "@/lib/db";

export const metadata = {
  title: "অডিট লগ ও সিকিউরিটি হিস্টোরি | Admin Mission Control",
};

export default async function AdminAuditLogsPage() {
  let logs: any[] = [];

  try {
    logs = await db.auditLog.findMany({
      include: {
        admin: { select: { name: true, email: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (e) {
    console.error("Admin audit logs error:", e);
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          অডিট লগ ও অখণ্ড সিকিউরিটি রেকর্ড
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          কে, কখন, কোন অ্যাকশন সম্পাদন করেছে তার সম্পূর্ণ অপরিবর্তনীয় রেকর্ড
        </p>
      </div>

      <div className="glass-card" style={{ padding: "20px" }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            কোনো অডিট লগ রেকর্ড নেই।
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>তারিখ ও সময়</th>
                  <th>অ্যাকশন</th>
                  <th>রিসোর্স</th>
                  <th>অ্যাডমিন / কর্তা</th>
                  <th>প্রভাবিত ইউজার</th>
                  <th>নোট / বিবরণ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleString("bn-BD")}
                    </td>
                    <td>
                      <span className="badge badge-cyan">{log.action}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{log.resource}</strong>
                      {log.resourceId && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                          ID: {log.resourceId.slice(0, 10)}
                        </span>
                      )}
                    </td>
                    <td>{log.admin?.name || log.admin?.email || "System"}</td>
                    <td>{log.user?.name || log.user?.email || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{log.note || "—"}</td>
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

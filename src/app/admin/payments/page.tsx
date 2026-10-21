import { db } from "@/lib/db";
import AdminManualTopupActions from "@/components/admin/AdminManualTopupActions";

export const metadata = {
  title: "পেমেন্ট ও ট্রানজেকশন ম্যানেজমেন্ট | Admin Mission Control",
};

export default async function AdminPaymentsPage() {
  let manualTopups: any[] = [];
  let payments: any[] = [];

  try {
    manualTopups = await db.manualTopup.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    payments = await db.payment.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.error("Admin payments error:", e);
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          পেমেন্ট ও রিকনসিলিয়েশন
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          ম্যানুয়াল TrxID অনুমোদন এবং অটোমেটেড গেটওয়ে ট্রানজেকশন
        </p>
      </div>

      {/* Manual Topups Queue */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", border: "1px solid var(--accent-lime)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent-lime)", margin: 0 }}>
            📝 ম্যানুয়াল টপআপ রিকোয়েস্ট কিউ ({manualTopups.filter(m => m.status === "PENDING").length} টি পেন্ডিং)
          </h3>
        </div>

        {manualTopups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
            কোনো ম্যানুয়াল টপআপ রিকোয়েস্ট নেই।
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>গ্রাহক</th>
                  <th>মেথড</th>
                  <th>প্রেরকের নম্বর</th>
                  <th>TrxID</th>
                  <th>পরিমাণ</th>
                  <th>স্ক্রিনশট</th>
                  <th>স্ট্যাটাস</th>
                  <th>সময়</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {manualTopups.map((m) => {
                  const amount = (Number(m.amountPoisha) / 100).toFixed(0);
                  return (
                    <tr key={m.id}>
                      <td>
                        <strong style={{ color: "var(--text-primary)" }}>{m.user?.name || "Customer"}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                          {m.user?.email || m.user?.phone}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ fontWeight: 700 }}>{m.method}</span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{m.senderNumber}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-cyan)" }}>
                        {m.transactionId}
                      </td>
                      <td style={{ fontWeight: 800, color: "var(--accent-lime)" }}>৳ {amount}</td>
                      <td>
                        {m.screenshotUrl ? (
                          <a
                            href={m.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.8rem" }}
                          >
                            🖼️ দেখুন
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${m.status === "APPROVED" ? "badge-lime" : m.status === "REJECTED" ? "badge-red" : "badge-yellow"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {new Date(m.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td>
                        <AdminManualTopupActions
                          topupId={m.id}
                          userName={m.user?.name || "Customer"}
                          amountBdt={amount}
                          status={m.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UddoktaPay Gateway Payments */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "18px" }}>
          ⚡ গেটওয়ে ট্রানজেকশন (UddoktaPay)
        </h3>

        {payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
            কোনো গেটওয়ে পেমেন্ট পাওয়া যায়নি।
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>ইনভয়েস আইডি</th>
                  <th>গ্রাহক</th>
                  <th>মেথড</th>
                  <th>মূল্য (BDT)</th>
                  <th>ফি</th>
                  <th>মোট চার্জ</th>
                  <th>স্ট্যাটাস</th>
                  <th>তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const amount = (Number(p.amountPoisha) / 100).toFixed(2);
                  const fee = (Number(p.feePoisha) / 100).toFixed(2);
                  const charged = (Number(p.chargedPoisha) / 100).toFixed(2);

                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>
                        {p.invoiceId || p.id.slice(0, 8)}
                      </td>
                      <td>{p.user?.name || p.user?.email || "User"}</td>
                      <td>{p.method || p.provider}</td>
                      <td style={{ fontWeight: 700 }}>৳ {amount}</td>
                      <td style={{ color: "var(--text-muted)" }}>৳ {fee}</td>
                      <td style={{ fontWeight: 700, color: "var(--accent-lime)" }}>৳ {charged}</td>
                      <td>
                        <span className={`badge ${p.status === "COMPLETED" ? "badge-lime" : p.status === "FAILED" ? "badge-red" : "badge-yellow"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {new Date(p.createdAt).toLocaleString("bn-BD")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

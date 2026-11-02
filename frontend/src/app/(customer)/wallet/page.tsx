import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import WalletTopupCard from "@/components/dashboard/WalletTopupCard";

export const metadata = {
  title: "আমার ওয়ালেট ও লেনদেন | Topup Center",
};

export default async function WalletPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let balancePoisha = 0n;
  let transactions: any[] = [];

  if (userId) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { walletBalancePoisha: true },
      });
      if (user) {
        balancePoisha = user.walletBalancePoisha;
      }

      transactions = await db.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    } catch (e) {
      console.error("Wallet page error:", e);
    }
  }

  const currentBalanceBdt = (Number(balancePoisha) / 100).toFixed(2);

  // Type labels
  const txnTypeLabels: Record<string, { label: string; isCredit: boolean; color: string }> = {
    TOPUP: { label: "ওয়ালেট রিচার্জ", isCredit: true, color: "var(--accent-lime)" },
    ORDER_PAYMENT: { label: "অর্ডার পেমেন্ট", isCredit: false, color: "#EF4444" },
    REFUND: { label: "অর্ডার রিফান্ড", isCredit: true, color: "var(--accent-cyan)" },
    ADMIN_ADJUST: { label: "অ্যাডমিন অ্যাডজাস্টমেন্ট", isCredit: true, color: "var(--accent-magenta)" },
    CASHBACK: { label: "ক্যাশব্যাক বোনাস", isCredit: true, color: "var(--accent-lime)" },
    REFERRAL: { label: "রেফারেল কমিশন", isCredit: true, color: "var(--accent-lime)" },
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          ওয়ালেট ও ব্যালেন্স
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          ইনস্ট্যান্ট রিচার্জ করুন অথবা ম্যানুয়াল TrxID দিয়ে ব্যালেন্স যোগ করুন
        </p>
      </div>

      {/* Topup Card Component */}
      <div style={{ marginBottom: "36px" }}>
        <WalletTopupCard currentBalanceBdt={currentBalanceBdt} />
      </div>

      {/* Transaction History Ledger */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            লেনদেন হিস্টোরি (লেজার)
          </h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            সর্বশেষ ৩০টি লেনদেন
          </span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            এখনো কোনো লেনদেন সম্পন্ন হয়নি।
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th>পরিমাণ</th>
                  <th>ব্যালেন্স (পরে)</th>
                  <th>নোট / রেফারেন্স</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const info = txnTypeLabels[tx.type] || {
                    label: tx.type,
                    isCredit: tx.amountPoisha > 0n,
                    color: "var(--text-primary)",
                  };
                  const amountBdt = (Number(tx.amountPoisha) / 100).toFixed(2);
                  const afterBdt = (Number(tx.balanceAfterPoisha) / 100).toFixed(2);

                  return (
                    <tr key={tx.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {new Date(tx.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td>
                        <strong style={{ color: info.color }}>{info.label}</strong>
                        {tx.referenceType && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                            {tx.referenceType}: {tx.referenceId?.slice(0, 10)}
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 800, color: info.isCredit ? "var(--accent-lime)" : "#EF4444" }}>
                        {info.isCredit ? "+" : "-"} ৳ {amountBdt}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                        ৳ {afterBdt}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {tx.note || "—"}
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

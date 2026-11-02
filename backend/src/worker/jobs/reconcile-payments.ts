import { db } from "../../lib/db";
import { verifyPayment } from "../../lib/payments/uddoktapay";
import { processVerifiedPayment } from "../../services/payment-service";

export async function processReconcilePaymentsJob(): Promise<{ checked: number; reconciled: number }> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find payments that have invoiceId and are still INITIATED or PENDING
  const stuckPayments = await db.payment.findMany({
    where: {
      status: { in: ["INITIATED", "PENDING"] },
      invoiceId: { not: null },
      createdAt: {
        gte: twentyFourHoursAgo,
        lte: tenMinutesAgo,
      },
    },
    take: 50,
  });

  let reconciledCount = 0;

  for (const payment of stuckPayments) {
    if (!payment.invoiceId) continue;

    try {
      const verified = await verifyPayment(payment.invoiceId);

      if (verified.status && verified.payment_status === "COMPLETED") {
        await processVerifiedPayment({
          paymentId: payment.id,
          verified,
        });
        reconciledCount++;
        console.log(`[Worker:Reconcile] Successfully reconciled payment: ${payment.id} (Invoice: ${payment.invoiceId})`);
      } else if (verified.payment_status === "CANCELLED" || verified.payment_status === "FAILED") {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: verified.payment_status === "CANCELLED" ? "CANCELLED" : "FAILED" },
        });
      }
    } catch (err) {
      console.error(`[Worker:Reconcile] Error checking invoice ${payment.invoiceId}:`, err);
    }
  }

  return { checked: stuckPayments.length, reconciled: reconciledCount };
}

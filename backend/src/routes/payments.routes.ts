import { Router, Request, Response } from "express";
import { handlePaymentWebhook } from "@/services/payment-service";
import { verifyPayment } from "@/lib/payments/uddoktapay";
import { env } from "@/lib/env";

const router = Router();

// GET /api/payments/uddoktapay/callback
router.get("/payments/uddoktapay/callback", async (req: Request, res: Response) => {
  const invoiceId = (req.query.invoice_id as string) || "";

  if (!invoiceId) {
    return res.redirect(`${env.APP_URL}/wallet?error=missing_invoice`);
  }

  try {
    const verified = await verifyPayment(invoiceId);

    if (verified.status && verified.payment_status === "COMPLETED") {
      await handlePaymentWebhook({
        apiKey: env.UDDOKTAPAY_API_KEY,
        invoiceId,
        rawPayload: verified as any,
      });

      const orderId = verified.metadata?.orderId;
      if (orderId) {
        return res.redirect(`${env.APP_URL}/orders?success=payment_complete`);
      }
      return res.redirect(`${env.APP_URL}/wallet?success=topup_complete`);
    } else {
      const statusStr = verified.payment_status ? verified.payment_status.toLowerCase() : "failed";
      return res.redirect(`${env.APP_URL}/wallet?error=payment_${statusStr}`);
    }
  } catch (error: any) {
    console.error("Callback verification failed:", error);
    return res.redirect(`${env.APP_URL}/wallet?error=verification_failed`);
  }
});

// POST /api/payments/uddoktapay/webhook
router.post("/payments/uddoktapay/webhook", async (req: Request, res: Response) => {
  const apiKey = (req.headers["rt-uddoktapay-api-key"] as string) || "";
  const body = req.body || {};
  const invoiceId = (body.invoice_id as string) || "";

  if (!invoiceId) {
    return res.status(400).json({ received: false });
  }

  try {
    await handlePaymentWebhook({
      apiKey,
      invoiceId,
      rawPayload: body,
    });
  } catch (error: any) {
    if (error.message === "INVALID_API_KEY") {
      return res.status(401).json({ received: false });
    }
    console.error("Webhook processing error:", error.message);
  }

  // Always return 200 to acknowledge webhook
  return res.json({ received: true });
});

export default router;

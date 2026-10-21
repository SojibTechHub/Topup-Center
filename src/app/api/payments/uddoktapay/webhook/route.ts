import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/server/services/payment-service";

// UddoktaPay webhook - must always return 200 OK
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("RT-UDDOKTAPAY-API-KEY") || "";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const invoiceId = (body.invoice_id as string) || "";
  if (!invoiceId) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    await handlePaymentWebhook({
      apiKey,
      invoiceId,
      rawPayload: body,
    });
  } catch (error: any) {
    // Log but return 200 to prevent UddoktaPay retries for auth errors
    if (error.message === "INVALID_API_KEY") {
      return NextResponse.json({ received: false }, { status: 401 });
    }
    console.error("Webhook processing error:", error.message);
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}

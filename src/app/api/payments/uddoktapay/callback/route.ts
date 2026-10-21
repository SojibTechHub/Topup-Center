import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "@/server/services/payment-service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const paymentId = searchParams.get("paymentId");
  const invoiceId = searchParams.get("invoice_id");

  if (!paymentId || !invoiceId) {
    return NextResponse.redirect(
      new URL("/wallet?error=invalid_callback", req.url)
    );
  }

  try {
    const result = await handlePaymentCallback({ paymentId, invoiceId });

    if (result.success) {
      return NextResponse.redirect(
        new URL("/wallet?topup=success", req.url)
      );
    } else {
      const statusParam = "status" in result ? result.status : "failed";
      return NextResponse.redirect(
        new URL(`/wallet?topup=failed&status=${statusParam}`, req.url)
      );
    }
  } catch (error: any) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      new URL("/wallet?topup=error", req.url)
    );
  }
}

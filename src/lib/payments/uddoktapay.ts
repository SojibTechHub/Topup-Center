import { env } from "../env";

const UDDOKTAPAY_BASE_URL = env.UDDOKTAPAY_BASE_URL;
const API_KEY = env.UDDOKTAPAY_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateChargeParams {
  fullName: string;
  email: string;
  amount: number; // In BDT (float)
  metadata: Record<string, string>;
  redirectUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

interface CreateChargeResponse {
  status: boolean;
  payment_url: string;
  err?: string;
}

interface VerifyPaymentResponse {
  status: boolean;
  payment_status?: "COMPLETED" | "PENDING" | "CANCELLED" | "FAILED";
  full_name?: string;
  email?: string;
  amount?: number;
  fee?: number;
  charged_amount?: number;
  invoice_id?: string;
  transaction_id?: string;
  payment_method?: string;
  sender_number?: string;
  metadata?: Record<string, string>;
  err?: string;
}

// ─── UddoktaPay API ───────────────────────────────────────────────────────────

async function uddoktaRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${UDDOKTAPAY_BASE_URL}/api/${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `UddoktaPay API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function createCharge(
  params: CreateChargeParams
): Promise<CreateChargeResponse> {
  return uddoktaRequest<CreateChargeResponse>("checkout-v2", {
    full_name: params.fullName,
    email: params.email,
    amount: params.amount.toFixed(2),
    metadata: params.metadata,
    redirect_url: params.redirectUrl,
    cancel_url: params.cancelUrl,
    webhook_url: params.webhookUrl,
  });
}

export async function verifyPayment(
  invoiceId: string
): Promise<VerifyPaymentResponse> {
  return uddoktaRequest<VerifyPaymentResponse>("verify-payment", {
    invoice_id: invoiceId,
  });
}

// ─── Webhook validation ───────────────────────────────────────────────────────

export function validateWebhookApiKey(headerKey: string): boolean {
  return headerKey === API_KEY;
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

export function poishaToBdt(poisha: bigint): number {
  return Number(poisha) / 100;
}

export function bdtToPoisha(bdt: number): bigint {
  return BigInt(Math.round(bdt * 100));
}

import { env } from "./env";

const TELEGRAM_API = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(
  message: string,
  chatId?: string
): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;

  const targetChatId = chatId || env.TELEGRAM_ADMIN_CHAT_ID;
  if (!targetChatId) return false;

  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

// ─── Alert templates ──────────────────────────────────────────────────────────

export async function alertNewOrder(order: {
  code: string;
  gameName: string;
  packageName: string;
  pricePoisha: bigint;
  playerFields: Record<string, string>;
}) {
  const amount = (Number(order.pricePoisha) / 100).toFixed(2);
  const message = [
    "🎮 <b>নতুন অর্ডার!</b>",
    "",
    `📦 <b>অর্ডার:</b> ${order.code}`,
    `🎯 <b>গেম:</b> ${order.gameName}`,
    `💎 <b>প্যাকেজ:</b> ${order.packageName}`,
    `💰 <b>মূল্য:</b> ৳${amount}`,
    `👤 <b>Player:</b> ${JSON.stringify(order.playerFields)}`,
    "",
    `🔗 Admin: ${env.APP_URL}/admin/orders`,
  ].join("\n");

  return sendTelegramMessage(message);
}

export async function alertOrderCompleted(order: {
  code: string;
  gameName: string;
}) {
  const message = [
    "✅ <b>অর্ডার সম্পন্ন</b>",
    `📦 ${order.code} — ${order.gameName}`,
  ].join("\n");

  return sendTelegramMessage(message);
}

export async function alertManualTopupRequest(topup: {
  id: string;
  userName: string;
  provider: string;
  trxId: string;
  amountPoisha: bigint;
}) {
  const amount = (Number(topup.amountPoisha) / 100).toFixed(2);
  const message = [
    "💳 <b>ম্যানুয়াল টপআপ রিকোয়েস্ট</b>",
    "",
    `👤 <b>User:</b> ${topup.userName}`,
    `🏦 <b>মাধ্যম:</b> ${topup.provider}`,
    `🔑 <b>TrxID:</b> ${topup.trxId}`,
    `💰 <b>পরিমাণ:</b> ৳${amount}`,
    "",
    `🔗 Admin: ${env.APP_URL}/admin/payments/manual-topup`,
  ].join("\n");

  return sendTelegramMessage(message);
}

export async function alertSystemError(error: {
  context: string;
  message: string;
}) {
  const message = [
    "🚨 <b>System Error</b>",
    `Context: ${error.context}`,
    `Error: ${error.message}`,
  ].join("\n");

  return sendTelegramMessage(message);
}

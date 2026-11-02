import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn("Resend API key not configured, skipping email");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #070A12;
  color: #F8FAFC;
`;

const buttonStyle = `
  background: linear-gradient(135deg, #22D3EE, #A3E635);
  color: #070A12;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
`;

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="${baseStyle}">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #22D3EE; font-size: 28px; margin: 0;">
            🎮 Topup Center
          </h1>
        </div>
        ${content}
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #1E2940; text-align: center; color: #64748B; font-size: 14px;">
          <p>Topup Center &mdash; বাংলাদেশের গেমারদের বিশ্বস্ত টপআপ মার্কেটপ্লেস</p>
          <p>
            <a href="${env.APP_URL}/terms" style="color: #22D3EE;">Terms</a> &bull;
            <a href="${env.APP_URL}/privacy" style="color: #22D3EE;">Privacy</a> &bull;
            <a href="${env.APP_URL}/support" style="color: #22D3EE;">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getVerifyEmailHtml(params: {
  name: string;
  verifyUrl: string;
}): string {
  return emailWrapper(`
    <div style="background: #0F172A; border-radius: 12px; padding: 32px; border: 1px solid #1E2940;">
      <h2 style="color: #F8FAFC; margin-top: 0;">ইমেইল ভেরিফাই করুন</h2>
      <p style="color: #94A3B8;">হ্যালো ${params.name},</p>
      <p style="color: #94A3B8;">Topup Center-এ আপনাকে স্বাগতম! আপনার অ্যাকাউন্ট সক্রিয় করতে নিচের বোতামে ক্লিক করুন।</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${params.verifyUrl}" style="${buttonStyle}">
          ইমেইল ভেরিফাই করুন
        </a>
      </div>
      <p style="color: #64748B; font-size: 14px;">এই লিংক ২৪ ঘণ্টা বৈধ। যদি আপনি এই অ্যাকাউন্ট তৈরি না করে থাকেন, এই ইমেইল উপেক্ষা করুন।</p>
    </div>
  `);
}

export function getPasswordResetHtml(params: {
  name: string;
  resetUrl: string;
}): string {
  return emailWrapper(`
    <div style="background: #0F172A; border-radius: 12px; padding: 32px; border: 1px solid #1E2940;">
      <h2 style="color: #F8FAFC; margin-top: 0;">পাসওয়ার্ড রিসেট</h2>
      <p style="color: #94A3B8;">হ্যালো ${params.name},</p>
      <p style="color: #94A3B8;">আপনার পাসওয়ার্ড রিসেটের জন্য নিচের বোতামে ক্লিক করুন।</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${params.resetUrl}" style="${buttonStyle}">
          পাসওয়ার্ড রিসেট করুন
        </a>
      </div>
      <p style="color: #64748B; font-size: 14px;">এই লিংক ১ ঘণ্টা বৈধ। যদি আপনি পাসওয়ার্ড রিসেট না করে থাকেন, আপনার অ্যাকাউন্ট সুরক্ষিত আছে।</p>
    </div>
  `);
}

export function getOrderStatusHtml(params: {
  name: string;
  orderCode: string;
  status: string;
  gameName: string;
  packageName: string;
  orderUrl: string;
}): string {
  const statusEmoji: Record<string, string> = {
    COMPLETED: "✅",
    FAILED: "❌",
    PROCESSING: "⚡",
    REFUNDED: "💸",
  };

  return emailWrapper(`
    <div style="background: #0F172A; border-radius: 12px; padding: 32px; border: 1px solid #1E2940;">
      <h2 style="color: #F8FAFC; margin-top: 0;">
        ${statusEmoji[params.status] || "📦"} অর্ডার আপডেট
      </h2>
      <p style="color: #94A3B8;">হ্যালো ${params.name},</p>
      <div style="background: #070A12; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 4px 0; color: #94A3B8;">অর্ডার: <strong style="color: #22D3EE;">${params.orderCode}</strong></p>
        <p style="margin: 4px 0; color: #94A3B8;">গেম: <strong style="color: #F8FAFC;">${params.gameName}</strong></p>
        <p style="margin: 4px 0; color: #94A3B8;">প্যাকেজ: <strong style="color: #F8FAFC;">${params.packageName}</strong></p>
        <p style="margin: 4px 0; color: #94A3B8;">স্ট্যাটাস: <strong style="color: #A3E635;">${params.status}</strong></p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${params.orderUrl}" style="${buttonStyle}">
          অর্ডার দেখুন
        </a>
      </div>
    </div>
  `);
}

export function getWalletCreditHtml(params: {
  name: string;
  amountPoisha: number;
  balancePoisha: number;
  dashboardUrl: string;
}): string {
  const amount = (params.amountPoisha / 100).toFixed(2);
  const balance = (params.balancePoisha / 100).toFixed(2);

  return emailWrapper(`
    <div style="background: #0F172A; border-radius: 12px; padding: 32px; border: 1px solid #1E2940;">
      <h2 style="color: #F8FAFC; margin-top: 0;">💰 ওয়ালেটে টাকা যোগ হয়েছে</h2>
      <p style="color: #94A3B8;">হ্যালো ${params.name},</p>
      <div style="background: #070A12; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="color: #64748B; margin: 4px 0; font-size: 14px;">যোগ হয়েছে</p>
        <p style="color: #A3E635; font-size: 32px; font-weight: bold; margin: 4px 0;">৳${amount}</p>
        <p style="color: #64748B; margin: 4px 0; font-size: 14px;">বর্তমান ব্যালেন্স: ৳${balance}</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${params.dashboardUrl}" style="${buttonStyle}">
          ড্যাশবোর্ড দেখুন
        </a>
      </div>
    </div>
  `);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name = "Customer"
): Promise<boolean> {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "আপনার পাসওয়ার্ড রিসেট লিংক - Topup Center",
    html: getPasswordResetHtml({ name, resetUrl }),
  });
}

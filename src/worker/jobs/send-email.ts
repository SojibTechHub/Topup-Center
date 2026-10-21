import { sendEmail } from "../../lib/mail";

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function processSendEmailJob(payload: SendEmailPayload): Promise<boolean> {
  if (!payload || !payload.to || !payload.subject || !payload.html) {
    throw new Error("Invalid email payload: missing 'to', 'subject', or 'html'");
  }

  const success = await sendEmail({
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (!success) {
    throw new Error(`Failed to deliver email to ${payload.to}`);
  }

  return true;
}

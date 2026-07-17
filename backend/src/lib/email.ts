import { db } from "../db/index.js";
import { emailSendQueue } from "../db/schema.js";

// Transactional email (architecture §1.1): any SMTP-compatible provider sits
// behind this interface. No provider is wired in this build phase, so sends are
// enqueued to `email_send_queue` for a later send job and never block the
// calling business operation (architecture §4.5 retry safety).
export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<{ ok: boolean; error?: string }>;
}

export const emailProvider: EmailProvider = {
  async send() {
    return { ok: false, error: "no email provider configured" };
  },
};

export async function enqueueEmail(to: string, subject: string, body: string): Promise<void> {
  await db.insert(emailSendQueue).values({ toEmail: to, subject, body, status: "pending" });
}

// Best-effort send. On provider failure the message is enqueued for retry
// instead of throwing, so a flaky email provider can never roll back the
// business transaction that triggered it.
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const result = await emailProvider.send(to, subject, body);
  if (result.ok) return;
  await enqueueEmail(to, subject, body);
}

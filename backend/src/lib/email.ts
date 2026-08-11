import { db } from "../db/index.js";
import { emailSendQueue } from "../db/schema.js";
import { config } from "./config.js";

// Transactional email (architecture §1.1): The active implementation uses 
// EmailJS REST API to bypass SMTP restrictions on serverless platforms.

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<{ ok: boolean; error?: string }>;
}

export const emailProvider: EmailProvider = {
  async send(to, subject, body) {
    try {
      const { serviceId, templateId, publicKey, privateKey } = config.emailJS;

      const payload = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to,
          subject,
          body,
        },
      };

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS API Error: ${response.status} ${errorText}`);
      }

      return { ok: true };
    } catch (err) {
      console.error("EMAILJS ERROR:", err);

      return {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      };
    }
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
  console.error(`[email] send failed to ${to}: ${result.error} — enqueued for retry`);
  await enqueueEmail(to, subject, body);
}

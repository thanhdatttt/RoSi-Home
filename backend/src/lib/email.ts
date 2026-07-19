import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { db } from "../db/index.js";
import { emailSendQueue } from "../db/schema.js";
import { config } from "./config.js";

// Transactional email (architecture §1.1): any SMTP-compatible provider sits
// behind this interface. The active implementation uses Gmail SMTP via nodemailer
// (configured through EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASSWORD/EMAIL_FROM).

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const smtp = config.emailSmtp;
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });
  }
  return transporter;
}

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<{ ok: boolean; error?: string }>;
}

export const emailProvider: EmailProvider = {
  async send(to, subject, body) {
    try {
      await getTransporter().sendMail({
        from: config.emailSmtp.from,
        to,
        subject,
        text: body,
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "unknown" };
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

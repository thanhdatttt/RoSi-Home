# Replace SMTP with Resend

## Summary

Replace the current Gmail SMTP / nodemailer email provider with [Resend](https://resend.com) for all transactional emails.

## Motivation

- **Reliability**: Gmail SMTP with App Passwords is fragile — Google may throttle or revoke app passwords without warning. Resend is a purpose-built transactional email API.
- **Simplicity**: Resend uses a simple REST API (one `POST` call). No SMTP host/port/secure/auth configuration needed — just an API key and a "from" address.
- **Deliverability**: Resend handles SPF/DKIM/DMARC on its infrastructure. Gmail SMTP sends via Google's shared pool, which can land in spam.
- **Observability**: Resend provides a dashboard with delivery logs, open rates, and bounce tracking — none of which Gmail SMTP offers.

## Scope

**In scope:**
- Replace `nodemailer` SMTP transporter with Resend SDK (`resend` npm package)
- Update `email.ts` to use Resend's `emails.send()` API
- Update `config.ts` to read `RESEND_API_KEY` and `EMAIL_FROM` instead of SMTP host/port/user/password
- Update `.env` and `.env.example` with Resend config
- Remove `nodemailer` and `@types/nodemailer` dependencies

**Out of scope:**
- Email templates / HTML emails (currently plaintext only — no change)
- The `email_send_queue` table and retry logic (already a dead-letter queue with no consumer)
- Other notification channels (Expo push, etc.)

## Call sites (unchanged)

1. `src/modules/auth/service.ts:114` — forgot-password email
2. `src/modules/tenants/service.ts:205` — tenant account provisioning email

Both call `sendEmail(to, subject, body)` which is the only public API. The call sites need no changes.

## Risk

Low. The `sendEmail` contract (`string → void`, never throws) is preserved. The email queue fallback is also preserved.

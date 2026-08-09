# Tasks: Replace SMTP with Resend

## Task 1: Install Resend, remove nodemailer

- [x] `npm install resend`
- [x] `npm uninstall nodemailer @types/nodemailer`

## Task 2: Update `config.ts`

- [x] Remove `emailSmtp` getter
- [x] Remove `emailProviderApiKey` getter
- [x] Add `resendApiKey` getter (reads `RESEND_API_KEY`, required)
- [x] Add `emailFrom` getter (reads `EMAIL_FROM`, default `"RosiHome <noreply@rosihome.app>"`)

## Task 3: Rewrite `email.ts`

- [x] Import `Resend` from `resend`
- [x] Replace nodemailer transporter with Resend singleton
- [x] Update `emailProvider.send()` to call `resend.emails.send()` with `{ from, to, subject, text }`
- [x] Keep `enqueueEmail` and `sendEmail` unchanged

## Task 4: Update `.env`

- [x] Replace SMTP config block with `RESEND_API_KEY` + `EMAIL_FROM`

## Task 5: Update `.env.example`

- [x] Replace SMTP config block with Resend template

## Task 6: Verify

- [x] `npm run typecheck` — passed
- [x] `npm run test` — 238/238 passed

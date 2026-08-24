# Infrastructure & CI/CD – RosiHome

**Setup order:** Supabase DB → Supabase Storage → EmailJS → CI → CD

## 1. Infrastructure Overview

| Component | Configuration |
|---|---|
| Hosting | Render Web Service |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage |
| Repo | GitHub – RosiHome |
| Provisioning | Render Dashboard |
| Production URL | https://rosi-home.onrender.com |
| Health check | https://rosi-home.onrender.com/health |

## 2. Supabase Database

1. Create a Supabase project (choose a region close to users, e.g. Singapore), and securely save the DB password.
2. Go to **Connect** → copy the PostgreSQL connection string → use it as `DATABASE_URL`.
   - Prefer a direct connection; if only IPv4 is supported → use the **Session Pooler** connection string instead.
   - ⚠️ Do not use the frontend Supabase URL/anon key as `DATABASE_URL`.
3. Run the migration (Drizzle) with the production `DATABASE_URL` loaded from `.env`:
   ```bash
   cd backend
   npm install
   npm run db:migrate
   ```
   - Render does **not** run migrations automatically during build → this step must be run manually before testing data-dependent APIs.
   - ⚠️ Do not use `TEST_DATABASE_URL`, `db:push`, or `db:seed` for production without explicit approval.
4. Verify: check the tables in the **Table Editor**/**SQL Editor** and confirm the migration was applied correctly before connecting Render.

## 3. Supabase Storage

1. Create two **private** buckets: `maintenance-photos` and `payment-proofs`.
   - The backend returns **signed URLs** for authorized access.
2. Get `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (service role key) from project Settings.
   - ⚠️ `SUPABASE_SERVICE_KEY` is a server-side secret: keep it only in Render Environment — never put it in the mobile app, commit it to Git, or expose it in screenshots.
3. Verify: bucket names match the code exactly, test an image upload + signed-URL read, check Storage logs if uploads fail.

## 4. EmailJS

1. Sign in to EmailJS → create/connect an email service → create a template with fields: `to`, `subject`, `from`, `body`.
   - The backend currently sends only `to`, `subject`, `body` → **From** uses the verified sender configured in the EmailJS service (unless the backend is updated to send a `from` parameter).
2. Map EmailJS values → Render environment variables:
   ```
   email_service_id  → EMAILJS_SERVICE_ID
   email_template_id → EMAILJS_TEMPLATE_ID
   email_public_key  → EMAILJS_PUBLIC_KEY
   private key       → EMAILJS_PRIVATE_KEY
   ```
3. Send a test email and check recipient/subject/sender/body. Keep `EMAILJS_PRIVATE_KEY` secret.

## 5. CI (GitHub Actions)

File: `.github/workflows/ci.yml` — runs on PRs and pushes to `main`.

Steps: install dependencies → spin up a temporary PostgreSQL service → run migrations against the **test database** → run typecheck, unit tests, integration tests, API tests, and the production build.

⚠️ CI uses a separate test database — **never** point CI at the Supabase production database.

## 6. CD (Render)

### 6.1. Web Service Configuration

1. Create a Web Service on Render, connect the RosiHome repo, branch `main`.
2. Configure:

   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Auto-Deploy | After CI check pass |
   | Notifications | All notifications |

3. In the **Environment** tab → **Import from .env** → paste the production variables (sections 2–5).
4. Save & deploy.

### 6.2. Deployment Notifications

Enable **Email notifications** at the **All notifications** level in service/workspace settings, and confirm the notification email is verified. Covers: failed builds/deploys and successful deploys.

## 7. Environment Variables & Security

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Used to sign JWTs |
| `NODE_ENV` | `production` |
| `APP_PUBLIC_URL` | Public app URL |
| `JWT_EXPIRY_SECONDS` | Access-token lifetime (default `900`) |
| `JWT_REFRESH_EXPIRY_SECONDS` | Refresh-token lifetime (default `604800`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Server-side Supabase service key |
| `EMAILJS_SERVICE_ID` / `TEMPLATE_ID` / `PUBLIC_KEY` / `PRIVATE_KEY` | EmailJS configuration |

⚠️ Do not commit the real `.env` file, and do not expose secret values in screenshots or printed docs — show variable names only.

## 8. Post-Deployment Verification & Rollback

1. Open `/health` → should return `200` and:
   ```json
   { "status": "ok", "service": "rosihome-backend" }
   ```
2. Open Swagger: `/api/v1/api-docs`.
3. Check Render Runtime Logs (build, env, database, Supabase, EmailJS).
4. Confirm the production migration ran correctly + send a test email.

**If deployment fails:** check **Deploys/Logs** → redeploy the last stable commit.
⚠️ Rolling back application code does **not** automatically roll back database migrations.
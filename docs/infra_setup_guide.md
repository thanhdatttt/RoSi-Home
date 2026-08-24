# Infrastructure Setup & CI/CD Guide - RosiHome
## 1. Infrastructure overview
| Component | Configuration |
|---|---|
| Hosting | Render Web Service |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage |
| Repo | GitHub – RosiHome |
| Provisioning | Render Dashboard |
| Production URL | https://rosi-home.onrender.com |
| Health check | https://rosi-home.onrender.com/health |

The setup order is: **Supabase Database -> Supabase Storage -> EmailJS -> Expo -> CI -> CD**.
## 2. Supabase Database setup
Supabase provides a PostgreSQL database for the backend.
### 2.1. Create the Supabase project
1. Open [Supabase](https://supabase.com/) and create a new project.
2. Select the team organization and a region close to the users, such as Singapore.
3. Set and securely save the database password.
4. Wait until the project is ready.
### 2.2. Get the production connection string
1. Open the Supabase project and click **Connect**.
2. Copy the PostgreSQL connection string.
3. Use it as the backend `DATABASE_URL` value.

For a long-running Render Web Service, use the direct connection when the network supports it. If an IPv4-only connection is required, use the Supabase Session Pooler connection string instead. Do not use a frontend Supabase URL or anon key as `DATABASE_URL`.

```text
DATABASE_URL=<Supabase PostgreSQL connection string>
```
### 2.3. Apply the Drizzle schema migration
Migration files are stored in `backend/src/db/migrations`. With the production `DATABASE_URL` loaded from the protected `.env` file, run:

```bash
cd backend
npm install
npm run db:migrate
```

The command applies pending migrations to the Supabase database. The Render build command does not run production migrations, so run this step before testing data-dependent APIs. Do not use `TEST_DATABASE_URL`, `npm run db:push`, or `npm run db:seed` for production without explicit approval.
### 2.4. Verify the database
- Open Supabase **Table Editor** or **SQL Editor** and confirm that the application tables exist.
- Check the migration result in the database before connecting Render.
- Keep the database password and `DATABASE_URL` private.
## 3. Supabase Storage setup
The backend stores maintenance photos and payment-proof files in private Supabase Storage buckets.
### 3.1. Create the buckets
1. In the Supabase project, open **Storage**.
2. Select **New Bucket**.
3. Create a bucket named `maintenance-photos`.
4. Create a second bucket named `payment-proofs`.
5. Keep both buckets **private**. The backend returns signed URLs for authorized file access.
### 3.2. Configure the backend keys
Get the project URL and server-side service role key from the Supabase project settings, then configure:

```text
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<server-side service role key>
```

`SUPABASE_SERVICE_KEY` is a server secret. It must only be stored in the backend/Render Environment and must never be placed in the mobile app, committed to Git, or shown in printed screenshots.
### 3.3. Verify Storage
- Confirm both bucket names exactly match the backend code.
- Test an image upload and signed-URL read through the backend API.
- Check Supabase Storage logs if an upload fails.
## 4. EmailJS setup
1. Open the [EmailJS website](https://www.emailjs.com/) and sign in.
2. Create or connect an email service.
3. Create an email template.
4. Format the dynamic template fields as:

   ```text
   To:      {{to}}
   Subject: {{subject}}
   From:    {{from}}
   Body:    {{body}}
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
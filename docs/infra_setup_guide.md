# Infrastructure Setup & CI/CD Guide - RosiHome

## 1. Infrastructure overview

| Component | Configuration |
|---|---|
| Hosting | Render Web Service |
| Database | PostgreSQL through Supabase |
| Storage | Supabase Storage |
| Source repository | GitHub repository for RosiHome |
| Provisioning method | Render Dashboard and the repository `render.yaml` Blueprint |
| Production URL | <https://rosi-home.onrender.com> |
| Health endpoint | <https://rosi-home.onrender.com/health> |

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

   The current backend sends `to`, `subject`, and `body`. Therefore, use the verified sender configured in the EmailJS service for **From**, unless the backend is updated to send a `from` parameter.

5. Copy the EmailJS values and map them to Render Environment variables:

   ```text
   email_service_id  -> EMAILJS_SERVICE_ID
   email_template_id -> EMAILJS_TEMPLATE_ID
   email_public_key  -> EMAILJS_PUBLIC_KEY
   private key       -> EMAILJS_PRIVATE_KEY
   ```

6. Send a test email and verify the recipient, subject, sender, and body.
7. Keep `EMAILJS_PRIVATE_KEY` secret.

## 5. Expo Push Notifications setup

The backend sends push notifications through Expo Push Service.

1. Confirm the mobile app uses the correct Expo project.
2. If the Expo project enables **Enhanced Security for Push Notifications**, create/copy its access token.
3. Add the token to the backend environment:

   ```text
   EXPO_ACCESS_TOKEN=<optional Expo access token>
   ```

The token is optional when enhanced security is not enabled.

## 6. CI setup

The GitHub Actions workflow is `.github/workflows/ci.yml`.

It runs for pull requests and pushes to `main`, and checks backend changes by:

1. Installing dependencies.
2. Starting a temporary PostgreSQL service.
3. Running database migrations against the test database.
4. Running typecheck, unit tests, integration tests, API tests, and the production build.

CI uses a separate test database. Never point CI at the Supabase production database.

## 7. CD setup on Render

### 7.1. Create and configure the Web Service

1. Open Render and create a project or Web Service.
2. Connect the service to the RosiHome GitHub repository.
3. Select branch `main`.
4. Configure:

   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Auto-Deploy | `After CI check pass` |
   | Service Notifications | `All notifications` |

5. In the **Environment** tab, select **Import from .env** and paste the protected production variables from Sections 2-5.
6. Save the configuration and deploy.

Because the Root Directory is `backend`, Render executes the commands from the directory containing `package.json`.

The repository also contains `render.yaml` as a Blueprint reference. If the Blueprint is used to recreate the service, keep its auto-deploy trigger aligned with the Dashboard setting: `checksPass` means **After CI Checks Pass**.

### 7.2. Deployment script reference

Render is a PaaS, so a separate shell script is not required. The deployment script is represented by the configured commands:

```bash
cd backend
npm install
npm run build
npm start
```

The `cd backend` line is only needed when reproducing the process locally. Render already starts from `backend`. `npm run build` creates the TypeScript output in `dist`, and `npm start` runs `node dist/server.js`.

### 7.3. Render deployment notifications

In Render Dashboard, open the service/workspace notification settings, choose **Email**, and set the notification level to **All notifications**. Confirm that the notification email address is verified. This should cover failed builds/deploys and successful deploys.

## 8. Environment and security rules

Configure these application variables in Render:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `NODE_ENV` | Set to `production` |
| `APP_PUBLIC_URL` | Public application URL |
| `JWT_EXPIRY_SECONDS` | Access-token lifetime; default `900` |
| `JWT_REFRESH_EXPIRY_SECONDS` | Refresh-token lifetime; default `604800` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Server-side Supabase service key |
| `EMAILJS_SERVICE_ID` | EmailJS service ID |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private key/access token |
| `EXPO_ACCESS_TOKEN` | Optional Expo access token |

Do not commit the real `.env` file or expose secret values in screenshots and printed documents. Show variable names only.

## 9. Post-deployment verification and rollback

After CI passes and Render deploys:

1. Open <https://rosi-home.onrender.com/health>.
2. Confirm HTTP `200` and:

   ```json
   {
     "status": "ok",
     "service": "rosihome-backend"
   }
   ```

3. Open Swagger at <https://rosi-home.onrender.com/api/v1/api-docs>.
4. Check Render Runtime Logs for build, environment, database, Supabase, and EmailJS errors.
5. Verify the production migration and send a test email.


If a deployment fails, inspect **Deploys/Logs** and redeploy the last stable commit. Rolling back application code does not automatically roll back database migrations.

# Infrastructure Setup & CD Guide - RosiHome

## 1. Infrastructure overview

| Component | Configuration |
|---|---|
| Hosting | Render Web Service |
| Database | PostgreSQL through Supabase |
| Storage | Supabase Storage |
| Source repository | GitHub repository for RosiHome |
| Provisioning method | Manual configuration through Render Dashboard |
| Infrastructure as Code | `render.yaml` |
| Production URL | <https://rosi-home.onrender.com> |
| Health endpoint | <https://rosi-home.onrender.com/health> |

## 2. Render Web Service setup

1. Open Render and create a project or Web Service. The repository also contains a `render.yaml` Blueprint with the service root, build command, start command, and health check already configured.
2. Connect the service to the RosiHome GitHub repository.
3. Select branch `main`.
4. Configure the service as follows:

   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Build Command | `npm ci && npm run build` |
   | Start Command | `npm start` |
   | Auto-Deploy | `After CI check pass` |
   | Service Notifications | `All notifications` |

5. Open the **Environment** tab and select **Import from .env**.
6. Paste the production environment variables, save the configuration, and deploy the service.

Because the Root Directory is `backend`, Render executes the commands from the directory containing `package.json`.

## 3. Deployment script reference

Render is a PaaS, so the project does not need a separate shell script. The deployment script is represented by the commands configured in the dashboard:

```bash
cd backend
npm ci
npm run build
npm start
```

The `cd backend` line is only needed when reproducing the process locally. Render already starts from `backend`. `npm run build` creates the TypeScript output in `dist`, and `npm start` runs `node dist/server.js`.

## 4. Environment configuration

Add the following variables in Render. Do not commit the real `.env` file or expose secret values in screenshots or printed documents.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Production PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `NODE_ENV` | Set to `production` |
| `APP_PUBLIC_URL` | Public application URL |
| `JWT_EXPIRY_SECONDS` | Access-token lifetime; default `900` |
| `JWT_REFRESH_EXPIRY_SECONDS` | Refresh-token lifetime; default `604800` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Server-side Supabase service key |
| `EXPO_ACCESS_TOKEN` | Optional Expo token for enhanced push-notification security |
| `EMAILJS_SERVICE_ID` | EmailJS service ID |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private key/access token |

## 4.1. Deploy notification email

Render's email destination and notification level are workspace/service settings, not Blueprint fields. In Render Dashboard, open **Integrations → Notifications**, choose **Email** as the destination, and set **All notifications**. This sends email for both failed builds/deploys and deploys that successfully go live.

The backend `build` script currently ends with `&& exit 1` to simulate a failed deploy. Remove that suffix from `backend/package.json` after testing.

## 5. Database configuration and migration

The backend uses PostgreSQL with Drizzle ORM. Migration files are stored in `backend/src/db/migrations`.

For a new production database or after adding a migration, run:

```bash
cd backend
npm ci
npm run db:migrate
```

The command reads `DATABASE_URL` and applies pending migrations. The current Render Build Command does not run production migrations, so verify the database schema before testing data-dependent APIs. Do not use `TEST_DATABASE_URL`, `npm run db:push`, or `npm run db:seed` for production without explicit approval.

## 6. Third-party service configuration

### 6.1. Supabase Storage

Configure:

```text
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<server-side service role key>
```

The backend uses the private buckets `maintenance-photos` and `payment-proofs`.

### 6.2. EmailJS

1. Open the [EmailJS website](https://www.emailjs.com/) and sign in.
2. Create or connect an email service.
3. Create an email template.
4. Format the dynamic fields in the template as:

   ```text
   To:      {{to}}
   Subject: {{subject}}
   From:    {{from}}
   Body:    {{body}}
   ```

   The current backend sends `to`, `subject`, and `body`. Therefore, use the verified sender configured in the EmailJS service for **From**, unless the backend is updated to send a `from` parameter.

5. Copy the values from EmailJS and map them to Render Environment variables:

   ```text
   email_service_id  -> EMAILJS_SERVICE_ID
   email_template_id -> EMAILJS_TEMPLATE_ID
   email_public_key  -> EMAILJS_PUBLIC_KEY
   private key       -> EMAILJS_PRIVATE_KEY
   ```

6. Send a test email and verify the recipient, subject, sender, and body.

### 6.3. Expo Push Notifications

`EXPO_ACCESS_TOKEN` is optional. It is required only when the Expo project enables **Enhanced Security for Push Notifications**.

## 7. CI/CD flow and verification

```text
Push or merge to main
        -> GitHub Actions CI passes
        -> Render npm ci && npm run build
        -> Render npm start
        -> Verify health, API, logs, and notifications
```

After deployment:

1. Open <https://rosi-home.onrender.com/health>.
2. Confirm HTTP `200` and the response:

   ```json
   {
     "status": "ok",
     "service": "rosihome-backend"
   }
   ```

3. Open Swagger at <https://rosi-home.onrender.com/api/v1/api-docs>.
4. Check Render Runtime Logs for build, environment, database, Supabase, and EmailJS errors.
5. Verify the production database migration and send a test email.

The `/health` endpoint currently confirms that the Express process is running; it does not test the database or third-party services.

If a deployment fails, inspect **Deploys/Logs** and redeploy the last stable commit. Rolling back application code does not automatically roll back database migrations.

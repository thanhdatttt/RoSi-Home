# Infrastructure Initialization & Configuration Script — RoSi-Home

## 1. Infrastructure Platform
- **Provider**: Render (render.com)
- **Resource type**: Web Service (runs the Node.js backend)
- **Database**: Supabase
- **Provisioning method**: manual configuration via the Render Dashboard (no Infrastructure as Code)

## 2. Infrastructure Setup Steps

### Step 1 — Create the Web Service
1. Log in to render.com using the team's GitHub account.
2. Select **New +** → **Web Service**.
3. Connect to the `RoSi-Home` GitHub repository and grant access.
4. Select the deployment branch: `main`.
5. Set Root Directory: `backend` (since the backend lives in a subfolder of the monorepo).

### Step 2 — Configure Build & Start
| Setting | Value |
|---|---|
| Environment | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Region | Singapore (closest to Vietnam) |
| Instance Type | Free / Starter (depending on the team's chosen plan) |
| Auto-Deploy | On — automatically deploys on every new commit to `main` |

### Step 3 — Configure Environment Variables
In the service's **Environment** tab, add the following variables (as referenced in `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Connection to the production PostgreSQL database |
| `PORT` | Port the service runs on (Render usually sets this automatically) |
| `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` | Sending email via Gmail SMTP |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Connecting to Supabase Storage for image uploads |
| `EXPO_ACCESS_TOKEN` | Sending push notifications via Expo |
| `JWT_SECRET` | Signing user authentication tokens |

### Step 4 — Initialize the Database
1. Create a PostgreSQL instance (Render PostgreSQL or a Supabase project).
2. Copy the connection string and paste it into the `DATABASE_URL` variable from Step 3.
3. Connect to the database using a client tool (psql/DBeaver) or manually run the migration script to create the initial schema (as defined by the Drizzle ORM schema in `backend/src/db/schema`).

### Step 5 — Enable Deployment Notifications
1. Go to **Account Settings → Notifications** (or Workspace Settings if using a team account).
2. Enable email notifications for: Deploy started / Deploy succeeded / Deploy failed.
3. Confirm the notification email address is verified.

### Step 6 — Post-Setup Verification
1. Trigger the first deploy (automatic after service creation, or click **Manual Deploy**).
2. Check the **Logs** tab in the Render Dashboard to confirm the service started successfully (no crash errors).
3. Test the API using Postman/curl against the Render-provided domain (`https://<service-name>.onrender.com`) to confirm the backend responds correctly.

## 3. Operational Notes
- All infrastructure changes (adding environment variables, changing build commands, etc.) are currently made manually through the Dashboard and are not version-controlled as configuration files in the repository.
- Rollback: go to the **Deploys** tab in Render, select a previous successful deploy, and click **Redeploy**.
- Future improvement: introduce a `render.yaml` file to move toward Infrastructure as Code, enabling faster, version-controlled infrastructure recreation.
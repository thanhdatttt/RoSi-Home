# Deployment Guide — RosiHome

Guide for operations engineers to deploy and verify the RosiHome backend and mobile app.

## 1. Overview

| Component | Deployment Target | Trigger |
|---|---|---|
| Backend API | Render | Auto-deploy on merge to `main` (after CI passes) |
| Mobile App (Android) | EAS Build → APK | Auto-build on push to `main` (`mobile/**` changes) |

## 2. Prerequisites

- Access to the GitHub repository (`main` branch protected, requires PR + passing CI)
- Access to Render dashboard for the backend service
- Access to Expo/EAS account (`EXPO_TOKEN`)
- SMTP credentials for build notification emails (`SMTP_USER`, `SMTP_PASS`)

## 3. Required Secrets (GitHub Actions)

| Secret | Used For |
|---|---|
| `EXPO_TOKEN` | Authenticate EAS CLI for mobile builds |
| `SMTP_USER` / `SMTP_PASS` | Send build notification email (Gmail SMTP) |
| `TEAM_EMAIL_LIST` | Recipient list for build notifications |
| Render service secrets (set in Render dashboard, not GitHub) | `DATABASE_URL`, `JWT_SECRET`, Supabase keys, email provider keys |

Never commit secrets to the repository. All secrets are stored in **GitHub Actions Secrets** or the **Render dashboard**.

## 4. Backend Deployment (Render)

### 4.1 Pipeline

1. Developer opens a PR → CI (`ci.yml`) runs: typecheck, unit tests, integration tests, API tests, build.
2. PR is reviewed and merged into `main`.
3. Render is configured to auto-deploy on push to `main`.
4. Render pulls the latest commit, installs dependencies, runs the build command, and restarts the service.

### 4.2 Manual Deployment Steps (if auto-deploy is disabled)

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Select the RosiHome backend service.
3. Click **Manual Deploy → Deploy latest commit**.
4. Monitor the **Logs** tab until the service shows `Live`.

### 4.3 Database Migrations

Migrations run automatically as part of the backend startup/build command. To run manually:

```bash
npm run db:migrate
```

Run this against the target environment's `DATABASE_URL`. Never run migrations directly against production without a backup.

### 4.4 Post-Deployment Verification

1. Check the health endpoint: `GET /api/v1/health` → expect `200 OK`.
2. Check `/api-docs` loads correctly.
3. Run a smoke test: register/login with a test account.
4. Check Render logs for startup errors.

## 5. Mobile Deployment (Android APK via EAS)

### 5.1 Pipeline

1. Push to `main` touching `mobile/**` triggers `mobile-build-email.yml`.
2. Workflow installs dependencies, then runs:
   ```bash
   eas build --platform android --profile preview --non-interactive
   ```
3. Build result (APK URL, build details page) is parsed and emailed to the team.

### 5.2 Manual Trigger

- Go to **GitHub Actions → Mobile Build & Email Deployment → Run workflow**.

### 5.3 Verification

1. Open the emailed **Expo Build Details Page** link — confirm build status is `finished`.
2. Download the APK from the **Direct APK Download** link.
3. Install on a test Android device and verify the app launches and can reach the backend API.

> **Note:** APK download links expire after 30 days on Expo's servers.

## 6. Rollback Procedure

### Backend (Render)

1. Open Render Dashboard → service → **Deploys** tab.
2. Select a previous successful deploy.
3. Click **Redeploy** on that revision.

### Mobile

- Distribute the last known-good APK link from a previous build email, or re-run the workflow on the last stable commit (`workflow_dispatch` with a specific ref).

## 7. Troubleshooting

| Issue | Action |
|---|---|
| CI fails before deploy | Fix the failing test/typecheck/build step; deploy is blocked until CI passes |
| Render deploy fails | Check Render build logs; verify environment variables are set correctly |
| EAS build fails | Check `EXPO_TOKEN` validity; check Expo build logs via the details page |
| Email notification not received | Verify `SMTP_USER`/`SMTP_PASS` secrets and `TEAM_EMAIL_LIST`; check spam folder |
| Database connection error after deploy | Verify `DATABASE_URL` secret in Render matches the target Supabase instance |
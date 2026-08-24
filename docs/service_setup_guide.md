# Database and service setup - RosiHone

## 1. Scope

| Component | Service |
|---|---|
| Database (PostgreSQL) | Supabase |
| File Storage (maintenance photos, payment proofs) | Supabase Storage |
| Backend hosting + CD | Render |
| Payment | VietQR (QR generation only) |

---

## 2. Supabase (Database) Setup

1. Create a new project on [supabase.com](https://supabase.com), region: Singapore.
2. Get the connection string (`Settings → Database → Connection string`), use the **Pooler (Transaction mode)** URL.
3. Set backend env var:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:6543/postgres
   ```
4. Run Drizzle migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
5. Access control: enforced entirely at the backend API layer (ownership/role checks), not via Supabase RLS, since the backend uses the service role key.
6. Create Storage buckets (`Storage → New bucket`), both **private**:
   - `maintenance-photos`
   - `payment-proofs`
   - Access only via backend-issued **signed URLs**.
7. Env vars:
   ```
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

---

## 3. Render (Backend Deploy) Setup

1. Connect the GitHub repo → create a new **Web Service**.
2. Build/start commands:
   ```
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```
3. Region: Singapore (close to Supabase, lower latency).
4. Environment variables:
   ```
   DATABASE_URL=
   JWT_SECRET=
   JWT_REFRESH_SECRET=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   PUBLIC_APP_URL=
   PORT=10000
   ```
5. Enable **Auto-Deploy** on `main` — every merged PR triggers a deploy.
6. Health check path: `/api/v1/health`.

## 4. VietQR

1. No third-party account needed — uses the public VietQR/napas247 standard.
2. Backend generates the QR payload from: bank code, landlord account number, invoice amount, transfer description.
3. Scope is generation only — no payment status callback, no bank integration; payment confirmation stays a manual landlord action.
4. Validate the generated payload by scanning with a real banking app (e.g. Vietcombank, Techcombank, MBBank) before accepting US-VIETQR-02.
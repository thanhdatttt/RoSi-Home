# RosiHome — Technical Architecture Specification (AI-Agent Ready)

---

## 1. Stack Recap & Versions

| Layer | Choice | Notes for codegen |
|---|---|---|
| Backend | Node.js 20 LTS + Express 4 | REST only, no GraphQL |
| Language | TypeScript (strict mode) | Both backend and frontend/mobile |
| Web frontend | React 18 + Vite | No Next.js — plain SPA + REST API |
| Mobile | React Native + Expo | Shares types/DTOs with web via a shared package |
| ORM | Drizzle ORM | `drizzle-kit` for migrations |
| Database | PostgreSQL 15 (hosted on Supabase) | |
| File storage | Supabase Storage (S3-compatible buckets) | |
| Auth | JWT (access + refresh) via `jsonwebtoken`, hashing via `bcrypt` | Not Passport — hand-rolled is simpler for this scope, see §6 |
| Validation | `zod` | Every request body/query is parsed through a zod schema before hitting a controller |
| Testing | Vitest (unit), Supertest (API/integration), Playwright (E2E web) | Team member preference includes testing/QA — cover this seriously |
| CI/CD | GitHub Actions | Lint → typecheck → test → build → deploy |
| Hosting | Backend: Render/Railway. Web: Vercel. DB/Storage: Supabase | |

---

## 2. Monorepo Structure

```
rosihome/
├── apps/
│   ├── api/                      # Node/Express backend
│   │   ├── src/
│   │   │   ├── config/           # env loading, db client, storage client
│   │   │   ├── db/
│   │   │   │   ├── schema/       # drizzle table definitions, one file per domain
│   │   │   │   ├── migrations/   # drizzle-kit generated SQL
│   │   │   │   └── seed.ts
│   │   │   ├── modules/          # one folder per feature/domain (see below)
│   │   │   │   ├── auth/
│   │   │   │   ├── properties/
│   │   │   │   ├── rooms/
│   │   │   │   ├── tenants/
│   │   │   │   ├── leases/
│   │   │   │   ├── utilities/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── maintenance/
│   │   │   │   ├── dashboard/
│   │   │   │   └── notifications/
│   │   │   ├── middleware/       # auth.middleware, error.middleware, rbac.middleware, upload.middleware
│   │   │   ├── jobs/             # cron jobs (lease reminders, invoice generation, payment reminders)
│   │   │   ├── lib/              # vietqr generator, pdf generator, mailer
│   │   │   ├── app.ts            # express app assembly
│   │   │   └── server.ts         # entrypoint
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   ├── web/                      # React web app
│   └── mobile/                   # React Native (Expo) app
├── packages/
│   └── shared/                   # shared TS types, zod schemas, DTOs, constants (imported by api, web, mobile)
├── .github/workflows/
└── docker-compose.yml            # local Postgres for dev
```

Each `modules/<name>/` folder inside the API follows the same internal shape — an AI agent should replicate this pattern for every new module:

```
modules/<name>/
├── <name>.routes.ts       # Express Router, wires paths to controller fns, applies zod validation + rbac middleware
├── <name>.controller.ts   # thin: parses req, calls service, shapes response
├── <name>.service.ts      # business logic, orchestrates repository + other services
├── <name>.repository.ts   # Drizzle queries only, no business logic
├── <name>.schema.ts       # zod request/response schemas (re-exported from packages/shared if shared with frontend)
└── <name>.types.ts        # module-local TS types not needed by frontend
```

**Rule for the AI agent:** never put Drizzle queries in a controller, and never put business logic (validation beyond shape, calculations, status transitions) in a repository. This keeps every module unit-testable in isolation.

---

## 3. Naming Conventions

- Database: `snake_case` table and column names, plural table names (`properties`, `rooms`, `invoices`).
- TypeScript: `camelCase` for variables/functions, `PascalCase` for types/interfaces/React components.
- REST paths: `kebab-case`, plural nouns, nested under parent resource where ownership is strict: `/properties/:propertyId/rooms`.
- Drizzle schema files: singular file name matching table, e.g. `db/schema/room.ts` exports `rooms`.
- Environment variables: `SCREAMING_SNAKE_CASE`.
- Branch naming (GitHub): `feature/F-XX-short-name`, `fix/short-name` — ties directly to backlog IDs in `product_backlog.md`.

---

## 4. Environment Variables

```
# API
PORT=4000
NODE_ENV=development|production|test
DATABASE_URL=postgres://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET_PROOFS=payment-proofs
SUPABASE_STORAGE_BUCKET_MAINTENANCE=maintenance-photos
SUPABASE_STORAGE_BUCKET_METERS=meter-photos
VIETQR_API_BASE=https://api.vietqr.io/v2
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FRONTEND_URL=https://app.rosihome.dev
```

`packages/shared` exports a zod-validated `env.ts` that both loads and type-checks `process.env` at boot; the server must fail fast if a required var is missing.

---

## 5. Database Schema (Drizzle, PostgreSQL)

All tables use `id uuid primary key default gen_random_uuid()` and `created_at timestamptz default now()` / `updated_at timestamptz default now()` unless noted. Foreign keys use `on delete cascade` for child records owned exclusively by the parent (e.g. rooms→property), and `on delete restrict` where deletion should be blocked while related business records exist (e.g. a room with an active lease).

### 5.1 `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| full_name | text not null | |
| email | text unique | nullable if phone-only signup |
| phone | text unique | nullable if email-only signup |
| password_hash | text not null | bcrypt |
| role | enum('landlord','tenant') not null | |
| avatar_url | text | nullable |
| is_active | boolean default true | |
| created_at / updated_at | timestamptz | |

Constraint: `CHECK (email IS NOT NULL OR phone IS NOT NULL)`.

### 5.2 `password_reset_tokens`
| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK → users.id, cascade |
| token_hash | text not null |
| expires_at | timestamptz not null |
| used_at | timestamptz nullable |

### 5.3 `properties`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| landlord_id | uuid FK → users.id, cascade |
| name | text not null |
| address | text not null |
| description | text nullable |
| default_electricity_rate | numeric(12,2) nullable | VND per kWh, overridable at room level |
| default_water_rate | numeric(12,2) nullable | VND per m³ or per person, see `water_billing_method` |
| water_billing_method | enum('per_m3','per_person') default 'per_m3' |

### 5.4 `rooms`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| property_id | uuid FK → properties.id, cascade |
| name | text not null | e.g. "Room 101" |
| base_rent | numeric(12,2) not null |
| electricity_rate_override | numeric(12,2) nullable |
| water_rate_override | numeric(12,2) nullable |
| status | enum('vacant','occupied') default 'vacant' | derived/kept in sync by lease lifecycle triggers (see §5.6) |

Unique constraint: `(property_id, name)`.

### 5.5 `tenant_profiles`
> Business-facing tenant record managed by the landlord. Distinct from `users` — a tenant_profile may or may not be linked to a login account yet.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| landlord_id | uuid FK → users.id, cascade |
| user_id | uuid FK → users.id, nullable, unique | set once tenant links/creates a login |
| full_name | text not null |
| phone | text not null |
| id_card_number | text not null |
| email | text nullable |

Unique constraint: `(landlord_id, id_card_number)` — enforces "no duplicate tenant within the same landlord portfolio" (F-03 AC).

### 5.6 `leases`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| room_id | uuid FK → rooms.id, restrict |
| tenant_profile_id | uuid FK → tenant_profiles.id, restrict |
| start_date | date not null |
| end_date | date not null |
| rent_amount | numeric(12,2) not null | snapshot of agreed rent, may differ from room.base_rent |
| deposit_amount | numeric(12,2) default 0 |
| status | enum('active','ended','terminated') default 'active' |
| renewal_reminder_sent_at | timestamptz nullable |

Business rule enforced in `leases.service.ts` (not DB-level, since Postgres exclusion constraints on date ranges add complexity out of scope for MVP): a room may have at most one lease with `status = 'active'` at a time. On lease creation, service sets `rooms.status = 'occupied'`; on lease end/termination, service sets `rooms.status = 'vacant'` if no other active lease exists.

### 5.7 `meter_readings`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| room_id | uuid FK → rooms.id, cascade |
| period | date not null | normalized to first day of month, e.g. `2026-07-01` |
| electricity_reading | numeric(12,2) not null |
| water_reading | numeric(12,2) not null |
| recorded_by | uuid FK → users.id | landlord who entered it |

Unique constraint: `(room_id, period)`.

### 5.8 `invoices`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| lease_id | uuid FK → leases.id, restrict |
| room_id | uuid FK → rooms.id, restrict | denormalized for query convenience |
| period | date not null | billing month |
| rent_amount | numeric(12,2) not null |
| electricity_amount | numeric(12,2) not null default 0 |
| water_amount | numeric(12,2) not null default 0 |
| other_fees_amount | numeric(12,2) not null default 0 |
| other_fees_note | text nullable |
| total_amount | numeric(12,2) not null | = sum of above, computed in service layer on write |
| due_date | date not null |
| status | enum('unpaid','paid','overdue') default 'unpaid' |
| paid_at | timestamptz nullable |

Unique constraint: `(lease_id, period)`.

### 5.9 `invoice_items` *(optional normalization — MVP may keep amounts flat on `invoices` per above; use this table only if the team wants a fully itemized, extensible line-item model)*
| Column | Type |
|---|---|
| id | uuid PK |
| invoice_id | uuid FK → invoices.id, cascade |
| label | text not null |
| amount | numeric(12,2) not null |

> Recommendation: start with the flat columns on `invoices` (§5.8) for MVP speed; introduce `invoice_items` only if "additional fees" need to become multi-line.

### 5.10 `payments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| invoice_id | uuid FK → invoices.id, cascade, unique | one payment record per invoice in MVP |
| proof_image_url | text nullable | Supabase Storage URL |
| proof_uploaded_at | timestamptz nullable |
| verified_by | uuid FK → users.id, nullable | landlord who confirmed |
| verified_at | timestamptz nullable |
| status | enum('pending_proof','pending_verification','verified') default 'pending_proof' |

### 5.11 `maintenance_requests`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| room_id | uuid FK → rooms.id, restrict |
| tenant_profile_id | uuid FK → tenant_profiles.id, restrict |
| title | text not null |
| description | text not null |
| photo_urls | text[] | max 3 enforced in service layer |
| status | enum('pending','in_progress','completed') default 'pending' |

### 5.12 `maintenance_status_logs`
| Column | Type |
|---|---|
| id | uuid PK |
| maintenance_request_id | uuid FK → maintenance_requests.id, cascade |
| status | enum('pending','in_progress','completed') |
| changed_by | uuid FK → users.id |
| changed_at | timestamptz default now() |

### 5.13 `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK |
| user_id | uuid FK → users.id, cascade |
| type | enum('payment_reminder','lease_renewal','maintenance_update','payment_proof_uploaded','invoice_generated') |
| title | text not null |
| body | text not null |
| entity_type | text nullable | e.g. `'invoice'`, `'lease'`, `'maintenance_request'` |
| entity_id | uuid nullable | id of related record, for deep-linking |
| is_read | boolean default false |
| channel | enum('in_app','email','both') default 'in_app' |

### 5.14 Entity Relationship Summary

```
users (landlord) 1──* properties 1──* rooms 1──* leases *──1 tenant_profiles
rooms 1──* meter_readings
leases 1──* invoices 1──1 payments
rooms 1──* maintenance_requests 1──* maintenance_status_logs
tenant_profiles ?──1 users (tenant login, nullable link)
users 1──* notifications
```

---

## 6. Authentication & Authorization

- **Signup/login** issue an **access token** (15 min, JWT, contains `sub`, `role`, `email/phone`) and a **refresh token** (30 days, stored hashed in a `refresh_tokens` table so it can be revoked on logout).
- Access token sent as `Authorization: Bearer <token>`; refresh token delivered as an `httpOnly` cookie (web) or secure storage (mobile).
- `middleware/auth.middleware.ts` verifies the access token and attaches `req.user = { id, role }`.
- `middleware/rbac.middleware.ts` takes an allowed-roles array, e.g. `requireRole('landlord')`, and is applied per-route.
- **Ownership checks** (a landlord can only touch their own properties; a tenant can only touch their own lease/invoices) happen in the **service layer**, not just RBAC — RBAC only checks role, not resource ownership. Every service function that loads a resource by id must also verify `resource.landlordId === req.user.id` (or the tenant equivalent) and throw a `ForbiddenError` (mapped to HTTP 403) otherwise.
- Password reset: generate a random token, store its SHA-256 hash + 1-hour expiry in `password_reset_tokens`, email/SMS a link containing the raw token, verify by re-hashing on submit.

---

## 7. API Design Conventions

### 7.1 Base URL & versioning
`https://api.rosihome.dev/v1/...` — all routes prefixed `/v1`.

### 7.2 Response envelope

Success:
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "pageSize": 20, "total": 42 } }
```
`meta` only present on paginated list endpoints.

Error:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "email is invalid", "details": [ { "field": "email", "issue": "Invalid email" } ] } }
```

### 7.3 Standard error codes → HTTP status

| code | status |
|---|---|
| VALIDATION_ERROR | 400 |
| UNAUTHENTICATED | 401 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| CONFLICT | 409 |
| INTERNAL_ERROR | 500 |

`middleware/error.middleware.ts` is the single place that maps thrown error classes (`ValidationError`, `UnauthenticatedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`) to this envelope. Controllers/services just `throw new NotFoundError('Room not found')`.

### 7.4 Pagination

List endpoints accept `?page=1&pageSize=20` (defaults shown), return `meta.total` for client-side pagination controls.

### 7.5 File uploads

`multipart/form-data`, handled by `multer` in memory storage, then streamed to the relevant Supabase Storage bucket. Validation (file type, size) happens in `middleware/upload.middleware.ts` before hitting the controller — reject anything other than `image/png`, `image/jpeg`, `image/jpg`; enforce 5MB max for payment proofs, no explicit cap stated for maintenance/meter photos so default to the same 5MB/file limit for consistency.

---

## 8. VietQR Generation

Use the public VietQR quick-link image API (no merchant account required, matches "RosiHome never touches tenant money" constraint):

```
GET https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={MESSAGE}&accountName={ACCOUNT_NAME}
```

- `BANK_ID`: landlord's bank BIN/short code, stored on the `users` table (landlord) as `bank_id`, `bank_account_no`, `bank_account_name` — **add these three columns to `users`**, nullable, required only before the first invoice can be generated (validate in `invoices.service.ts`).
- `TEMPLATE`: fixed value `compact2`.
- `AMOUNT`: `invoices.total_amount`.
- `MESSAGE` (`addInfo`): generated as `RH {roomName} T{MM}{YYYY}` (e.g. `RH P101 T072026`) — must be deterministic and parseable in case of future reconciliation automation.

`lib/vietqr.ts` exports `buildVietQrUrl(invoice, room, landlord): string`, pure function, unit-tested with fixed inputs/outputs.

---

## 9. Scheduled Jobs (`apps/api/src/jobs/`)

| Job | Schedule | Responsibility |
|---|---|---|
| `generate-monthly-invoices.job.ts` | Daily 00:10, filters leases whose billing day matches today | For each active lease due for billing, requires a meter reading for the current period to already exist; if missing, creates an in-app notification to the landlord instead of an invoice |
| `lease-renewal-reminder.job.ts` | Daily 06:00 | Leases where `end_date - today = 30` and `renewal_reminder_sent_at IS NULL` → notify landlord + tenant, stamp `renewal_reminder_sent_at` |
| `payment-reminder.job.ts` | Daily 08:00 | Invoices `status = 'unpaid'` and `due_date < today` → mark `status = 'overdue'`, send reminder notification |

All jobs are plain functions callable both by `node-cron` in-process scheduling and by an npm script (`npm run job:invoices`) so they can alternatively run as external cron triggers (e.g. Render Cron Jobs) if in-process scheduling proves unreliable on the chosen free-tier host.

---

## 10. Testing Strategy

- **Unit tests** (Vitest): every `*.service.ts` function, and pure helpers (`vietqr.ts`, utility calculation, invoice total calculation). Repositories are mocked.
- **Integration tests** (Supertest + a disposable test Postgres schema): one test file per module hitting real routes end-to-end through the DB, covering the Acceptance Criteria in `02-FEATURE-SPECS.md` directly — each AC should map to at least one assertion.
- **E2E tests** (Playwright, web only for MVP): critical paths — landlord onboarding → create property/room/tenant/lease → generate invoice → tenant views invoice; tenant uploads proof → landlord verifies.
- CI runs unit + integration on every PR; E2E runs on merge to `main`.

---

## 11. CI/CD (GitHub Actions)

`.github/workflows/ci.yml`: on PR — install → `tsc --noEmit` → `eslint` → `vitest run` (unit + integration against a Postgres service container) → build.
`.github/workflows/deploy.yml`: on push to `main` — build → run `drizzle-kit migrate` against production DB → deploy API to Render/Railway → deploy web to Vercel.

---

## 12. Notification Delivery

`notifications.service.ts` exposes `createNotification(userId, type, title, body, entity?)` which always writes an in-app row, and — if `channel` includes `'email'` — enqueues an email via `lib/mailer.ts` (Nodemailer + SMTP). Keep delivery synchronous for MVP (no queue infra); wrap in try/catch so an email failure never blocks the triggering request/job.

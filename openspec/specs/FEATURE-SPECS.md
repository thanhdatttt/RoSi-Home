# RosiHome — Feature Specifications (Implementation-Ready)

**Audience:** AI coding agents implementing one user story at a time.
**Prerequisite reading:** `01-ARCHITECTURE.md` (auth, error format, data model, soft-delete/audit rules, money rounding, status enums). This document does not repeat those rules — it applies them per story.

**Convention used below:** each story lists `Endpoint(s)`, `Auth`, `Request`, `Response`, `Business rules` (implementation-ready restatement of the acceptance criteria), and `Edge cases`. Story IDs match `product_backlog.md` exactly — keep them in code comments/commit messages for traceability.

---

## EPIC 1 — Infrastructure and User Management

### F-01 — User Registration, Authentication, and Profile Management

#### US-AUTH-01 — Register a landlord account
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth:** none (public)
- **Request:** `{ fullName, email, password, passwordConfirmation }`
- **Response:** `201 { data: { userId, role: "Landlord" } }` (no token — user must log in explicitly)
- **Business rules:**
  - All fields required; `email` must be valid format; `password`/`passwordConfirmation` must match and satisfy the password policy (§3.4 of architecture doc).
  - Create `users` row (`role=Landlord`, `username=email`) and `landlord_profiles` row in one transaction.
  - Duplicate email → `409 CONFLICT`, generic message `"Unable to register with these details."` (does not confirm the email exists — avoid user enumeration).
- **Edge cases:** race condition on duplicate email is caught by the DB unique constraint, not just an app-level pre-check.

#### US-AUTH-02 — Log in
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth:** none
- **Request:** `{ username, password }` (username = email for landlord, phone for tenant)
- **Response:** `200 { data: { accessToken, refreshToken, user: { id, role, fullName, mustChangePassword } } }`
- **Business rules:**
  - Look up by `username`; compare bcrypt hash; on any failure return `401 UNAUTHENTICATED` with a generic message — never reveal whether the username exists.
  - On success, issue an access token (15 min, §3.2) **and** a refresh token (7-day, rotated per use). Return `mustChangePassword` so the mobile app can route straight to the forced password-change screen for first-time tenants.

#### US-AUTH-03 — Log out
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth:** required (any role)
- **Request:** `{ refreshToken }` (optional but recommended)
- **Response:** `200 { data: { success: true } }`
- **Business rules:** On this call the server **revokes the presented refresh token** (sets `revokedAt` in `rosihome_refresh_tokens`) so it can no longer be used at `/auth/refresh`. The mobile app is additionally responsible for deleting both tokens from secure storage and clearing in-memory cached protected data.

#### US-AUTH-04 — Enforce role and data ownership
- **Not a standalone endpoint** — this is the `requireAuth` + `requireRole` + service-layer ownership pattern described in architecture §3.3, applied to *every* protected route in this document. Implement it once as middleware/helpers and reuse; do not special-case it per module.
- **Business rules:** unauthenticated → `401`; wrong role → `403`; right role but not the owner → `404` (never `403`, to avoid confirming existence — see architecture §3.3).

#### US-AUTH-05 — Change password
- **Endpoint:** `POST /api/v1/auth/change-password`
- **Auth:** required (any role) — this is the *one* route reachable even when `mustChangePassword=true`
- **Request:** `{ currentPassword, newPassword, newPasswordConfirmation }`
- **Response:** `200 { data: { success: true } }`
- **Business rules:**
  - Verify `currentPassword` against stored hash → `401` if wrong.
  - `newPassword === newPasswordConfirmation`, satisfies password policy, and **must differ** from `currentPassword` → `422` otherwise.
  - On success: update `passwordHash`, set `mustChangePassword=false`, write an `audit_events` row (`action="password.changed"`, no password values stored). **No new token is issued** — the response is `{success:true}` only and the mobile app must redirect the user to login (the old access token remains valid until its 15-min expiry but the user is forced to re-authenticate).

#### US-AUTH-07 — Refresh access token
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Auth:** none (requires a valid refresh token in body)
- **Request:** `{ refreshToken }`
- **Response:** `200 { data: { accessToken, refreshToken, user } }` (a brand-new pair)
- **Business rules:**
  - Lookup the hashed refresh token; reject (`401`) if not found, already `revokedAt`, or past `expiresAt` (>7 days). The mobile app then forces re-login.
  - On success: **revoke the presented refresh token** and issue a new access+refresh pair (rotation). `user` reflects current `mustChangePassword`/role.

#### US-PROFILE-01 — View and update a user profile
- **Endpoints:** `GET /api/v1/profile`, `PATCH /api/v1/profile`
- **Auth:** required (any role)
- **Request (PATCH):** editable fields only — `fullName`, `phone` (landlord); tenant profile fields are edited via `US-TENANT-01`, not this endpoint (tenant_info is a separate record from the login account).
- **Response:** `200 { data: { id, fullName, email/username, phone, role } }`
- **Business rules:** `role` is never accepted in the request body (reject/ignore silently — do not let the client attempt privilege escalation). Uniqueness re-validated on any identifier change.

#### US-AUTH-06 — Recover a forgotten password
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Auth:** none
- **Request (forgot):** `{ email }` → always `200 { data: { success: true } }` regardless of whether the email exists (no enumeration).
- **Business rules:**
  - The backend **generates a new random password** (satisfies the password policy, §3.4), stores its bcrypt hash, sets `mustChangePassword=false`, **revokes all outstanding refresh tokens** for the user (forces re-login on every device), and writes an `audit_events` row (`action="password.reset"`).
  - Email delivery only, via Gmail SMTP (`nodemailer`, see architecture §1.1), to the account's registered email (landlords have one directly; tenants use `tenant_info.email`). The email contains the **new temporary password in plaintext** plus a prompt to change it after logging in.
  - The user can log in immediately with the emailed password — no reset link, no second step.
  - The previous password no longer authenticates the user.
  - To avoid leaking the new password through logs, never log the response body or email body; the email body is treated as sensitive (redaction rule applies to `password`/`tempPassword` fields, architecture §3.4).

---

## EPIC 2 — Portfolio and Property Setup

### F-02 — Property and Room Management

#### US-PROPERTY-01 — Create a property
- **Endpoint:** `POST /api/v1/properties`
- **Auth:** Landlord
- **Request:** `{ name, address, locality? }`
- **Response:** `201 { data: property }`
- **Business rules:** `name` and `address` required; `locality` optional (province/city code, used as the locality key for `regulatory_rate_defaults` fallback in US-METER-02); `UNIQUE(landlordId, name)` and `UNIQUE(landlordId, address)` among active rows → `409` on violation; `landlordId` always taken from `req.user.id`.

#### US-PROPERTY-02 — View and update owned properties
- **Endpoints:** `GET /api/v1/properties`, `GET /api/v1/properties/:id`, `PATCH /api/v1/properties/:id`
- **Auth:** Landlord (ownership enforced)
- **Request (PATCH):** `{ name?, address?, locality? }`
- **Business rules:** update re-validates uniqueness excluding the row itself; a landlord requesting another landlord's property ID gets `404`.

#### US-ROOM-01 — Add a room to a property
- **Endpoint:** `POST /api/v1/properties/:propertyId/rooms`
- **Auth:** Landlord, must own `propertyId`
- **Request:** `{ name, baseRent }`
- **Response:** `201 { data: room }` — response includes derived `status: "Vacant"`.
- **Business rules:** `name` required, `UNIQUE(propertyId, name)` active rows → `409`; `baseRent >= 0` → `422` otherwise.

#### US-ROOM-02 — View and update room information
- **Endpoints:** `GET /api/v1/properties/:propertyId/rooms`, `GET /api/v1/rooms/:id`, `PATCH /api/v1/rooms/:id`
- **Auth:** Landlord, ownership via property
- **Response:** includes derived `status` (§4.6 of architecture doc — computed from active lease existence, never a stored/editable field).
- **Business rules:** `PATCH` body must not accept a `status`/`occupancy` field at all (reject unknown fields via zod `.strict()`), so it's structurally impossible to override it.

#### US-ROOM-03 — Add multiple rooms to a property
- **Endpoint:** `POST /api/v1/properties/:propertyId/rooms/bulk`
- **Auth:** Landlord, must own `propertyId`
- **Request:** `{ rooms: [{ name?, baseRent }] }` (bounded list, recommend max 50; `name` optional → auto-numbered e.g. `Room 1`, `Room 2`, ... continuing from the highest existing numeric suffix in the property)
- **Response:** `201 { data: { created: room[] } }` or `422` with per-row field errors (`{ error: { fields: [{ field: "rooms[2].name", message: "..." }] } }`) if any row is invalid.
- **Business rules:** the whole batch runs in **one transaction** — all-or-nothing (architecture §4.4); validate name uniqueness both within the submitted array and against existing active rooms *before* inserting anything.

### F-03 — Tenant Information and Account Management

#### US-TENANT-01 — View and update tenant information created from a lease
- **Endpoints:** `GET /api/v1/tenants`, `GET /api/v1/tenants/:id`, `PATCH /api/v1/tenants/:id`, `DELETE /api/v1/tenants/:id` (soft-archive)
- **Auth:** Landlord — scoped to `tenant_info` rows linked to at least one lease in a property the landlord owns (join `tenant_info → leases → rooms → properties`)
- **Request (PATCH):** `{ fullName?, phone?, email?, idNumber? }`
- **Business rules:**
  - Format + uniqueness validation on `phone`/`email`/`idNumber` (active rows) on every update.
  - If `phone` or `email` changes and that value is also the tenant's login `username`/contact address, synchronize `users.username` (email flows are simpler; a phone/username change requires re-verifying uniqueness against `users.username` too) — treat as a single transaction; if the new value collides with another account, reject with `409` before changing anything.
  - "Archiving" a tenant relationship = soft-deleting the `tenant_info` row (or ending the lease, per US-LEASE-04) — never hard-delete; historical leases/invoices/payments keep referencing the row via FK, unaffected by `deletedAt`.
  - A landlord who has no lease relationship to this tenant gets `404`.

#### US-TENANT-02 — Provision a tenant account from a lease
- **Not a standalone endpoint** — this is a service function `provisionTenantAccount(tenantInfo)` invoked *inside* the `POST /leases` transaction (US-LEASE-01), never called directly by the client.
- **Business rules:**
  1. Validate `tenant_info` doesn't already have a `userId` (idempotency guard — a lease renewal or second lease for the same tenant does not re-provision).
  2. Create `users` row (`role=Tenant`, `username=phone`, random temp password hashed, `mustChangePassword=true`).
  3. Link `tenant_info.userId`.
  4. Send an email (async, but the DB transaction commits first — see below) with username, temp password, and the mobile app link/store URL.
  5. **Retry safety:** if the email send fails, do **not** roll back the DB transaction; instead queue/retry the email send separately (e.g. an `email_send` job with `status=pending`) so a flaky email provider never causes a duplicate account or duplicate lease on the client's retry of `POST /leases`. `POST /leases` itself must be safe to retry: if the lease/tenant already exists for the exact same idempotent submission (see US-LEASE-01), return the existing record rather than erroring or duplicating.

---

## EPIC 2 (cont.) — Utility Pricing

### F-04 — Utility Pricing and Property Surcharge Configuration

#### US-UTILITY-01 — Configure utility rates
- **Endpoint:** `POST /api/v1/properties/:propertyId/utility-rates`
- **Auth:** Landlord, must own property
- **Request:** `{ electricityRatePerKwh, waterBillingMethod: "Metered"|"Flat", waterRatePerM3?, waterFlatAmountPerTenant?, effectiveFrom }`
- **Response:** `201 { data: utilityRateRow }`
- **Business rules:**
  - `waterBillingMethod=Metered` requires `waterRatePerM3 >= 0`; `=Flat` requires `waterFlatAmountPerTenant >= 0`; the other field must be omitted/null — `422` if both or neither supplied.
  - All rates non-negative integers (VND). Insert as a **new row** in `utility_rate_history` (append-only versioning, architecture §5.2) — never update an old row in place.
  - If no rate exists yet for the property and none is created, calculations fall back to `regulatory_rate_defaults` (see US-METER-02) — that fallback is read-only reference data, never auto-copied into `utility_rate_history`.

#### US-UTILITY-02 — View and update utility rates
- **Endpoints:** `GET /api/v1/properties/:propertyId/utility-rates` (returns current effective rate: latest row with `effectiveFrom <= today`), `POST /api/v1/properties/:propertyId/utility-rates` (an "update" is simply a new versioned row per above, `effectiveFrom` in the future or today)
- **Business rules:** a rate change never touches already-generated `invoice_line_items` (those snapshot `sourceRateId` and `unitRate` at generation time — immutable history). Future invoice generation runs pick up the new effective row automatically.

#### US-CHARGE-01 — Configure recurring property surcharges
- **Endpoints:** `POST /api/v1/properties/:propertyId/surcharges`, `GET .../surcharges`, `PATCH /api/v1/surcharges/:id`, `DELETE /api/v1/surcharges/:id` (soft, sets `active=false`/`deletedAt`)
- **Auth:** Landlord, must own property
- **Request (POST):** `{ name, monthlyAmount, effectiveFrom, effectiveTo? }`
- **Business rules:**
  - `monthlyAmount >= 0`; no two **active** surcharges in the same property with the same `name` and overlapping `[effectiveFrom, effectiveTo ?? +inf)` → `409`.
  - Deactivation/update is **prospective only**: an invoice already `Sent`/`Paid` keeps its already-snapshotted surcharge line item untouched; only future invoice generation runs see the change.
  - `DELETE` sets `active=false` + `deletedAt`/`deletedBy` (soft) and records the responsible landlord/time via the shared audit mechanism (architecture §4.3).

---

## EPIC 3 — Automated Monthly Billing and Payment

### F-05 — Utility Meter Reading and Calculation

#### US-METER-01 / US-METER-02 — Record an initial or monthly meter reading and calculate consumption
- **Endpoint:** `POST /api/v1/rooms/:roomId/meter-readings`
- **Auth:** Landlord, must own room's property
- **Request:** `{ utilityType: "Electricity"|"Water", billingPeriod, value, isInitial? }`
- **Response:** `201 { data: MeterReadingView }` where `MeterReadingView` includes at least `{ id, roomId, utilityType, billingPeriod, value, isInitial, consumption?, rate?, amount?, rateSourceId?, rateSourceType?, previousValue?, previousReadingId? }` and any error `fields` (see below).
- **Business rules (algorithm):**
  1. If `isInitial=true` (or no reading exists yet for `(roomId, utilityType, billingPeriod)`): store the reading with `isInitial=true`. No consumption/charge is computed from an initial reading alone (it's a baseline). `value >= 0`.
  2. Otherwise (monthly reading): fetch the immediately preceding reading for `(roomId, utilityType)` ordered by billing period; if `value < previous.value` → `422 { code: "UNPROCESSABLE", fields: [{ field: "value", message: "Reading cannot be lower than the previous reading." }] }`.
  3. `consumption = value - previous.value`.
  4. Resolve the **effective rate**: latest `utility_rate_history` row for the property with `effectiveFrom <= billingPeriod start date`; if none exists, fall back to `regulatory_rate_defaults` matching `(utilityType, locality=property.locality, effectiveFrom <= period <= effectiveTo|open)`. If neither a landlord rate nor a matching, non-expired, correct-locality default exists → `422 { code: "UNPROCESSABLE", fields: [{ field: "utilityType", message: "No applicable rate is configured for this utility/period." }] }` (never silently apply an unrelated/expired default).
  5. `amount = roundVnd(consumption * rate)` for electricity; for water, repeat steps 1–4 if property `waterBillingMethod = Metered` (water readings only accepted when `Metered` — Flat properties reject `utilityType=Water` here with `422`), or apply `roundVnd(flatAmountPerTenant * activeTenantCount)` if Flat (no water reading required/stored).
  6. The reading (and its computed breakdown) is **persisted** immediately, including the rate value, its source (`utility_rate_history` row id or `regulatory_rate_defaults` row id), locality, and effective date, so the calculation is reproducible later.
  7. Response returns the persisted `MeterReadingView` for the landlord to review before invoice generation picks it up.

> **Note:** US-METER-01 (initial) and US-METER-02 (monthly + calculation) are implemented as a **single** endpoint; the `isInitial` flag distinguishes them. There is no separate `/calculate` endpoint — the calculation result is stored as part of the reading record.

#### US-METER-03 — Correct a reading used for billing
- **Endpoint:** `POST /api/v1/meter-readings/:id/correct`
- **Auth:** Landlord, must own the room
- **Request:** `{ value }`
- **Business rules:**
  1. Look up the reading's related invoice via `(roomId, billingPeriod)`. Allowed only if that invoice's `status = Draft`; `Sent`/`Paid` → `422 { code: "UNPROCESSABLE", message: "This reading cannot be corrected because its invoice has already been sent or paid." }`.
  2. Insert a **new** `meter_readings` row with `correctionOf = original.id`, mark the original `supersededAt = now()` (never overwrite in place — preserves "original value, corrected value, change time, responsible landlord," satisfied jointly by the row itself plus an `audit_events` entry).
  3. Re-run the same calculation as US-METER-02 with the corrected value; re-validate ordering against the *previous period's* reading (unaffected).
  4. Recalculate and overwrite the `Draft` invoice's affected `invoice_line_items` (delete-and-reinsert the Electricity/Water lines, recompute `totalAmount`) — exactly one invoice must exist for the room/lease/period after this (upsert, not append).
  5. Response returns the updated draft invoice for landlord review before sending (US-INVOICE-04).

### F-06 — Billing and Invoice Generation

#### US-INVOICE-01 — Generate a monthly invoice
- **Trigger:** scheduled job `generateMonthlyInvoices` (architecture §8); also exposable as `POST /api/v1/properties/:propertyId/invoices/generate?period=YYYY-MM` for manual/test triggering (Landlord-only). `period` is optional and defaults to the previous month when omitted.
- **Business rules (algorithm), per active lease whose `billingPeriod` isn't yet invoiced:**
  1. Determine required readings from the property's utility config: Electricity always required; Water required only if `Metered`.
  2. If any required reading is missing for `(roomId, billingPeriod)` → skip this room, insert an `invoice_generation_skips` row with a human-readable reason, continue to the next room. **Do not create a partial invoice.**
  3. Otherwise compute line items: `Rent` (from `lease.agreedRent`), `Electricity` (from the stored calculation), `Water` (from the stored calculation or flat formula), and one `Surcharge` line per active surcharge on the property covering this billing period (snapshot `name`/`monthlyAmount` at generation time into `description`/`amount`).
  4. `totalAmount = sum(line item amounts)` using `roundVnd` per line, then integer sum (no re-rounding of the sum).
  5. Insert `invoices` (`status=Draft`, `issueDate=today`, `dueDate` = per team-configured offset, e.g. issueDate + 5 days) + `invoice_line_items`, all in one transaction.
  6. Idempotency: `UNIQUE(leaseId, billingPeriod)` active rows — if violated (job re-run), skip silently, no error surfaced to any user.
  7. Draft invoices are **not** visible to the tenant (enforced in US-INVOICE-02, not here).

#### US-INVOICE-02 — View an invoice
- **Endpoints:** `GET /api/v1/invoices` (list, scoped), `GET /api/v1/invoices/:id`
- **Auth:** Landlord (all statuses, owned properties only) or Tenant (only `Sent`/`Paid`, only their own lease's invoices)
- **Business rules:** a tenant requesting a `Draft` invoice, or any invoice not linked to their lease, gets `404`. Response includes `billingPeriod`, line items, `totalAmount`, `dueDate`, `status`.

#### US-INVOICE-03 — Download an invoice document
- **Endpoint:** `GET /api/v1/invoices/:id/pdf`
- **Auth:** same visibility rule as US-INVOICE-02 (tenant only after `Sent`)
- **Response:** `200`, `Content-Type: application/pdf`, streamed via `generateInvoicePdf` (architecture §10) using the exact same service-layer data as the JSON view.

#### US-INVOICE-04 — Review and send a draft invoice
- **Endpoint:** `POST /api/v1/invoices/:id/send`
- **Auth:** Landlord, must own the invoice's property
- **Business rules:**
  - Allowed only when `status = Draft` and all required fields (line items present, `totalAmount` computed) are populated → `422` otherwise.
  - Sets `status = Sent`, `sentBy = req.user.id`, `sentAt = now()`, in a transaction with an `audit_events` row. This transition happens **exactly once** — calling send again on an already-`Sent` invoice returns `422 { code: "UNPROCESSABLE", message: "Only a draft invoice can be sent." }` (idempotent-safe: does not re-notify or duplicate state).
  - After commit, fires `NotificationService.send(tenantUserId, "invoice.sent", ..., linkRef: "invoices/{invoiceId}")`.
  - Sending never sets `Paid` — that only happens via US-PAYMENT-02.

### F-07 — VietQR Payment Integration

> **Status: NOT YET IMPLEMENTED.** No `payment-config` or `vietqr` route exists in the backend (tables `landlord_payment_configs` and `landlordPaymentConfigs` exist but are not read/written by any module; no QR generator in `lib`). Spec below describes intended behavior.

#### US-VIETQR-01 — Configure landlord payment details
- **Endpoints:** `GET /api/v1/payment-config`, `PUT /api/v1/payment-config`
- **Auth:** Landlord (own config only — 1:1 with `landlord_payment_configs`)
- **Request:** `{ bankCode, accountNumber, accountHolderName }`
- **Business rules:** all fields required and format-validated (bank code against the supported VietQR bank list); never returned/logged to any user other than the owning landlord; never included in any other user's API response.

#### US-VIETQR-02 — Generate and display an invoice VietQR code
- **Endpoint:** `GET /api/v1/invoices/:id/vietqr`
- **Auth:** whoever is authorized to view the invoice (US-INVOICE-02 rule), and only for a "payable" invoice (`status = Sent`; a `Draft` invoice has no visible tenant view, a `Paid` invoice may still return the QR read-only but the app should hide the "pay" CTA)
- **Response:** `{ data: { payload, imageUrl, amount, description } }`
- **Business rules:** payload built exactly per architecture §7 from the invoice's `totalAmount` and the landlord's current `landlord_payment_configs`; `amount`/`description` in the response **must equal** the values encoded in `payload` (single source of truth — compute once, embed in both). Purely read-only: no state change on any call.

### F-08 — Payment Verification and Tracking

> **Status: NOT YET IMPLEMENTED.** No `payments` module/router exists in the backend (`payment_proofs` and `payments` tables exist but are unused). Spec below describes intended behavior.

#### US-PAYMENT-01 — Upload payment proof
- **Endpoint:** `POST /api/v1/invoices/:id/payment-proofs` (multipart)
- **Auth:** Tenant, must be the invoice's assigned tenant, invoice must be accessible (`Sent`) and unpaid
- **Business rules:** file type/size validated per architecture §9 before any storage write; reject with `422` and no attachment created for anything invalid. On success: insert `payment_proofs` (`status=Pending`), then `NotificationService.send(landlordId, "payment.proofUploaded", ..., linkRef: "invoice:{id}")`.
- **Edge cases:** a second upload for the same invoice is allowed (tenant might need to correct a bad screenshot) — list view for the landlord (US-PAYMENT-02) shows all pending proofs for the invoice, most recent first.

#### US-PAYMENT-02 — Verify payment manually
- **Endpoints:** `GET /api/v1/payment-proofs?status=Pending` (landlord's pending queue, scoped to owned properties), `POST /api/v1/invoices/:id/confirm-payment`
- **Auth:** Landlord, must own the invoice's property
- **Business rules:**
  - If `payments` row already exists for this `invoiceId` (already `Paid`) → return the existing record, `200`, **no duplicate created** (idempotent per architecture §4.5) rather than erroring, so a double-tap in the UI is harmless.
  - Otherwise: transaction — insert `payments` (`amount = invoice.totalAmount`, `verifiedBy`, `verifiedAt`), update `invoices.status = Paid`, mark the related `payment_proofs.status = Verified`.
  - The UI/response must never claim automated bank verification — this is explicitly a manual landlord confirmation.

#### US-PAYMENT-03 — View payment history and outstanding balances
- **Endpoint:** `GET /api/v1/payments/history` (Landlord: all owned properties; Tenant: own invoices only — same handler, scope resolved from `req.user`)
- **Response:** `{ data: { entries: [{ invoiceId, amount, billingPeriod, status, verifiedAt? }], outstandingTotal } }`
- **Business rules:** `outstandingTotal` = sum of `totalAmount` for invoices with `status != Paid` in scope; excludes `Draft` invoices from a tenant's view (not yet visible to them) but a landlord's outstanding total may reasonably include `Sent`-but-unpaid + optionally `Draft` — recommend: **outstanding total counts `Sent` invoices only** (a `Draft` isn't a confirmed obligation yet); document this choice in the endpoint's response shape (`outstandingSent`, and optionally `draftPending` as a separate, clearly-labeled figure) so the number displayed can't be misread as "money owed" when it isn't yet.

### F-09 — Rent Payment Reminders

#### US-REMINDER-01 — Receive an automatic overdue-payment reminder
- **Trigger:** job `sendOverdueReminders` (architecture §8), daily — **not yet implemented** (deferred; the job entry point currently exists as a no-op stub).
- **Business rules:**
  1. Query: `invoices WHERE status='Sent' AND dueDate < today AND NOT EXISTS (payments WHERE invoiceId = invoices.id)`.
  2. For each, `NotificationService.send(tenantUserId, "payment.overdue", ..., dedupeKey: "overdue:{invoiceId}:{today}")` — one per configured frequency (default: once/day while overdue, or per landlord's configured schedule — see next bullet).
  3. Landlord-configurable schedule: extend `lease_reminder_configs` or a similar `property`-level setting for overdue-reminder frequency (e.g. daily vs. every 3 days); if unspecified, default to daily.
  4. A `Paid` invoice is excluded by the `NOT EXISTS (payments...)` clause automatically — no separate check needed.

#### US-REMINDER-02 — Send a manual payment reminder

> **Status: NOT YET IMPLEMENTED.** No `POST /api/v1/invoices/:id/remind` route exists in the backend.

- **Endpoint:** `POST /api/v1/invoices/:id/remind`
- **Auth:** Landlord, must own the invoice's property
- **Business rules:** allowed only if `status = Sent` and unpaid → `422` if already `Paid` or not owned. Sends the same notification type as the automatic reminder (reuse `NotificationService`), records trigger time + `req.user.id` via `audit_events`.

---

## EPIC 4 — Lease Management and Maintenance Tracking

### F-10 — Digital Lease Tracking

#### US-LEASE-01 — Create a digital lease
- **Endpoint:** `POST /api/v1/leases`
- **Auth:** Landlord, must own the target room
- **Request:** `{ roomId, tenant: { fullName, phone, idNumber, email }, startDate, endDate, agreedRent, deposit }`
- **Response:** `201 { data: <lease>, meta: { tenantAccountProvisioned: boolean } }`
- **Business rules (this is the highest-risk transaction in the system — implement carefully):**
  1. Validate `roomId` belongs to the authenticated landlord → `404` otherwise.
  2. Validate tenant fields: `email`/`phone`/`idNumber` format; check uniqueness against **active** `tenant_info`/`users` records — but note a returning tenant (already has an account) should reuse their existing `tenant_info` rather than erroring (match by `idNumber` first; if found and active, reuse it and skip re-provisioning per US-TENANT-02's idempotency guard).
  3. `endDate > startDate`; `agreedRent >= 0`; `deposit >= 0`.
  4. No overlapping **Active** lease exists for `roomId` in `[startDate, endDate]` → `409 CONFLICT` otherwise.
  5. In one transaction: create/reuse `tenant_info`, create `leases` (`status=Active`), call `provisionTenantAccount` (US-TENANT-02, only if not already provisioned).
  6. On commit, the room's derived `status` becomes `Occupied` automatically (no write needed — derived field, architecture §4.6).
  7. Legally-binding e-signature is explicitly out of scope — this endpoint only stores the record.

#### US-LEASE-02 — View lease information
- **Endpoints:** `GET /api/v1/leases`, `GET /api/v1/leases/:id`
- **Auth:** Landlord (owned properties) or Tenant (own `tenant_info` link) — `404` for anyone else.
- **Response:** room, period, `agreedRent`, `deposit`, `status`.

#### US-LEASE-03 — Update or renew a lease
- **Endpoint:** `PATCH /api/v1/leases/:id`
- **Auth:** Landlord, owns the lease's room
- **Request:** `{ endDate?, agreedRent?, deposit? }` for edits; `{ renewalStartDate, renewalEndDate, agreedRent?, deposit? }` for a renewal (implement renewal as: end the current lease's period and create a new `Active` lease row linked to the same `tenant_info`+`room`, preserving history — do not mutate the original row's dates in place, so historical invoices still resolve to the correct lease period).
- **Business rules:** same date/monetary validation as creation; same overlap check against other leases on the room; updates `updatedAt`/audit event with responsible landlord.

#### US-LEASE-04 — End a lease and release a room
- **Endpoint:** `POST /api/v1/leases/:id/end`
- **Auth:** Landlord, owns the lease
- **Request:** `{ actualEndDate }`
- **Business rules:** sets `status = Ended`, `actualEndDate`, `endedBy`, `endedAt`. Room's derived status flips to `Vacant` automatically once no other `Active` lease references it (a room could theoretically have a queued future lease — only the *currently active* one matters for occupancy). Never deletes invoices/payments/readings/maintenance history tied to the lease.

### F-11 — Automated Lease Renewal Reminders

#### US-LEASE-05 — Receive a lease-expiration reminder
- **Trigger:** job `sendLeaseExpirationReminders` (architecture §8), daily; configuration via `PATCH /api/v1/properties/:propertyId/lease-reminder-config` (`{ remindAt30Days, remindAt15Days, remindAt7Days }`)
- **Business rules:** for each property with at least one flag enabled, find `Active` leases where `endDate - today` exactly equals an enabled offset (30, 15, or 7 days); notify **both** the owning landlord and the assigned tenant, deduped by `(leaseId, offsetDays)` (architecture §4.5); an `Ended`/`Expired` lease is excluded by the `status='Active'` filter.

#### US-LEASE-06 — View upcoming lease expirations
- **Endpoint:** `GET /api/v1/leases/upcoming-expirations`
- **Auth:** Landlord
- **Response:** active leases with `endDate` within the team's approved window (recommend: next 30 days, configurable constant `UPCOMING_EXPIRATION_WINDOW_DAYS`), each with property/room, tenant, `endDate`, and a link to the lease.
- **Business rules:** scoped to owned properties only; `Ended` leases excluded by `status='Active'` filter — this endpoint and US-DASH-04 must call the **same underlying service function** so their results never diverge.

### F-12 — Maintenance Request Submission

> **Status: US-MAINT-01 and US-MAINT-02 IMPLEMENTED.** The backend supports tenant submission, validated private photo storage, atomic request/photo persistence, landlord push notification, and tenant-scoped paginated list/detail reads with short-lived signed photo URLs. US-MAINT-03 through US-MAINT-05 remain not yet implemented.

#### US-MAINT-01 — Submit a maintenance request
- **Endpoint:** `POST /api/v1/maintenance-requests` (multipart, up to 3 photos)
- **Auth:** Tenant, must have an active lease on the target `roomId`
- **Request:** `{ roomId, title, description, photos[] }`
- **Business rules:** `title`/`description` required; 0–3 photos, each validated per architecture §9 before storage write (invalid file → reject whole request, no orphaned attachments — validate all files first, then persist). Insert `maintenance_requests` (`status=Pending`) + `maintenance_photos` in one transaction; notify the owning landlord (`NotificationService`, `linkRef: "maintenance:{id}"`).

#### US-MAINT-02 — View submitted maintenance requests
- **Endpoint:** `GET /api/v1/maintenance-requests` (Tenant: own submissions only)
- **Detail endpoint:** `GET /api/v1/maintenance-requests/:id` (Tenant: own submission only; out-of-scope IDs return the same `404` as missing IDs)
- **Response:** title, room, submission date, current `status`, photos.
- **Photo access:** database paths remain private; list/detail responses replace them with five-minute Supabase signed URLs only after the tenant ownership query succeeds.

### F-13 — Maintenance Status Tracking

#### US-MAINT-03 — Review maintenance requests
- **Endpoint:** `GET /api/v1/maintenance-requests?propertyId=&status=` (Landlord: owned properties, filterable/groupable by status)
- **Business rules:** merely viewing never changes `status`.

#### US-MAINT-04 — Update maintenance status
- **Endpoint:** `PATCH /api/v1/maintenance-requests/:id/status`
- **Auth:** Landlord, owns the request's room
- **Request:** `{ status: "Pending"|"InProgress"|"Completed" }`
- **Business rules:**
  - Allowed transitions: `Pending → InProgress`, `InProgress → Completed`, `Pending → Completed` (direct close allowed); reject a no-op transition to the **same** status with `422` (prevents "misleading duplicate history entries or notifications" per the acceptance criteria) — the endpoint is not simply idempotent-retry-safe here, a repeated identical call is explicitly rejected, unlike payment confirmation.
  - On a real transition: insert `maintenance_status_history` row, update `maintenance_requests.status` (+`completedAt` if transitioning to `Completed`), notify the tenant.

#### US-MAINT-05 — View maintenance history by room
- **Endpoint:** `GET /api/v1/rooms/:roomId/maintenance-requests`
- **Auth:** Landlord, owns the room
- **Response:** each request with title, requester, submission date, current status, and its full `maintenance_status_history`. Completed requests remain listed (no default status filter that hides them).

---

## EPIC 5 — Portfolio Performance Monitoring

### F-14 — Centralized Business Dashboard

> **Status: NOT YET IMPLEMENTED.** No `dashboard` module/router exists in the backend. Spec below describes intended behavior.

All dashboard endpoints are `GET`, Landlord-only, scoped to owned properties, and read-only (no side effects). Recommend a single aggregate endpoint plus focused sub-endpoints so the mobile app can lazy-load sections:

#### US-DASH-01 — View occupied room count
- **Endpoint:** `GET /api/v1/dashboard/occupancy`
- **Response:** `{ data: { occupiedRooms, totalRooms } }`
- **Business rules:** `totalRooms` = count of active (`deletedAt IS NULL`) rooms in owned properties; `occupiedRooms` = subset with a currently `Active` lease. No percentage field in the response (explicitly excluded per acceptance criteria — don't add one "for convenience"). `0 rooms` → `{ occupiedRooms: 0, totalRooms: 0 }`, no division performed at all here (there's no division in this metric, but keep it consistent with the report's occupancy-rate guard in US-REPORT-03).

#### US-DASH-02 — View monthly revenue summary
- **Endpoint:** `GET /api/v1/dashboard/revenue?month=YYYY-MM`
- **Response:** `{ data: { expectedRevenue, collectedRevenue, month } }`
- **Business rules:** "reporting-date rule" (also used in US-REPORT-02) = **expected** revenue sums `invoice_line_items` for invoices whose `billingPeriod = month`; **collected** revenue sums `payments.amount` whose `payments.verifiedAt` falls within that calendar month (collection can lag the billing period, so this is a different date field than `billingPeriod` — implement as one shared function `getRevenueSummary(landlordId, period)` used by both the dashboard and the report, so the two never disagree).

#### US-DASH-03 — View outstanding and overdue invoices
- **Endpoint:** `GET /api/v1/dashboard/outstanding`
- **Response:** `{ data: { outstandingTotal, overdueInvoices: [{ invoiceId, tenant, room, dueDate, amount }] } }`
- **Business rules:** `status != Paid` (i.e. `Sent`, unpaid) contributes to `outstandingTotal`; `overdueInvoices` additionally filters `dueDate < today`. Shares logic with US-PAYMENT-03 — same underlying query function.

#### US-DASH-04 — View upcoming lease expirations on the dashboard
- **Endpoint:** `GET /api/v1/dashboard/upcoming-expirations`
- **Business rules:** calls the exact same service function as US-LEASE-06 — do not re-implement the window/eligibility logic a second time.

### F-15 — Monthly Business Report and Analytics

> **Status: NOT YET IMPLEMENTED.** No `reports` module/router exists in the backend (the `reports` table exists with a `snapshot` column but is not read/written; `generateReportPdf` in `lib` is not implemented — only `generateInvoicePdf`). Spec below describes intended behavior.

#### US-REPORT-01 — Select a reporting period and generate a report
- **Endpoint:** `POST /api/v1/reports/generate`
- **Auth:** Landlord
- **Request:** `{ periodType: "month" | "custom", month?: "YYYY-MM", startDate?, endDate? }`
- **Response:** `{ data: { reportId, period: {...}, generatedAt, timezone, landlordId, financial: {...}, occupancy: {...}, maintenance: {...} } }` (sub-objects from US-REPORT-02/03/04 below, assembled by one orchestrating service call)
- **Business rules:** `startDate <= endDate` → `422` otherwise; a valid period with zero matching activity still returns `200` with all metrics present as zero/`N/A` (never `404`/error for "no data"). Persist the generated report (recommend a `reports` table storing the resolved period + a snapshot of the computed JSON) so US-REPORT-05's PDF export re-uses exactly this stored result rather than recomputing (avoids drift between the on-screen report and its PDF).

#### US-REPORT-02 — Analyze financial performance and debt
- **Business rules (computed as part of US-REPORT-01's response, `financial` object):**
  - `expectedRevenue` / `actualCollectedRevenue`, each broken down into `{ rent, electricity, water, surcharges }` — sum `invoice_line_items` by `type`, using the same reporting-date rule as US-DASH-02 (`billingPeriod` within the selected period for expected; `payments.verifiedAt` within the selected period for collected).
  - `totalOutstandingDebt` + `overdueInvoices: [{ invoiceId, tenant, room, dueDate, amount }]` — identical query to US-DASH-03, filtered additionally to the report's period where applicable (recommend: outstanding debt is a point-in-time figure as of `generatedAt`, not period-bound, matching the dashboard's semantics — state this explicitly in the API doc so a coding agent doesn't accidentally filter it by the report's date range).
  - Paid invoices excluded from debt; cross-landlord data excluded via the standard ownership scope.

#### US-REPORT-03 — Analyze occupancy, churn, and lease expirations
- **Business rules (`occupancy` object):**
  - `averageOccupancyRate = occupiedRoomDays / availableActiveRoomDays * 100`, computed by summing, for each active room, the number of days within the period it had an `Active` lease overlapping that day, divided by the number of days within the period the room existed and was active (not soft-deleted). If `availableActiveRoomDays = 0` → `"N/A"` (never divide by zero).
  - `moveIns` = leases whose `startDate` falls within the period; `moveOuts` = leases whose `actualEndDate` falls within the period.
  - `upcomingExpirations` = same service function as US-LEASE-06/US-DASH-04.
  - All scoped to the authenticated landlord's properties.

#### US-REPORT-04 — Analyze maintenance efficiency
- **Business rules (`maintenance` object):**
  - `newRequests` = count where `submittedAt` within period; `completedRequests` = count where `completedAt` within period (**regardless of when submitted** — a request submitted before the period but completed inside it still counts as completed-in-period; do not use current `status` alone, always use the timestamp fields).
  - `resolutionRate = completedRequests / newRequests` (or a cohort-based rate — pick one and document it in code comments) when enough data exists; otherwise `"N/A"`.
  - `averageResolutionTime` = mean of `(completedAt - submittedAt)` over requests completed in the period; `"N/A"` if no completed requests in the period.

#### US-REPORT-05 — Export a business report as PDF
- **Endpoint:** `GET /api/v1/reports/:reportId/pdf`
- **Auth:** Landlord, owns the report (`reports.landlordId = req.user.id`)
- **Business rules:** `generateReportPdf` (architecture §10) renders from the **stored** report snapshot (from US-REPORT-01), not a fresh recomputation — guarantees the PDF always matches what the landlord saw on screen. PDF header includes landlord identity, period, generation time, currency. Empty/`N/A` metrics render as `"N/A"`/`"—"`, never break layout (e.g. a table with zero rows still renders its headers).

---

## Appendix — Endpoint Index (for quick reference)

| Method | Path | Story |
|---|---|---|
| POST | /auth/register | US-AUTH-01 |
| POST | /auth/login | US-AUTH-02 |
| POST | /auth/logout | US-AUTH-03 |
| POST | /auth/change-password | US-AUTH-05 |
| POST | /auth/forgot-password | US-AUTH-06 |
| GET/PATCH | /profile | US-PROFILE-01 |
| POST/GET/PATCH | /properties[/:id] | US-PROPERTY-01/02 |
| POST/GET/PATCH | /properties/:id/rooms[/:id] | US-ROOM-01/02 |
| POST | /properties/:id/rooms/bulk | US-ROOM-03 |
| GET/PATCH | /tenants[/:id] | US-TENANT-01 |
| POST/GET | /properties/:id/utility-rates | US-UTILITY-01/02 |
| POST/GET/PATCH/DELETE | /properties/:id/surcharges[/:id] | US-CHARGE-01 |
| POST | /rooms/:id/meter-readings | US-METER-01/02 |
| POST | /meter-readings/:id/correct | US-METER-03 |
| (job) / POST | /properties/:id/invoices/generate | US-INVOICE-01 |
| GET | /invoices[/:id] | US-INVOICE-02 |
| GET | /invoices/:id/pdf | US-INVOICE-03 |
| POST | /invoices/:id/send | US-INVOICE-04 |
| GET/PUT | /payment-config | US-VIETQR-01 |
| GET | /invoices/:id/vietqr | US-VIETQR-02 |
| POST | /invoices/:id/payment-proofs | US-PAYMENT-01 |
| GET/POST | /payment-proofs, /invoices/:id/confirm-payment | US-PAYMENT-02 |
| GET | /payments/history | US-PAYMENT-03 |
| (job) | — | US-REMINDER-01 |
| POST | /invoices/:id/remind | US-REMINDER-02 |
| POST/GET/PATCH | /leases[/:id] | US-LEASE-01/02/03 |
| POST | /leases/:id/end | US-LEASE-04 |
| (job) / PATCH | /properties/:id/lease-reminder-config | US-LEASE-05 |
| GET | /leases/upcoming-expirations | US-LEASE-06 |
| POST | /maintenance-requests | US-MAINT-01 |
| GET | /maintenance-requests | US-MAINT-02/03 |
| PATCH | /maintenance-requests/:id/status | US-MAINT-04 |
| GET | /rooms/:id/maintenance-requests | US-MAINT-05 |
| GET | /dashboard/occupancy | US-DASH-01 |
| GET | /dashboard/revenue | US-DASH-02 |
| GET | /dashboard/outstanding | US-DASH-03 |
| GET | /dashboard/upcoming-expirations | US-DASH-04 |
| POST | /reports/generate | US-REPORT-01/02/03/04 |
| GET | /reports/:id/pdf | US-REPORT-05 |

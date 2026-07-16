# RosiHome — Feature Specifications (AI-Agent Ready)

> Companion to `01-ARCHITECTURE.md`. Read that file first — this document assumes its schema, response envelope, error codes, and module structure. Each feature below maps 1:1 to `product_backlog.md` (F-01…F-14). Every Acceptance Criterion (AC) is turned into an explicit rule, endpoint, or test.

Conventions used below:
- `Auth:` states which role(s) may call the endpoint. `owner-scoped` means the service layer must additionally verify the resource belongs to the caller (see Architecture §6).
- Request/response bodies are shown as TypeScript-flavored JSON; `?` marks optional fields.
- All money fields are `number`, VND, integer-safe (no decimals needed for VND in practice, but stored as `numeric(12,2)` for flexibility).

---

## F-01 · User Registration and Authentication
**Module:** `modules/auth/` · **Tables:** `users`, `password_reset_tokens`

### Endpoints
| Method | Path | Auth | Body / Query |
|---|---|---|---|
| POST | `/v1/auth/register` | public | `{ fullName, email?, phone?, password, confirmPassword, role: 'landlord'\|'tenant' }` |
| POST | `/v1/auth/login` | public | `{ identifier, password }` — identifier is email or phone |
| POST | `/v1/auth/refresh` | public (refresh cookie) | — |
| POST | `/v1/auth/logout` | authenticated | — |
| POST | `/v1/auth/forgot-password` | public | `{ identifier }` |
| POST | `/v1/auth/reset-password` | public | `{ token, newPassword, confirmPassword }` |
| GET | `/v1/auth/me` | authenticated | — |

### Rules (from AC)
- Reject if `email` and `phone` are both missing, or if `password !== confirmPassword` (`VALIDATION_ERROR`).
- Reject duplicate `email`/`phone` with `CONFLICT`.
- Password hashed with bcrypt (cost 10+); never return `password_hash` in any response.
- On login, verify hash; on failure return generic `UNAUTHENTICATED` — don't reveal whether the identifier exists.
- Every protected route uses `auth.middleware.ts`; role-restricted routes additionally use `rbac.middleware.ts`.
- Tenant calling a landlord-only route (e.g. `/v1/dashboard`) → `403 FORBIDDEN`.
- `forgot-password` always responds `200` with a generic message regardless of whether the identifier exists (avoid user enumeration); actual email/SMS only sent if a matching user exists.
- Reset token single-use: `used_at` set on successful reset; expired/used tokens → `VALIDATION_ERROR`.

### Tests to generate
- Register success (email path, phone path), duplicate email, password mismatch.
- Login success/failure, RBAC 403 on cross-role route, refresh token rotation, logout invalidates refresh token.

---

## F-02 · Property and Room Management
**Module:** `modules/properties/`, `modules/rooms/` · **Tables:** `properties`, `rooms`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/properties` | landlord |
| GET | `/v1/properties` | landlord, owner-scoped (list own) |
| GET | `/v1/properties/:propertyId` | landlord, owner-scoped |
| PATCH | `/v1/properties/:propertyId` | landlord, owner-scoped |
| DELETE | `/v1/properties/:propertyId` | landlord, owner-scoped — reject `CONFLICT` if any room has an active lease |
| POST | `/v1/properties/:propertyId/rooms` | landlord, owner-scoped |
| GET | `/v1/properties/:propertyId/rooms` | landlord, owner-scoped |
| PATCH | `/v1/rooms/:roomId` | landlord, owner-scoped |
| DELETE | `/v1/rooms/:roomId` | landlord, owner-scoped — reject if room has an active lease |

### Request bodies
```ts
// POST /v1/properties
{ name: string, address: string, description?: string,
  defaultElectricityRate?: number, defaultWaterRate?: number,
  waterBillingMethod?: 'per_m3' | 'per_person' }

// POST /v1/properties/:propertyId/rooms
{ name: string, baseRent: number,
  electricityRateOverride?: number, waterRateOverride?: number }
```

### Rules (from AC)
- `rooms.status` is **never** set directly by the client; it is derived. It flips to `'occupied'` only as a side effect of `leases.service.createLease()`, and back to `'vacant'` as a side effect of ending/terminating the lease (see F-10). The room update endpoint must reject any attempt to set `status` in the body (`VALIDATION_ERROR`).
- `(property_id, name)` unique — duplicate room name in the same property → `CONFLICT`.
- Property list view response includes each room's current `status` for the "clearly displayed" AC.

### Tests
- Create property/room, list shows correct occupancy status, duplicate room name rejected, status field immutable via API, delete blocked while occupied.

---

## F-03 · Tenant Profile Management
**Module:** `modules/tenants/` · **Tables:** `tenant_profiles`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/tenant-profiles` | landlord |
| GET | `/v1/tenant-profiles` | landlord, owner-scoped |
| GET | `/v1/tenant-profiles/:id` | landlord (owner-scoped) or tenant (self-scoped via `user_id`) |
| PATCH | `/v1/tenant-profiles/:id` | landlord, owner-scoped |
| POST | `/v1/tenant-profiles/:id/link-account` | landlord or tenant | `{ userId? }` — see below |

### Request body
```ts
{ fullName: string, phone: string, idCardNumber: string, email?: string }
```

### Rules (from AC)
- Unique `(landlord_id, id_card_number)` — duplicate → `CONFLICT` with message referencing the existing profile's name (helps landlord recognize the duplicate).
- Linking flow: either (a) landlord invites by generating a one-time link/code the tenant redeems at signup, setting `tenant_profiles.user_id`, or (b) an already-registered tenant enters an invite code shared by the landlord. MVP implementation: landlord's `POST /v1/tenant-profiles/:id/link-account` generates an invite code (short random string, stored in a small `invite_codes` table or reused `password_reset_tokens`-style table with `type='tenant_link'`); tenant redeems via `POST /v1/tenant-profiles/redeem-invite { code }` which sets `user_id` on the matching profile. Once linked, the tenant account gains dashboard access to that profile's leases/invoices/maintenance requests.
- A `tenant_profile_id` can only ever be linked to one `user_id` (enforced by the `unique` constraint on `tenant_profiles.user_id`).

### Tests
- Create profile, duplicate ID card rejected, invite/redeem flow links account, tenant can then see own data, tenant cannot see another tenant's profile.

---

## F-04 · Utility Pricing Configuration
**Module:** part of `modules/properties/` and `modules/rooms/` (no separate module — rates live on `properties`/`rooms`, see schema §5.3/§5.4)

### Endpoints
Rates are set via the existing `PATCH /v1/properties/:propertyId` and `PATCH /v1/rooms/:roomId` bodies (`defaultElectricityRate`, `defaultWaterRate`, `electricityRateOverride`, `waterRateOverride`).

### Rules (from AC)
- Effective rate resolution order used by billing (F-05): `room.electricityRateOverride ?? property.defaultElectricityRate`, same pattern for water.
- Reject negative or zero rates (`VALIDATION_ERROR`).
- `waterBillingMethod` on the property determines whether F-05's water calculation multiplies consumption (m³) or headcount (per person); if `'per_person'`, the "reading" workflow for water is skipped and the landlord instead confirms occupant count on the lease (`leases.occupant_count`, add this nullable int column to `leases` to support per-person billing).

### Tests
- Rate resolution fallback (room override present/absent), reject non-positive rate, per-person vs per-m3 method selection affects invoice calculation (covered jointly with F-05 tests).

---

## F-05 · Utility Meter Reading & Calculation
**Module:** `modules/utilities/` · **Tables:** `meter_readings`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/rooms/:roomId/meter-readings` | landlord, owner-scoped |
| GET | `/v1/rooms/:roomId/meter-readings?period=YYYY-MM` | landlord, owner-scoped |

### Request body
```ts
{ period: string /* 'YYYY-MM-01' */, electricityReading: number, waterReading: number }
```

### Response includes calculated preview
```ts
{
  id, period, electricityReading, waterReading,
  previousElectricityReading: number | null,
  previousWaterReading: number | null,
  electricityConsumption: number,   // current - previous, 0 if no previous
  waterConsumption: number,
  electricityAmount: number,        // consumption * effective rate
  waterAmount: number
}
```

### Rules (from AC)
- Service fetches the prior period's row (`period` one calendar month earlier for the same `room_id`) and returns it for reference; if none exists, treat previous reading as `0` for consumption calc (first-month behavior) and flag `isFirstReading: true` in the response so the frontend can show a warning instead of a false consumption spike.
- Validation: `electricityReading >= previousElectricityReading` and `waterReading >= previousWaterReading`, else `VALIDATION_ERROR` with `field` set so the frontend can show an inline error exactly on the offending input.
- `(room_id, period)` unique — resubmitting the same period is an **update** (`PUT` semantics via the same POST endpoint, upsert) not a duplicate error, so landlords can correct entry mistakes before invoicing.
- Calculation is a pure function `calculateUtilityCharge(consumption, rate)` in `lib/`, unit tested directly with table-driven cases.

### Tests
- First reading (no previous) doesn't error, subsequent reading below previous rejected with correct field, correct amount calculation for both electricity and water, per-person water method bypasses reading requirement.

---

## F-06 · Billing and Invoice Generation
**Module:** `modules/invoices/` · **Tables:** `invoices`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/leases/:leaseId/invoices/generate` | landlord, owner-scoped — manual trigger (also called internally by the daily cron, §9 of Architecture) |
| GET | `/v1/invoices` | landlord (owner-scoped, filterable by `roomId`, `status`, `period`) or tenant (self-scoped to own leases) |
| GET | `/v1/invoices/:id` | landlord (owner-scoped) or tenant (owner-scoped via lease) |
| GET | `/v1/invoices/:id/pdf` | landlord or tenant, owner-scoped — streams a generated PDF |

### Response body
```ts
{
  id, leaseId, roomId, period, dueDate, status,
  breakdown: { rent: number, electricity: number, water: number, otherFees: number, otherFeesNote?: string },
  totalAmount: number,
  vietQrUrl: string,      // see Architecture §8
  paymentStatus: 'pending_proof' | 'pending_verification' | 'verified'
}
```

### Rules (from AC)
- Generation requires: an active lease, a meter reading for the target period already recorded (unless `waterBillingMethod = 'per_person'` for the water leg), and the landlord's bank fields (`bankId`, `bankAccountNo`, `bankAccountName`) populated — otherwise return `VALIDATION_ERROR` listing exactly what's missing (frontend surfaces this as an actionable checklist).
- `totalAmount = rent_amount + electricity_amount + water_amount + other_fees_amount`, computed server-side only, never trusted from client input.
- `due_date` default: `period + configurable grace days` (default 10 days after period start) — expose as a landlord setting later; hardcode 10 for MVP.
- Both landlord and tenant can `GET`/PDF the invoice, but only the tenant who owns the lease or the owning landlord — enforced in service layer.
- PDF generation: server-side HTML→PDF (e.g. `puppeteer` or a lightweight template lib) rendering the same `breakdown` fields plus the VietQR image.

### Tests
- Generation blocked with clear validation errors when prerequisites missing, correct total calculation, tenant can view own invoice, tenant cannot view another tenant's invoice (403), PDF endpoint returns `application/pdf`.

---

## F-07 · VietQR Payment Integration
**Module:** `lib/vietqr.ts`, consumed by `modules/invoices/`

### Contract
```ts
function buildVietQrUrl(params: {
  bankId: string; accountNo: string; accountName: string;
  amount: number; roomName: string; period: string; // 'YYYY-MM'
}): string
```
Returns the `img.vietqr.io` URL described in Architecture §8. `addInfo` message format: `` `RH ${roomName} T${MM}${YYYY}` `` — deterministic, no special characters, ASCII only (strip diacritics from `roomName` if needed since VietQR message fields are typically ASCII-safe).

### Rules (from AC)
- `vietQrUrl` is embedded directly in the `GET /v1/invoices/:id` response (§F-06) — there is no separate `/qr` endpoint, since the QR is just an image URL derived deterministically from invoice + landlord bank data, nothing to store.
- Amount and message must exactly match `invoice.totalAmount` and the room/period — covered by a unit test asserting URL query params.
- If landlord bank fields are missing, invoice generation itself is blocked (see F-06) rather than generating a QR-less invoice.

### Tests
- URL construction unit tests (happy path, diacritic stripping, amount formatting as integer VND with no thousands separators since VietQR expects a raw number).

---

## F-08 · Payment Verification and Tracking
**Module:** `modules/payments/` · **Tables:** `payments`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/invoices/:invoiceId/payment-proof` | tenant, owner-scoped — `multipart/form-data`, field `proofImage` |
| GET | `/v1/invoices/:invoiceId/payment` | landlord or tenant, owner-scoped |
| POST | `/v1/invoices/:invoiceId/payment/verify` | landlord, owner-scoped |

### Rules (from AC)
- File constraints enforced by `upload.middleware.ts`: `.png/.jpg/.jpeg` only, ≤5MB, else `VALIDATION_ERROR`.
- On successful upload: create `payments` row if absent (`status='pending_verification'`, `proof_image_url`, `proof_uploaded_at`) or update existing; trigger `notifications.service.createNotification` to the landlord (`type: 'payment_proof_uploaded'`).
- `POST .../verify` (landlord only): sets `payments.status='verified'`, `verified_by`, `verified_at`; cascades to `invoices.status='paid'`, `invoices.paid_at=now()`. This is a manual action — never automatic — per the explicit "RosiHome never verifies payments automatically" assumption.
- Re-uploading a proof after verification is blocked (`CONFLICT`) — landlord must be contacted to reverse verification manually via a future admin action (out of MVP scope to auto-support un-verify).
- Payment history endpoint (`GET /v1/invoices?status=paid` combined with existing invoice list, no separate "payment history" table needed — it's a filtered view of invoices+payments) — document this explicitly so the AI agent doesn't build a redundant table.

### Tests
- Upload rejects wrong mime/oversize, upload triggers landlord notification, verify flips invoice to paid, verify is landlord-only (tenant attempt → 403), double-verify blocked.

---

## F-09 · Rent Payment Reminders
**Module:** `modules/notifications/` + `jobs/payment-reminder.job.ts` · **Tables:** `notifications`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/invoices/:invoiceId/remind` | landlord, owner-scoped — manual trigger |
| GET | `/v1/notifications` | authenticated, self-scoped |
| PATCH | `/v1/notifications/:id/read` | authenticated, self-scoped |

### Rules (from AC)
- Cron job (Architecture §9) finds `invoices` where `status='unpaid' AND due_date < today`, flips `status='overdue'`, and creates a `notifications` row (`channel='both'`) for the tenant on the lease.
- Manual trigger endpoint creates the same notification shape without waiting for the cron, usable on any `unpaid` or `overdue` invoice; rate-limit to once per hour per invoice to avoid spam (`CONFLICT` if triggered again within the window — store `last_reminded_at` on `invoices`, add this nullable timestamptz column).

### Tests
- Cron flips overdue status correctly for exactly-due-date boundary, manual trigger creates notification, manual trigger rate-limited.

---

## F-10 · Digital Lease Tracking
**Module:** `modules/leases/` · **Tables:** `leases`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/leases` | landlord, owner-scoped (room must belong to landlord) |
| GET | `/v1/leases` | landlord (owner-scoped) or tenant (self-scoped) |
| GET | `/v1/leases/:id` | landlord or tenant, owner-scoped |
| PATCH | `/v1/leases/:id` | landlord, owner-scoped — for corrections before it's relied upon; restrict which fields are editable once invoices exist against it (rent_amount edits should not retroactively change past invoices) |
| POST | `/v1/leases/:id/end` | landlord, owner-scoped | `{ endDate?, reason: 'ended' \| 'terminated' }` |

### Request body (create)
```ts
{ roomId: string, tenantProfileId: string, startDate: string, endDate: string,
  rentAmount: number, depositAmount?: number, occupantCount?: number }
```

### Rules (from AC)
- Reject creation if the room already has a `status='active'` lease (`CONFLICT`) — this is the DB-less uniqueness rule noted in Architecture §5.6.
- On successful create: set `rooms.status='occupied'` in the same transaction.
- On `POST .../end`: set `leases.status` to the given reason, and if no other active lease exists for the room, set `rooms.status='vacant'`. Both writes happen in one DB transaction to avoid inconsistent state.
- Lease is visible to both the owning landlord and the linked tenant (`tenant_profiles.user_id` match) — enforced in service layer's ownership check.

### Tests
- Create sets room occupied, duplicate active lease rejected, end sets room vacant, end with another active lease present keeps room occupied (edge case for multi-tenant rooms — unlikely in MVP but guard anyway), tenant can view own lease, tenant cannot view another's.

---

## F-11 · Automated Lease Renewal Reminders
**Module:** `jobs/lease-renewal-reminder.job.ts` · **Tables:** `leases`, `notifications`

### Rules (from AC)
- Daily job (cron spec in Architecture §9): `WHERE status='active' AND end_date = today + 30 AND renewal_reminder_sent_at IS NULL`.
- For each match: create notifications for both the landlord and the linked tenant user (skip tenant notification if `tenant_profiles.user_id IS NULL`), `channel='both'`, then stamp `renewal_reminder_sent_at=now()` so the job is idempotent even if it runs twice in a day.
- Dashboard "upcoming expirations" widget (F-14) queries `leases WHERE status='active' AND end_date BETWEEN today AND today+30` directly — independent of whether the reminder has fired, so it's always accurate even before the 30-day mark.

### Tests
- Exactly-30-days-out lease triggers reminder once, re-running job same day doesn't double-send, tenant without linked account doesn't crash the job (graceful skip), dashboard widget shows leases inside the window regardless of reminder state.

---

## F-12 · Maintenance Request Submission
**Module:** `modules/maintenance/` · **Tables:** `maintenance_requests`, `maintenance_status_logs`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| POST | `/v1/maintenance-requests` | tenant, owner-scoped (must own the lease/room) — `multipart/form-data`, up to 3 files under field `photos` |
| GET | `/v1/maintenance-requests` | landlord (owner-scoped across their rooms) or tenant (self-scoped) |
| GET | `/v1/maintenance-requests/:id` | landlord or tenant, owner-scoped |

### Request body
```ts
{ roomId: string, title: string, description: string } // + up to 3 files
```

### Rules (from AC)
- Reject >3 photos (`VALIDATION_ERROR`), same mime/size constraints as F-08 (png/jpg/jpeg, 5MB each).
- On create: initial `maintenance_status_logs` row with `status='pending'`; notify the landlord (`type: 'maintenance_update'`) immediately.
- Tenant list view filters to requests raised from their own `tenant_profile_id`.

### Tests
- Create with 3 photos succeeds, 4th photo rejected, landlord gets notified immediately, tenant sees only their own requests.

---

## F-13 · Maintenance Status Tracking
**Module:** `modules/maintenance/` (same module as F-12) · **Tables:** `maintenance_requests`, `maintenance_status_logs`

### Endpoints
| Method | Path | Auth |
|---|---|---|
| PATCH | `/v1/maintenance-requests/:id/status` | landlord, owner-scoped | `{ status: 'pending' \| 'in_progress' \| 'completed' }` |
| GET | `/v1/rooms/:roomId/maintenance-history` | landlord, owner-scoped |

### Rules (from AC)
- Any status transition is allowed (dropdown, not a strict state machine per the AC's wording) but every transition appends a new `maintenance_status_logs` row — never mutate history, only append.
- Every status change triggers a tenant notification (`type: 'maintenance_update'`), skipped only if the request has no linked tenant user account (still visible in-app once they link later, via the persisted log).
- History endpoint returns `maintenance_requests` joined with their full `maintenance_status_logs` ordered by `changed_at`, scoped to a room, for the landlord's per-room history view.

### Tests
- Status update appends log row (not overwrite), tenant notified on each change, history endpoint returns full chronological log, landlord-only access enforced.

---

## F-14 · Centralized Business Dashboard
**Module:** `modules/dashboard/` · **Tables:** reads across `rooms`, `invoices`, `leases`, `payments` (read-only aggregation, no new tables)

### Endpoint
| Method | Path | Auth |
|---|---|---|
| GET | `/v1/dashboard` | landlord, owner-scoped | optional `?propertyId=` to scope to one property |

### Response body
```ts
{
  occupancyRate: number,              // occupiedRooms / totalRooms, 0 if no rooms
  totalRooms: number,
  occupiedRooms: number,
  revenue: { expected: number, collected: number, period: string }, // current month
  outstandingTotal: number,           // sum of unpaid + overdue invoice totalAmount
  overdueInvoices: Array<{ id, roomName, tenantName, amount, dueDate }>,
  upcomingLeaseExpirations: Array<{ leaseId, roomName, tenantName, endDate }>
}
```

### Rules (from AC)
- `revenue.expected` = sum of `totalAmount` for all invoices in the current period regardless of status; `revenue.collected` = sum where `status='paid'`.
- `overdueInvoices` and `upcomingLeaseExpirations` are capped (e.g. top 10 by due date / end date ascending) with a `total` count in `meta` so the frontend can offer a "view all" link to the filtered invoices/leases list views rather than duplicating full list logic in the dashboard endpoint.
- All aggregation queries are scoped to `landlord_id` via a join from `rooms → properties.landlord_id` — never trust a client-supplied landlord id.
- This endpoint should be implemented as a handful of targeted SQL aggregate queries (via Drizzle) rather than loading full row sets into memory and reducing in JS, to keep it fast as portfolios grow toward the 30-unit ceiling mentioned in the project assumptions.

### Tests
- Occupancy rate calculation with mixed vacant/occupied, revenue expected vs collected split correctly, outstanding total matches sum of unpaid+overdue, capped lists respect the limit, cross-landlord data never leaks into another landlord's dashboard.

---

## Cross-Cutting Notification Matrix

| Trigger | Recipient(s) | Type |
|---|---|---|
| Invoice generated | tenant | `invoice_generated` |
| Invoice overdue (cron) | tenant | `payment_reminder` |
| Manual reminder (F-09) | tenant | `payment_reminder` |
| Payment proof uploaded (F-08) | landlord | `payment_proof_uploaded` |
| Lease 30 days from expiry (F-11) | landlord + tenant | `lease_renewal` |
| Maintenance request created (F-12) | landlord | `maintenance_update` |
| Maintenance status changed (F-13) | tenant | `maintenance_update` |

This table is the single source of truth for wiring `notifications.service.createNotification(...)` calls — every row here should correspond to exactly one call site in the codebase, referenced by the feature's own module rather than centralized, so ownership stays with the module that knows the business context.

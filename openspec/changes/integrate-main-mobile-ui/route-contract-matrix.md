# Route and Contract Matrix

> Static audit on 2026-08-12. `Present` means a canonical route exists. `Wired` means the route calls a current backend path; it does not mean integration/UAT is complete. Backend source and `backend/docs/openapi.yaml` were checked, but runtime behavior was not exercised in this audit.

## Status legend

- **Wired:** current UI calls a source-backed and OpenAPI-documented route.
- **Partial:** some contract or interaction exists, but required behavior, typing, envelope handling, native behavior, or evidence is incomplete.
- **Client-only:** navigation/information route with no server contract.
- **Missing UI:** backlog/backend capability has no canonical mobile route.
- **Contract gap:** desired interaction is not fully supported by the current public contract.

## Canonical route inventory

| Canonical route | Primary interaction | Story / role | Backend contract | Envelope | OpenAPI | Current state and gap |
|---|---|---|---|---|---|---|
| `/` | Landing; choose register or login | Product entry / Public | None | None | N/A | **Client-only**; route shell evidence only |
| `/register` | Landlord self-registration, then login | US-AUTH-01 / Public | `POST /auth/register`, `POST /auth/login` | `{ data }` | Yes | **Partial**; wired, but auto-login and persistent session require integration evidence |
| `/login` | Login and route by role/must-change-password | US-AUTH-02 / Public | `POST /auth/login`, `GET /profile` | `{ data }` | Yes | **Partial**; role routing exists; remember-me/refresh and error mapping need verification |
| `/forgot-password` | Request password recovery | US-AUTH-06 / Public | `POST /auth/forgot-password` | `{ data }` | Yes | **Wired**; email delivery and anti-enumeration need separate evidence |
| `/reset-sent` | Inform user that recovery email was requested | US-AUTH-06 / Public | None beyond preceding request | None | N/A | **Client-only**; copy must match actual temporary-password/reset behavior |
| `/change-password` | Authenticated password change | US-AUTH-05 / Authenticated | `POST /auth/change-password` | `{ data }` | Yes | **Partial**; wired; success/session behavior needs verification |
| `/force-change-password` | Tenant changes temporary password | US-AUTH-05, US-TENANT-02 / Tenant | `POST /auth/change-password`, `GET /profile` | `{ data }` | Yes | **Partial**; currently always routes to Tenant and does not refresh `mustChangePassword` state after success |
| `/profile` | View/update profile, logout, open password flow | US-PROFILE-01, US-AUTH-03 / Both | `GET/PATCH /profile`, `POST /auth/logout` | `{ data }` | Yes | **Partial**; update/logout wired; native/session and field-contract evidence pending |
| `/landlord` | Portfolio dashboard and navigation | US-DASH-01..04 / Landlord | `GET /dashboard/{occupancy,revenue,outstanding}`, `GET /leases/upcoming-expirations`, `GET /properties` | `{ data }`, list `{ data, meta }` | Yes | **Partial**; real endpoints used but DTOs are `any`, pagination meta is discarded, and UAT is pending |
| `/landlord/properties` | List/load-more/delete owned properties | US-PROPERTY-02 / Landlord | `GET /properties`, `DELETE /properties/:id` | `{ data, meta }`, `{ data }` | Yes | **Wired**; typed adapter uses authoritative pagination metadata; ownership/runtime evidence remains in Task 4.5 |
| `/landlord/properties/new` | Create property with initial utility rates and optional surcharges | US-PROPERTY-01 / Landlord | `POST /properties` | `{ data }` | Yes | **Wired**; typed request/response; validation/conflict evidence pending |
| `/landlord/properties/:id` | Property detail, paged rooms, room delete, configuration links | US-PROPERTY-02, US-ROOM-02 / Landlord | `GET /properties/:id`, `GET /rooms/properties/:id`, `DELETE /rooms/:id` | `{ data }`, list `{ data, meta }` | Yes | **Wired**; typed Room `status/baseRent` and Property `units/occupied` are used; runtime evidence pending |
| `/landlord/properties/:id/edit` | Update property | US-PROPERTY-02 / Landlord | `GET/PATCH /properties/:id` | `{ data }` | Yes | **Wired**; `locality` is now serialized and documented; ownership behavior needs evidence |
| `/landlord/properties/:id/rooms/new` | Create one or many rooms | US-ROOM-01, US-ROOM-03 / Landlord | `POST /rooms/properties/:id`, `POST /rooms/properties/:id/bulk` | `{ data }` | Yes | **Wired**; one room uses single-create and multiple rooms use atomic bulk; conflict evidence pending |
| `/landlord/properties/:id/rooms/:roomId` | View/update room and enter room operations | US-ROOM-02 / Landlord | `GET/PATCH /rooms/:roomId` | `{ data }` | Yes | **Wired**; typed fields prevent occupancy mutation; canonical Meter and room-maintenance navigation is present |
| `/landlord/properties/:id/utilities` | View/create/update/delete effective utility rates | US-UTILITY-01/02 / Landlord | `GET/POST /utilities/properties/:id/utility-rates`, `DELETE /utilities/properties/:id/utility-rates/:rateId` | `{ data }` | Yes | **Wired**; typed current/upcoming mapping preserves zero-valued rates; runtime ownership/regulatory-fallback evidence remains in Task 4.5 |
| `/landlord/properties/:id/surcharges` | List/create/update/delete recurring surcharges | US-CHARGE-01 / Landlord | `GET/POST /charges/properties/:id/surcharges`, `PATCH/DELETE /charges/:id` | list `{ data, meta }`, actions `{ data }` | Yes | **Wired**; current versions schedule a future change while only upcoming versions are patched; runtime overlap/deletion evidence remains in Task 4.5 |
| `/landlord/properties/:id/reminders` | View/update 30/15/7-day lease reminders | US-LEASE-05 / Landlord | `GET/PATCH /properties/:id/lease-reminder-config` | `{ data }` | Yes | **Wired**; typed config matches the three backend booleans and UI copy separates save success from push delivery; scheduled delivery/dedupe UAT remains an external gate |
| `/landlord/tenants` | List tenants and open lease creation | US-TENANT-01 / Landlord | `GET /tenants` | `{ data, meta }` | Yes | **Wired**; typed list consumes the standard pagination envelope; runtime ownership evidence remains in Task 4.5 |
| `/landlord/tenants/:id` | View/update/archive tenant | US-TENANT-01 / Landlord | `GET/PATCH/DELETE /tenants/:id` | `{ data }` | Yes | **Wired**; phone/login synchronization copy matches the contract; archive constraints remain in Task 4.5 |
| `/landlord/leases` | List leases | US-LEASE-02 / Landlord | `GET /leases` | `{ data, meta }` | Yes | **Wired**; typed lifecycle/status mapping and pagination envelope are integrated |
| `/landlord/leases/new` | Load properties/rooms and create lease with tenant identity | US-LEASE-01, US-TENANT-02 / Landlord | `GET /properties`, `GET /rooms/properties/:id`, `POST /leases` | Lists `{ data, meta }`; create `{ data, meta }` | Yes | **Wired**; only vacant rooms are offered, provisioning metadata is preserved, local calendar dates avoid UTC drift, and email delivery is not falsely confirmed |
| `/landlord/leases/:id` | View/update/end lease | US-LEASE-02/03/04 / Landlord | `GET/PATCH /leases/:id`, `POST /leases/:id/end` | `{ data }` | Yes | **Wired**; typed edit/renew/end actions are limited to Active leases; unsupported placeholder invoice content was removed |
| `/landlord/leases/expiring` | View upcoming expirations | US-LEASE-06 / Landlord | `GET /leases/upcoming-expirations` | `{ data }` | Yes | **Wired**; typed expiration DTO; date window and ownership evidence remain in Task 4.5 |
| `/landlord/invoices` | List/filter landlord invoices | US-INVOICE-02 / Landlord | `GET /invoices` | `{ data, meta }` | Yes | **Partial**; UI casts response to `any`, discards meta, and generation entry is absent |
| `/landlord/invoices/:id` | View invoice, send draft, access PDF, preview VietQR, open lease | US-INVOICE-02/03/04, US-VIETQR-02 / Landlord | `GET /invoices/:id`, `POST /invoices/:id/send`, `GET /invoices/:id/pdf`, `GET /invoices/:id/vietqr` | `{ data }`; PDF binary | Yes | **Partial**; VietQR preview is available after Draft; authenticated native invoice-PDF behavior remains Task 5.2 |
| `/landlord/notifications`, `/tenant/notifications` | Role-aware notification center, device push toggle and supported deep links | Cross-cutting notification criteria / Both | `GET /notifications`, `POST/DELETE /notifications/device-tokens` | `{ data }` | Yes | **Wired**; typed shared UI maps Invoice, Maintenance and Lease references without fabricating read state; physical-device push delivery remains Task 6.5/7.3 |
| `/tenant` | Tenant summary and navigation | Tenant dashboard / Tenant | `GET /dashboard/tenant` | `{ data }` | Yes | **Partial**; active `roomId` is now documented and supports Maintenance submission; dashboard route still uses a local `any` DTO and runtime UAT is pending |
| `/tenant/invoices` | List tenant invoices | US-INVOICE-02 / Tenant | `GET /tenant-invoices` | `{ data, meta }` | Yes | **Partial**; meta discarded; paid/sent filtering and empty/error evidence pending |
| `/tenant/invoices/:id` | View assigned invoice, access PDF, open VietQR, and enter proof upload | US-INVOICE-02/03, US-VIETQR-02, US-PAYMENT-01 / Tenant | `GET /invoices/:id`, `GET /invoices/:id/pdf`, `GET /invoices/:id/vietqr` | `{ data }`; PDF binary | Yes | **Partial**; VietQR and payment-proof entries are present; authenticated native invoice-PDF remains Task 5.2 |
| `/landlord/invoices/:id/vietqr`, `/tenant/invoices/:id/vietqr` | Display/share the exact payable QR amount, description and payload | US-VIETQR-02 / Both authorized roles | `GET /invoices/:id/vietqr` | `{ data }` | Yes | **Wired**; shared role-aware UI states that QR display never changes payment status; real banking-app scan remains Task 5.5/7.3 |
| `/landlord/reports` | Select month/custom period, render financial/occupancy/lease/maintenance analytics, export PDF | US-REPORT-01..05 / Landlord | `POST /reports/generate`, `GET /reports/:id/pdf` | `{ data }`; PDF binary | Yes | **Wired**; authenticated native PDF download/share is implemented; data reconciliation and readable-device UAT remain acceptance gates |
| `/tenant/reports` | Month-filtered personal invoice/payment summary | Tenant convenience UI / Tenant | `GET /payments/history` | `{ data }` | Yes | **Wired with role boundary**; does not call landlord-only Report endpoints or fabricate tenant PDF export |
| `/tenant/invoices/:id/upload-proof` | Select, preview, validate and upload one payment-proof image | US-PAYMENT-01 / Tenant | `POST /invoices/:id/payment-proofs` | `{ data }` | Yes | **Wired**; multipart field `proof`, JPG/PNG and 5 MB UI validation match the existing contract; physical-device/private-storage UAT remains pending |
| `/tenant/lease` | View current lease summary | US-LEASE-02 / Tenant | Currently reuses `GET /dashboard/tenant` | `{ data }` | Source-backed; OpenAPI missing | **Partial / contract gap**; no dedicated lease-detail request and source route is undocumented in OpenAPI |

## Missing canonical mobile routes

| Capability | Stories | Backend/OpenAPI state | Required mobile work | Evidence boundary |
|---|---|---|---|---|
| `/landlord/properties/:id/rooms/:roomId/meters`, `/meters/:readingId` | Meter baseline/monthly entry, active history, period context and correction | US-METER-01/02/03 / Landlord | `GET/POST /rooms/:roomId/meter-readings`, `POST /meter-readings/:id/correct` | list `{ data, meta }`, actions `{ data }` | Yes | **Wired**; read-only owned-room list contract was added so correction targets are selectable; Draft-invoice enforcement remains server-authoritative |
| `/tenant/maintenance`, `/tenant/maintenance/new`, `/tenant/maintenance/:id` | Submit/list/detail maintenance requests with up to three photos | US-MAINT-01/02 / Tenant | `GET/POST /maintenance-requests`, `GET /maintenance-requests/:id`, `GET /dashboard/tenant` for active `roomId` | list `{ data, meta }`, actions `{ data }` | Yes | **Wired**; binary-safe FormData, camera/library permissions, and client count/size checks supplement server validation |
| `/landlord/maintenance`, `/landlord/maintenance/:id`, `/landlord/properties/:id/rooms/:roomId/maintenance` | Filter/list/detail, allowed status advancement, and room history | US-MAINT-03/04/05 / Landlord | `GET /maintenance-requests`, `GET /maintenance-requests/:id`, `PATCH /maintenance-requests/:id/status`, `GET /rooms/:roomId/maintenance-requests` | `{ data, meta }`, `{ data }` | Yes | **Wired**; backend owns visibility and transition rules; private-photo and push delivery UAT remain external gates |
| Invoice generation | US-INVOICE-01 | `POST /properties/:propertyId/invoices/generate` documented | Add property/period trigger and skipped-room result UX | Calculation tests and missing-reading skip evidence |
| Payment configuration | US-VIETQR-01 | `GET/PUT /payment-config` documented | Add Landlord settings route | Ownership and bank-field validation |
| VietQR display | US-VIETQR-02 | `GET /invoices/:id/vietqr` documented | **Implemented for assigned Tenant and permitted Landlord preview** | Real banking-app/sandbox scan; QR must not change payment state |
| Payment proof upload | US-PAYMENT-01 | Multipart `POST /invoices/:id/payment-proofs` documented | **Implemented in canonical Tenant invoice route** | Physical-device picker, MIME/size/private-storage checks remain UAT |
| Proof queue and confirmation | US-PAYMENT-02 | `GET /payment-proofs`, `POST /invoices/:id/confirm-payment` documented | Add Landlord pending queue/detail/action | Double-confirm conflict, ownership and notification evidence |
| Payment history | US-PAYMENT-03 | `GET /payments/history` documented | Add role-scoped history/outstanding route | Pagination/filter and cross-role ownership evidence |
| Manual payment reminder | US-REMINDER-02 | `POST /invoices/:id/remind` now exists in source and OpenAPI | Add Landlord invoice action with delivery-result state | Push delivery/dedupe separate from request success |
| Maintenance submission/list/detail/status/history | US-MAINT-01..05 | All required JSON/multipart routes documented | Add Tenant and Landlord route groups and room-history link | Device media, private storage, allowed transitions, push UAT |
| Device-token lifecycle and Tenant notifications | Cross-cutting | `POST/DELETE /notifications/device-tokens`; `GET /notifications` documented | **Implemented with shared role-aware Notification Center and response routing** | Physical-device permission and Expo delivery receipts remain UAT |
| Full dashboard contract | US-DASH-01..04 | Landlord metrics documented; `/dashboard/tenant` source-only | Type DTOs, document Tenant endpoint, map loading/empty/error states | Integration with seeded/owned data |
| Reports and PDF | US-REPORT-01..05 | Landlord-only `POST /reports/generate`, `GET /reports/:id/pdf` documented | **Implemented for Landlord; Tenant receives a separate authorized personal-payment report** | Metric reconciliation and readable native PDF UAT |

## Pre-baseline module classification

This classification refers to tracked pre-baseline modules at `HEAD` plus the checkpoint in `stash@{0}`. The stash must not be applied over the canonical route tree.

| Pre-baseline area | Classification | Decision |
|---|---|---|
| `src/features/auth` routes/screens | **Replaced** | Keep canonical auth screens; port only contract/error behavior proven better than the current context |
| `src/core/api`, `src/lib/api`, auth context changes | **Port** | Consolidate base URL, envelopes, refresh concurrency, storage and multipart support into one client |
| `src/features/properties`, `src/features/rooms` screens | **Replaced** | Canonical property/room routes already cover the presentation; reuse only validated DTO mapping or bulk logic |
| `src/features/settings` utility/surcharge/profile screens | **Replaced** | Canonical property configuration and profile routes exist; payment settings remains a **Port** candidate because its route is missing |
| `src/features/leases` screens | **Replaced** | Canonical lease routes exist; port typed models/mappers only after contract comparison |
| `src/features/billing` | **Port** | Meter entry/correction, invoice mapping and VietQR behavior cover missing/partial canonical flows |
| `src/features/payments` and media helper | **Port** | Payment configuration, proof upload/history and binary picker behavior are required missing flows |
| `src/features/maintenance` and media helper | **Port** | Required missing Tenant/Landlord flows; keep DTO/mapper/media behavior only after source-contract review |
| `src/features/tenant` | **Mixed: Replaced + Port** | Invoice/lease screens are replaced; notification mapping and any richer API adapters may be ported |
| `src/features/dashboard`, `src/features/home` | **Remove/Port selectively** | Do not restore duplicate dashboards; port only typed metric mapping that matches current endpoints |
| `src/core/data/MockAppDataProvider` and feature mock data | **Remove** | Mock data is not production evidence and must not become the canonical runtime provider |
| `src/ui/**`, old themed components and duplicate primitives | **Remove** | Canonical `main` visual system is the approved presentation baseline |
| Root forwarding routes such as `invoices.tsx`, `maintenance.tsx`, `vietqr.tsx` | **Remove** | Do not restore duplicate route aliases; add missing flows inside the canonical role-aware tree |
| Generated Expo/export directories | **Remove/ignore** | Generated output is verification evidence only and stays untracked |

## Cross-cutting gaps discovered

1. `apiRequest()` strips list `meta`; several screens implement pagination from array length or hard-coded `pageSize`.
2. `apiRequest()` and `apiRequestWithEnvelope()` duplicate refresh/error logic and do not support `FormData`/binary responses.
3. Refresh can only run when a refresh token was persisted; the current non-remembered session stores neither token beyond React state.
4. Forced-password success always routes to Tenant and does not refresh the profile/must-change-password flag.
5. Many canonical screens use `any`, so typecheck does not prove DTO compatibility.
6. `/dashboard/tenant` exists in backend source but is missing from OpenAPI.
7. Static PDF URLs/actions require an authenticated native download/open design; JSON `apiRequest()` cannot handle them.
8. Current notifications cover only a Landlord list route; token registration, Tenant access and deep links remain incomplete.
9. Meter list/correction is now resolved by the documented read-only `GET /rooms/:roomId/meter-readings` contract; runtime PostgreSQL/UAT evidence remains pending.
10. External UAT remains outstanding for email, Expo push, private file storage, banking-app VietQR scan, and readable PDFs.

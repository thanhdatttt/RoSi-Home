# RosiHome Backlog-Synchronized Billing and VietQR PoC

This executable Proof of Concept validates the RosiHome billing workflow against F-05 through F-08 in `docs/product_backlog.md`. It uses the three-layer stack selected in `docs/architecture.md`:

- React web presentation layer;
- Node.js/Express REST API;
- PostgreSQL-compatible PGlite with Drizzle ORM;
- JWT demo authentication with backend role/ownership enforcement;
- VietQR/EMVCo payload and QR PNG generation; and
- local proof storage as a PoC adapter for future Supabase Storage.

The synchronized lifecycle is:

```text
Meter reading → Draft → landlord review/correction → Sent
              → Proof Submitted → manual verification → Paid
```

PGlite runs locally, so the PoC requires no Docker or external database account. Production should replace PGlite/local files, demo login, simulated notification events, and the manual billing-run trigger with the approved deployment services.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Install and Run

```powershell
cd poc_billing_and_QR_similiar
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to Express at `http://localhost:3000`.

Production-style local run:

```powershell
npm.cmd run build
npm.cmd start
```

Then open `http://localhost:3000`.

## Demonstration Flow

1. Sign in as **Chủ nhà P101**.
2. Review or save property-level utility rates and the landlord's VietQR settings.
3. Select **Chuẩn bị billing tham chiếu**. The action records the July readings, runs the monthly billing job, creates `INV.POC.001` as `Draft`, and records a skip reason for P102 because its July reading is missing.
4. While the invoice is `Draft`, optionally correct its readings. The API stores the old/new values and recalculates the invoice without creating a duplicate.
5. Select **Duyệt và gửi tenant**. The invoice becomes `Sent` exactly once and a mobile-push event is simulated.
6. Sign in as **Người thuê P101**, review/download the invoice PDF, inspect the VietQR, and upload a real JPEG/PNG file no larger than 5 MB.
7. Sign back in as **Chủ nhà P101**, retrieve the pending proof, simulate checking the banking application, and confirm payment.
8. Review the `Draft → Sent → Proof Submitted → Paid` audit history and the zero outstanding balance.
9. Use the unrelated landlord/tenant accounts to verify data isolation.

All identities, bank details, readings, invoices, and proofs must be synthetic.

## Backlog Alignment

| Backlog area | PoC evidence |
|---|---|
| F-05 Utility Meter Reading | Previous-reading validation, property-level rates, deterministic calculation, duplicate prevention, Draft-only correction audit |
| F-06 Billing and Invoice | Billing-run endpoint, missing-reading skip record, one Draft per room/period, explicit send, tenant visibility rule, issue/due dates, PDF |
| F-07 VietQR | Landlord-owned payment configuration, exact amount/reference, TLV/CRC verification, rendered QR |
| F-08 Payment Tracking | Content-signature upload validation, authorized proof retrieval/listing, Payment record, idempotent confirmation, history and outstanding totals |

## Automated Verification

```powershell
npm.cmd test
```

The suite executes POC-01 through POC-20. It covers property-level configuration, reading validation/calculation, billing skips and deduplication, Draft isolation, correction audit, explicit send, simulated notification events, VietQR fields/CRC, PDF authorization, forged/empty/oversized upload rejection, proof access, idempotent manual confirmation, Payment records, outstanding balances, status history, unrelated-user denial, and restart persistence.

The automated suite cannot operate a physical banking application. A human must scan the QR with a supported bank/QR validator before the PoC receives an unconditional Go decision.

## Main API Surface

| Method and path | Purpose |
|---|---|
| `PATCH /api/properties/:id/utility-rates` | Maintain property-level electricity/water rates |
| `GET/PATCH /api/payment-settings` | View or update the authenticated landlord's VietQR configuration |
| `POST /api/meter-readings` | Record a baseline or monthly reading |
| `PATCH /api/meter-readings/:id` | Correct a reading while its invoice is Draft |
| `POST /api/billing-runs` | Simulate the configured monthly job and record skip reasons |
| `POST /api/invoices/:id/send` | Explicitly change Draft to Sent |
| `GET /api/invoices/:id/pdf` | Download an authorized PDF invoice |
| `POST/GET /api/invoices/:id/proof` | Submit or retrieve payment proof |
| `GET /api/payment-proofs/pending` | List pending proofs for owned properties |
| `POST /api/invoices/:id/confirm` | Manually create one Payment and mark Paid |
| `GET /api/payments/summary` | Return authorized history and outstanding total |
| `GET /api/notifications` | Inspect simulated mobile-push events |

## Configuration

Copy `.env.example` values into the environment when required:

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Express port | `3000` |
| `JWT_SECRET` | JWT signing key | Development-only built-in value |
| `DATABASE_PATH` | Persistent PostgreSQL/PGlite data directory | `.data/rosihome-billing-poc-v2` |
| `STORAGE_PATH` | Payment-proof directory | `storage` |

Version 2 uses a new database path so the earlier `.data/rosihome-poc` experiment is not deleted or migrated destructively.

## PoC Limitations

- Demo login replaces registration, password management, and tenant provisioning.
- React Web is a demonstration surface; the Product Backlog's final Definition of Done still requires the mobile application.
- `POST /api/billing-runs` simulates scheduled-job execution; a production scheduler is not included.
- Notification rows prove trigger/recipient behavior but do not contact a real mobile push provider.
- File storage is local; production requires Supabase Storage, malware scanning, signed access, encryption, and retention controls.
- The generated PDF is intentionally minimal and is not a branded production invoice template.
- Payment verification remains a deliberate landlord action. RosiHome never holds money and does not claim automatic bank confirmation.
- No real tenant identity, bank account, receipt, or transfer should be used.

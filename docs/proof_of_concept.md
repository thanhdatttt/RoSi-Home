# Proof of Concept — RosiHome

## 1. Purpose and Boundary

The real RosiHome PoC is `poc-local/`. It is a disposable local implementation that asks: **Can the selected Expo → Express → database architecture work, and can the risky billing/VietQR path be implemented deterministically?** It is isolated from the current `backend/`, `mobile/`, Render, Supabase, and real banking services.

## 2. A. Baseline / Easy Feasibility

| Item               | Evidence                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical question | Can a user sign in, create an owned property, save utility rates, and load the same data again through the full stack?                                   |
| Input              | Synthetic landlord account; `Sunrise House`; `12 Local Demo Street`; electricity `3500`; water `18000`                                                   |
| Implementation     | Expo SDK 54 client → typed HTTP request → Express route/JWT middleware → service/repository → Drizzle → local PGlite data                                |
| Output             | The property and rates return after **Tải lại từ DB** and after the persistent database is reopened                                                      |
| Verification       | Runtime walkthrough in `poc-local/DEMO.md`; authentication, ownership, API, and persistence tests                                                        |
| Result             | **FACT — feasible inside the local PoC boundary.** The architecture forms a real vertical slice without mock fallback.                                   |
| Limitation         | PGlite does not prove production PostgreSQL concurrency, backup, recovery, or operations. Local JWT/demo accounts are not production identity hardening. |

## 3. B. Highest-Risk / Hard Feasibility

| Item               | Evidence                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical question | Can decimal meter readings produce a repeatable integer-VND invoice, prevent conflicting duplicates, preserve an invoice snapshot, enforce ownership/state, and generate deterministic VietQR?                                                    |
| Input              | Room `P.101`; period `2026-07`; rent `4,000,000`; electricity `100.125 → 112.625`; water `20 → 22.333`; synthetic bank details                                                                                                                    |
| Implementation     | Milli-unit `BigInt` arithmetic with half-up rounding; immutable snapshot and SHA-256 fingerprint; database unique key; `Draft → Sent` state rule; owner-scoped queries; local EMV TLV/CRC VietQR builder                                          |
| Output             | Electricity `43,750`, water `41,994`, total **`4,085,744 VND`**; identical input replays the invoice; changed input for the same property/room/period returns **HTTP 409**; Sent invoice produces amount `4085744` and remark `ROSI P.101 202607` |
| Verification       | Billing, persistence, ownership, state, and VietQR tests plus the deterministic UI demo                                                                                                                                                           |
| Result             | **FACT — the high-risk idea is feasible inside the PoC boundary.** QR generation does not change the invoice to Paid.                                                                                                                             |
| Limitation         | It does not prove a real beneficiary account, bank acceptance, money movement, payment proof, reconciliation, automatic confirmation, or production security.                                                                                     |

If this high-risk path had failed, the responsible response would have been to redesign the calculation/payment approach, choose another technical solution, reduce scope, or reconsider feasibility. The repository does not record that RosiHome was cancelled.

## 4. Repeatable Evaluation

Run from `poc-local/`:

```powershell
npm run poc:reset
npm run dev
npm run verify:evidence
```

`verify:evidence` runs the PoC tests, strict TypeScript checks, API build, Expo Web export, and a production dependency audit gate at high/critical severity. The current run on 24 August 2026 reports:

- **PASS:** 6 test files and 25 tests; strict TypeScript checks; API build; Expo Web export.
- **FAIL:** production dependency audit gate, with 20 findings: 8 moderate and 12 high.
- **Overall result: FAIL.** Therefore the current runtime status is only **PARTIAL**, even though the functional and build checks pass.

A passing high/critical gate would not mean zero vulnerabilities. In the current run, that gate does not pass, so the high findings must remain visible and require human dependency-remediation review. No automatic or breaking `npm audit fix` was applied.

## 5. Claims Not Proven

- Production PostgreSQL concurrency, backup, recovery, monitoring, or cloud operations
- Production authentication hardening or public-network security
- Native app-store packaging or production deployment
- Real account ownership, bank settlement, payment confirmation, or a `Paid` lifecycle
- Full production lease/meter/tariff scope

## 6. Evidence to Print

1. Baseline input: property name/address and utility rates.
2. Persisted output after **Tải lại từ DB**.
3. Billing result showing `4,085,744 VND`, snapshot, and rounding details.
4. Changed-input HTTP 409 conflict when reproducible.
5. Sent invoice with the synthetic VietQR amount/remark.
6. Current `npm run verify:evidence` result, including the passing functional/build checks and failed dependency gate.

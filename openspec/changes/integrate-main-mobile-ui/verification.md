# Verification Evidence

## 2026-08-12 — Baseline and account slice

| Check | Result | Evidence / limitation |
|---|---|---|
| Mobile dependency matrix | Pass | `pnpm exec expo install --check` → `Dependencies are up to date` after aligning `@react-navigation/native` to the SDK 54 range |
| Mobile TypeScript | Pass | `pnpm exec tsc --noEmit` exited 0 after API/auth changes |
| Expo web export | Pass | `pnpm exec expo export --platform web --output-dir .expo/main-ui-auth-check` exported 62 static routes |
| API base URL | Static pass | Hard-coded LAN URL removed from `app.json`; client reads `EXPO_PUBLIC_API_BASE_URL` first |
| Backend TypeScript | Pass | `pnpm exec tsc --noEmit -p tsconfig.json` exited 0 after approving only the `bcrypt@5.1.1` native build for this test run |
| Backend non-DB tests | Pass | 33 files, 266/266 tests passed |
| Full PostgreSQL integration | Partial | Earlier run: 10/11 files and 78/79 tests passed. The prior surcharge-date assertion was later corrected in Task 4.2 to compare PostgreSQL `date` text without a timezone conversion; rerun is currently blocked because Docker Desktop is not running. |
| Auth/profile PostgreSQL integration | Pass | Targeted controlled PostgreSQL run: 2 files, 11/11 tests passed; the labelled test container was removed afterward |
| Landlord and Tenant navigation | Not run | Requires real/seeded accounts and runtime device/simulator session |
| Forgot-password email | Not run | Request/copy is contract-aligned; actual transactional delivery was not exercised |
| Refresh concurrency | Static only | A single shared refresh promise is implemented; runtime concurrent-401 evidence is still required |

The temporary `backend/pnpm-workspace.yaml` used to approve only `bcrypt` was removed after verification so this mobile change does not convert or reconfigure the backend package-management contract.

## Known deferred findings

- Invoice PDF routes still put the token in the query string; Task 5.2 must replace this with authenticated native download/open behavior using `apiRequestRaw` or a dedicated file helper.
- `/dashboard/tenant` is now documented with the active `roomId` required by Tenant Maintenance submission; the dashboard screen's broader local DTO remains untyped.
- Profile backend logic currently lives in the repository/controller without the architecture-prescribed service layer; this does not block the mobile account slice but remains architecture drift.

## 2026-08-12 — Property and room slice

| Check | Result | Evidence / limitation |
|---|---|---|
| Mobile TypeScript | Pass | Typed portfolio adapter and six canonical Property/Room routes compile with `pnpm exec tsc --noEmit` |
| Backend TypeScript | Pass | `PropertyView.locality` serializer change compiles |
| OpenAPI validation | Pass | `swagger-cli validate docs/openapi.yaml`; Property/Room DTOs and `pageSize` are documented |
| Static stale-field audit | Pass for Task 4.1 | Canonical Property/Room routes no longer read Room `occupied/rentAmount` or unwrap a second `data` envelope |
| Runtime ownership/conflict/UAT | Pending | Covered by Task 4.5; no story completion claim is made from compile evidence |

## 2026-08-12 — Utility rate and surcharge slice

| Check | Result | Evidence / limitation |
|---|---|---|
| Mobile TypeScript | Pass | Typed Utility/Surcharge adapters and canonical screens compile with `pnpm exec tsc --noEmit` |
| Backend TypeScript | Pass | Backend source compiles after the OpenAPI/contract alignment |
| OpenAPI validation | Pass | UtilityRate/Surcharge DTOs, `pageSize`, response envelopes, and utility cancellation path validate with `swagger-cli` |
| Billing API and surcharge unit tests | Pass | 4 files, 23/23 tests passed using the installed Vitest binary; backend `pnpm exec` is blocked by the existing `bcrypt` build-approval policy |
| Effective-date integration rerun | Blocked by environment | The timezone-sensitive assertion now reads `effective_from::text`; Docker Desktop was unavailable, so PostgreSQL integration tests could not connect and were not counted as passing |
| Runtime ownership/overlap/soft-delete UAT | Pending | Covered by Task 4.5; UI integration is complete but story `Done` is not claimed |

## 2026-08-12 — Tenant and lease slice

| Check | Result | Evidence / limitation |
|---|---|---|
| Mobile TypeScript | Pass | Typed Tenant/Lease adapter and list/detail/create/edit/renew/end/expiration routes compile with `pnpm exec tsc --noEmit` |
| Backend TypeScript | Pass | Backend source compiles with the documented DTO contracts |
| OpenAPI validation | Pass | TenantView, LeaseView, UpcomingExpirationView, pagination and provisioning metadata validate with `swagger-cli` |
| Lease API/rules tests | Pass | 2 files, 29/29 tests passed using the installed Vitest binary |
| Unsupported UI cleanup | Pass | Removed the unfetched invoice placeholder from Lease Detail; best-effort credential email is no longer presented as confirmed delivery |
| Runtime provisioning/ownership/conflict UAT | Pending | Covered by Task 4.5; no Product Backlog `Done` claim is made |

## 2026-08-12 — Lease expiration and reminder configuration

| Check | Result | Evidence / limitation |
|---|---|---|
| Mobile TypeScript | Pass | Expiration and reminder routes compile with typed `UpcomingExpirationView` and `LeaseReminderConfigView` adapters |
| OpenAPI validation | Pass | Reminder request now documents the actual 30/15/7 boolean contract and both response envelopes |
| Lease/reminder API tests | Pass | 2 files, 29/29 tests passed; this repeats the focused suite after the reminder contract change |
| Push delivery | Not run | Saving configuration does not prove scheduler execution, dedupe, device token validity or delivery to both recipients |
| Expo web export | Pass | `pnpm exec expo export --platform web --output-dir .expo/portfolio-leasing-check` exported all 62 static routes; output remains ignored/untracked |

## 2026-08-13 — Meter, maintenance, utility, and shared UI slice

| Check | Result | Evidence / limitation |
|---|---|---|
| Mobile TypeScript | Pass | Installed TypeScript binary completed `--noEmit` with typed Meter/Maintenance adapters and canonical role routes |
| Backend TypeScript | Pass | Installed TypeScript binary completed `--noEmit`; backend `pnpm exec` remains blocked by the existing `bcrypt` build-approval policy |
| Meter and Maintenance contract/unit tests | Pass | 4 files, 88/88 tests passed, including the owned-room meter list contract and existing maintenance media/status contracts |
| Utility and surcharge regression | Pass | 11 files, 41/41 tests passed; existing US-UTILITY-01/02 implementation remains intact |
| OpenAPI validation | Pass | `swagger-cli validate docs/openapi.yaml`; the paginated/filterable owned-room meter list is documented |
| Expo SDK dependency alignment | Pass | Expo SDK 54 `install --check` reports `Dependencies are up to date`; `expo-image-picker` is aligned at `~17.0.11` |
| Expo web export | Pass | Static export completed with 78 routes, including Tenant/Landlord Maintenance, room history, Meter entry and correction |
| Runtime device/storage/PostgreSQL UAT | Pending | Camera/library behavior, signed private photos, real ownership data, correction-linked Draft invoice recalculation, and push delivery require device/backend integration evidence before Product Backlog `Done` |

## 2026-08-13 — Upload Proof and Notification UI (FE only)

| Check | Result | Evidence / limitation |
|---|---|---|
| Scope control | Pass | This slice changes only `mobile/` and OpenSpec evidence; no backend source, contract, schema or test was edited |
| Upload Proof UI | Static pass | Sent Tenant invoice links to a canonical picker/preview screen; PNG/JPG/JPEG, 5 MB and binary-safe `FormData` field `proof` match the existing contract |
| Notification UI | Static pass | Shared Landlord/Tenant list has loading/error/empty states, device push enable/disable, and Invoice/Maintenance/Lease routing without inventing read state |
| Mobile TypeScript | Pass | Installed TypeScript binary completed `--noEmit` |
| Expo dependency alignment | Pass | SDK 54 `expo install --check` reports `Dependencies are up to date` |
| Expo web export | Pass | Export completed with 82 static routes, including Tenant Upload Proof and Tenant/Landlord Notification Center |
| Native UAT | Pending | Image library upload, private proof URL, physical-device Expo token, notification receipt/tap and delivery receipt require real-device/API evidence |

## 2026-08-13 — Report and VietQR UI (FE only)

| Check | Result | Evidence / limitation |
|---|---|---|
| Scope control | Pass | This slice changes `mobile/` plus OpenSpec evidence only; existing backend authorization and contracts were not changed |
| VietQR UI | Static pass | Shared authorized-role screen renders QR image, exact amount, transfer description and payload; Tenant and Landlord enter through their own Invoice Detail routes |
| Landlord Report UI | Static pass | Month/custom validation, financial/debt breakdown, occupancy/churn/expirations, maintenance metrics and authenticated PDF download/share are present |
| Tenant Report UI | Static pass | Tenant route uses role-scoped payment history and explicitly does not call landlord-only business-report/PDF endpoints |
| Mobile TypeScript | Pass | Installed TypeScript binary completed `--noEmit` |
| Expo dependency alignment | Pass | SDK 54 `expo install --check` reports dependencies up to date after adding compatible `expo-file-system ~19.0.23` and `expo-sharing ~14.0.8` |
| Expo web export | Pass | Export completed with 90 static routes, including Report and VietQR routes for both role trees |
| Native/external UAT | Pending | Banking-app VietQR scan, native PDF readability/share, seeded metric reconciliation and role-ownership responses still require real-device/API evidence |

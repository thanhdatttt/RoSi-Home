# Tasks: Integrate Main Mobile UI

## 1. Baseline and recovery

- [x] 1.1 Create a named Git stash checkpoint for the pre-baseline mobile implementation.
- [x] 1.2 Restore the `main` mobile UI route tree while preserving the local `.env` and generated-artifact ignore rules.
- [x] 1.3 Standardize dependency installation on pnpm and remove the npm lockfile.
- [x] 1.4 Add the missing navigation dependency and regenerate Expo Router types.
- [x] 1.5 Verify the baseline with `pnpm exec tsc --noEmit` and Expo web export.

## 2. Scope and contract matrix

- [x] 2.1 Inventory every canonical route and user interaction in the `main` UI.
- [x] 2.2 Map each route to Product Backlog story, role, backend method/path, envelope, and OpenAPI status.
- [x] 2.3 Classify pre-baseline mobile modules as `Port`, `Replaced`, `Blocked`, or `Remove` without applying the stash over the baseline.
- [x] 2.4 Record missing route/contract/evidence gaps for meter, payment, maintenance, notification, dashboard, and reporting flows.

## 3. Foundation and account slice

- [x] 3.1 Reconcile mobile Expo version guidance with the installed SDK matrix before changing Expo APIs.
- [x] 3.2 Consolidate the API client for JSON envelopes, pagination, normalized errors, refresh rotation, and binary-safe requests.
- [x] 3.3 Integrate register, login, refresh, logout, forgot/change/forced-password, profile, and role routing with the backend.
- [ ] 3.4 Verify account flows with typecheck, export, backend contract evidence, and manual role-navigation checks.

## 4. Portfolio and leasing slices

- [x] 4.1 Integrate property and room list/detail/create/update/bulk flows.
- [x] 4.2 Integrate utility-rate and recurring-surcharge flows.
- [x] 4.3 Integrate tenant list/detail and lease create/view/update/end flows.
- [x] 4.4 Integrate lease-expiration list and reminder configuration.
- [ ] 4.5 Verify ownership, validation, conflict, pagination, and empty/error states.

## 5. Billing and payment slices

- [x] 5.1 Add meter-reading entry, list/period context, and correction routes from approved contracts.
- [ ] 5.2 Integrate invoice generation, landlord/tenant list/detail, draft send, and PDF download.
- [ ] 5.3 Add payment configuration and VietQR display without changing payment state.
- [ ] 5.4 Add multipart payment-proof upload, landlord verification queue, confirmation, history, and reminder states.
- [ ] 5.5 Verify invoice calculations, QR payload UAT boundary, private file handling, and payment lifecycle.

## 6. Operations and analytics slices

- [x] 6.1 Add tenant maintenance submission/list/detail and landlord status/history flows.
- [x] 6.2 Integrate Expo device-token registration/removal, notification list, and deep links for both roles.
- [ ] 6.3 Replace landlord and tenant dashboard presentation data with supported metrics.
- [x] 6.4 Add report period selection, generated analytics, and readable PDF export.
- [ ] 6.5 Verify scheduled/delivery behavior separately from UI and API request success.

## 7. Cleanup and acceptance

- [ ] 7.1 Remove only legacy modules classified `Replaced` or `Remove` after their target slice is accepted.
- [ ] 7.2 Run pnpm typecheck, Expo Doctor/export, backend checks, OpenAPI validation, and applicable integration checks.
- [ ] 7.3 Complete real-device UAT evidence for both roles and external boundaries.
- [ ] 7.4 Reconcile Product Backlog status using the universal Definition of Done.
- [ ] 7.5 Drop the checkpoint stash only after the migrated capabilities are accepted and recoverability is no longer required.

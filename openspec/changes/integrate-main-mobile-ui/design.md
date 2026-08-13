# Design: Integrate Main Mobile UI

## Context

The worktree currently contains the mobile UI restored from `main`, while the previous `Frontend` mobile implementation is stored in `stash@{0}`. The restored route shell builds and type-checks, but several screens are presentation-first and several backlog capabilities do not yet have routes. The backend exposes modules for all major domains, although individual mobile-to-backend contracts still require verification.

The authoritative scope is `docs/product_backlog.md`. Cross-cutting and endpoint rules come from `openspec/specs/ARCHITECTURE.md` and `openspec/specs/FEATURE-SPECS.md`. Current source and OpenAPI remain the final implementation evidence.

## Goals

- Keep one canonical mobile route tree based on `main`.
- Preserve correct behavior without preserving duplicate architecture.
- Make every feature slice traceable from story to UI, API, authorization, and evidence.
- Keep the application bootable and type-safe after every slice.
- Separate implemented, API-blocked, mock-only, and UAT-pending states.

## Non-goals

- A Web client.
- A visual redesign of the approved `main` UI.
- Broad backend refactors unrelated to a verified mobile contract gap.
- Reconstructing every deleted feature module before confirming it is needed.

## Decisions

### 1. UI baseline and migration direction

The `main` Expo Router route tree is canonical. Code from the pre-baseline `Frontend` implementation may be ported into this tree as adapters, mappers, hooks, media helpers, or validated business interactions. Old routes are not restored when the `main` route replaces them.

### 2. Vertical-slice order

Implementation follows dependency order:

1. Foundation: pnpm, Expo configuration, route shell, auth storage, API envelope/error handling.
2. Account: register, login, refresh, logout, forced/change/forgot password, profile, role guard.
3. Portfolio: properties, rooms, utilities, surcharges.
4. Leasing: tenants, leases, tenant provisioning, expiration reminders.
5. Billing: meter readings/corrections, invoices, PDF and send flow.
6. Payments: payment configuration, VietQR, proof upload/verification/history, reminders.
7. Operations: maintenance, push notification lifecycle, dashboards and reports.

### 3. Route-to-contract gate

Before a slice is implemented, its matrix row must identify:

- Product Backlog story and role;
- mobile route and interaction;
- backend method/path and response envelope;
- OpenAPI state;
- implementation state (`Supported`, `Partial`, `Missing`, or `Mock only`);
- automated and manual verification still required.

A route with no supported contract must show an honest blocked/placeholder state or remain absent. It must not silently fabricate successful data.

### 4. API client boundary

The shared API client owns base URL resolution, JSON envelopes, normalized errors, access-token refresh, and storage abstraction. Feature-specific DTO mapping remains close to each route or feature adapter. Multipart uploads must not pass through a JSON-only body serializer.

### 5. Package management

Use pnpm for install and validation. Keep `pnpm-lock.yaml` as the only package lock. Commands documented for this change use `pnpm` or `pnpm exec`.

### 6. Verification boundary

- Typecheck and Expo export prove compile/bundle integrity.
- Backend tests and contract checks prove server behavior only for their covered cases.
- Integration checks prove client/server mapping.
- Real-device UAT, push delivery, email delivery, banking-app VietQR scan, file upload/storage, and readable PDF checks remain separate evidence gates.

### 7. Expo version guidance

This change retains Expo SDK 54. The repository instruction previously pointed to SDK 57 even though the installed matrix is Expo `54.0.36`, React Native `0.81.5`, React `19.1.0`, and Expo Router `6.0.24`. Implementation must use the SDK 54 versioned documentation and `expo install --check`. An SDK 57 migration is a separate change and must not be mixed into backlog/UI integration.

## Initial capability map

| Slice | UI baseline from `main` | Required follow-up |
|---|---|---|
| Auth/profile | Present | Verify logout, refresh retry, forced-password flow, role routing, profile update |
| Properties/rooms | Present | Connect list/detail/create/update/bulk paths and ownership errors |
| Utilities/surcharges | Present | Verify effective-rate and recurring-charge contracts |
| Tenants/leases | Present | Verify provisioning, overlap handling, lifecycle actions and reminder config |
| Invoices | Present | Connect landlord/tenant list/detail, generation, send, PDF and envelopes |
| Meter readings | Missing dedicated routes | Add entry/list/correction UX from verified contracts |
| VietQR/payments | Missing dedicated routes | Add config, QR, multipart proof, verification queue and history |
| Maintenance | Missing | Add tenant submission and landlord status/history flows |
| Notifications | Landlord list route present | Add token lifecycle, role coverage and deep-link behavior |
| Dashboard | Landlord and tenant shells present | Replace presentation data with supported API metrics |
| Reports | Missing | Add period generation, analysis and PDF export |

## Risks and mitigations

- **Accidental feature loss:** keep the checkpoint stash until all retained capabilities are mapped and accepted.
- **Large unreviewable diff:** commit by vertical slice after baseline normalization, not as one mixed feature commit.
- **Contract drift:** update backend route/schema, OpenAPI, tests, and mobile adapter together when a real mismatch is fixed.
- **False completion:** keep backlog status and UAT evidence separate from static build evidence.
- **Expo version drift:** validate changes against the installed SDK dependency matrix and the repository's versioned Expo guidance before modifying Expo APIs.

## Rollback

Before the baseline commit, the worktree can be restored from the checkpoint stash. After commits begin, each vertical slice remains independently revertible. Generated `.expo` and export directories are never rollback sources.

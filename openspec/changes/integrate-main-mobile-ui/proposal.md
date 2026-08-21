# Integrate Main Mobile UI with the Product Backlog

## Why

The `Frontend` branch contains partial feature implementations, while `main` contains the newer approved mobile route structure and visual baseline. Keeping both structures in parallel creates duplicate screens, inconsistent navigation, and unclear claims about which Product Backlog stories are actually implemented.

This change makes the UI from `main` the presentation baseline, then reconnects it to the current backend contracts story by story. A screen rendering successfully is not sufficient evidence that its story is complete.

## What Changes

- Adopt the `main` mobile route tree and visual components as the canonical UI baseline.
- Standardize mobile dependency management on pnpm with one lockfile.
- Map every retained or planned route to its authoritative Product Backlog story, backend route, role, response envelope, and verification evidence.
- Preserve useful API adapters and feature behavior from the previous `Frontend` implementation only when they match the target UI and backend contract.
- Remove duplicate or out-of-scope mobile screens after their replacement or exclusion is verified.
- Add the missing Mobile-only flows required by the backlog: meter readings, VietQR/payment proof/history, maintenance, notification lifecycle, dashboard data, and reporting.
- Integrate in reviewable vertical slices and keep incomplete/API-blocked behavior explicitly labelled.

## Capabilities

### New Capabilities

- `mobile-ui-integration`: A role-aware Expo Router client whose routes are traceable to Product Backlog stories and versioned REST contracts.

### Modified Capabilities

- Authentication and profile flows use the canonical route shell and backend token lifecycle.
- Property, room, utility, surcharge, tenant, lease, invoice, notification, dashboard, payment, maintenance, and report flows use the `main` UI baseline with real API adapters where supported.

## Impact

- Primary surface: `mobile/`.
- Contract references: `docs/product_backlog.md`, `openspec/specs/ARCHITECTURE.md`, `openspec/specs/FEATURE-SPECS.md`, backend routers, and `backend/docs/openapi.yaml`.
- Package manager: pnpm; `mobile/pnpm-lock.yaml` is canonical and `mobile/package-lock.json` is removed.
- Existing pre-baseline mobile work remains recoverable from the named Git stash until migration is accepted.
- No Web delivery is introduced by this change.

## Non-goals

- Claiming a story Done from static UI, typecheck, or web export alone.
- Adding backend endpoints that are not specified without updating the feature spec and OpenAPI contract.
- Reusing duplicate screens solely because they existed on the previous branch.
- Treating mock data, generated Expo output, or local planning documents as production evidence.

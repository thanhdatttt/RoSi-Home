## Why

The project needs a presentation-ready proof of concept that demonstrates the proposed architecture and its hardest workflow without depending on the existing application, a deployed backend, Docker, Supabase, or external services. A self-contained local implementation also makes the evidence repeatable on a single developer machine.

## What Changes

- Add an isolated `poc-local/` workspace with its own dependencies, configuration, data, and run commands.
- Implement a local Express/TypeScript API backed by persistent PGlite storage and protected by JWT authentication and landlord ownership checks.
- Implement an Expo/React Native presentation client, demonstrated through Expo Web and optionally on a physical iPhone over a private LAN, for the complete PoC workflow.
- Add automated API, authorization, validation, and persistence tests plus repeatable demo/reset commands.
- Extend the local vertical slice with an idempotent, snapshot-based billing calculation and deterministic local VietQR workflow as the difficult-problem proof.
- Add a presentation/evidence package that maps architecture and hard-problem claims to reproducible checks while keeping payment verification and production operations explicitly out of scope.
- Add an explicit private-LAN development mode so a physical iPhone can reach the Windows-hosted API without using the deployed backend.
- Require a formal code review gate after each implementation phase.

## Capabilities

### New Capabilities

- `local-standalone-poc`: A fully local, runtime-isolated proof of concept that demonstrates the selected architecture through authentication, property management, utility-rate management, idempotent billing, and deterministic VietQR generation.

### Modified Capabilities

None.

## Impact

- New code is confined to `poc-local/`; new planning artifacts are confined to `openspec/changes/local-standalone-poc/`.
- The PoC introduces a separate Node.js dependency tree for Express, Drizzle ORM, PGlite, JWT, Expo SDK 54, React Native, Vitest, and Supertest.
- The PoC uses local ports `3100` (API) and `8082` (Expo/Metro), stores disposable data beneath its own `.data/` directory, and MAY expose port 3100 only to the presenter's private LAN for a physical-device demo.
- Existing `backend/`, `mobile/`, deployed services, and production data are not imported, modified, or required at runtime.

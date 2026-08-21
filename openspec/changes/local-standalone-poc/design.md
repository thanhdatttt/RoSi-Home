## Context

RoSi-Home already contains a production-oriented backend and mobile application, but the requested proof of concept must run entirely on one local machine and must not rely on those implementations or on the deployed backend. The PoC must make two claims demonstrable: the selected presentation/API/data architecture works end to end, and the design can later support the difficult billing and VietQR workflow. Only one developer is implementing and presenting it, so setup, reset, verification, and review need to be deterministic and lightweight.

The standalone workspace is a sibling of the existing application folders. Its only integration boundary with the rest of the repository is documentation: it imports no source code, environment configuration, database client, or runtime endpoint from `backend/` or `mobile/`.

## Goals / Non-Goals

**Goals:**

- Produce a local vertical slice that can be started and demonstrated on Windows with Node.js and npm.
- Demonstrate the selected layered architecture through Expo/React Native, Express/TypeScript, Drizzle ORM, and PostgreSQL-compatible PGlite.
- Allow a physical iPhone on the same private LAN to exercise that architecture against the Windows-hosted API.
- Persist disposable demo data on the local filesystem without Docker or a cloud database.
- Demonstrate authentication, validation, authorization, ownership isolation, property creation, and utility-rate updates.
- Make the API testable without listening on a TCP port by injecting the database and JWT configuration.
- Establish repeatable reset, type-check, test, and build/export evidence.
- Demonstrate the difficult billing and VietQR path with reproducible monetary calculation, invoice snapshots, idempotency, ownership isolation, and local QR rendering.

**Non-Goals:**

- Reuse, refactor, or replace the existing `backend/` or `mobile/` application.
- Connect to Render, Supabase, banking APIs, payment gateways, or any other external service.
- Provide production-grade identity management, secret storage, high availability, or mobile app-store packaging.
- Implement payment-proof upload, payment reconciliation, automatic bank confirmation, or a `Paid` transition.
- Claim that the synthetic PoC data or locally generated tokens are production data.

## Decisions

### 1. Isolated npm workspace

The implementation SHALL live under `poc-local/` with its own root package manifest, lockfile, environment example, and ignored data directory. The API and presentation client SHALL be separate workspace packages.

This boundary makes runtime independence inspectable and prevents accidental imports from the existing application. A branch inside the existing backend was rejected because it would weaken the proof that the chosen architecture can run independently.

### 2. Local PostgreSQL-compatible persistence with PGlite

The API SHALL use PGlite in Node.js filesystem mode, with Drizzle ORM providing typed application queries. The default data path SHALL be beneath the standalone workspace's `.data/` directory; automated unit and integration tests MAY use `memory://` or an isolated temporary directory.

PGlite was chosen over Docker PostgreSQL to keep the one-developer demo setup small while retaining PostgreSQL behavior and SQL. SQLite was rejected because it would not demonstrate the selected PostgreSQL-compatible data layer. The database constructor is injected into the application so persistence can be verified by closing and reopening the database.

### 3. Layered and dependency-injected API

Express routing, validation, authentication middleware, services, repositories, and database initialization SHALL be separate modules. `createApp` SHALL accept a database instance and JWT configuration; the executable server is only an adapter that resolves local configuration. It SHALL default to `0.0.0.0:3100` for the physical-device PoC while accepting an explicit `127.0.0.1` override for loopback-only use.

This permits Supertest to exercise the real HTTP pipeline without a network listener and avoids process-global database state. Direct route-to-database implementations were rejected because they obscure the architecture being presented.

### 4. Local JWT authentication and ownership enforcement

Synthetic landlord credentials SHALL be seeded locally. Passwords SHALL be stored as salted hashes using Node's standard cryptography primitives. Successful login SHALL issue a short-lived JWT. Protected routes SHALL validate the JWT, and property-specific operations SHALL scope database queries by both resource identifier and authenticated landlord identifier.

Local fallback secrets are acceptable only for development and tests and SHALL be clearly labeled as non-production. Ownership mismatch SHALL appear as not found, avoiding disclosure that another landlord's resource exists.

### 5. Expo SDK 54 presentation client demonstrated on web and physical iPhone

The presentation package SHALL use Expo SDK 54, React Native, and React Native Web. Expo Web on `127.0.0.1:8082` remains the reproducible build/export target. A physical iPhone MAY run the same JavaScript presentation through Expo on the private LAN. The client talks only to `EXPO_PUBLIC_API_URL`, defaulting to `http://127.0.0.1:3100` for same-machine Web; physical-device use SHALL set a machine-specific Windows LAN URL in ignored `apps/mobile/.env.local`.

Expo was selected to preserve the mobile-oriented technology decision while allowing both a browser-based classroom fallback and physical-device evidence. A separate React web application was rejected because it would not prove that the React Native presentation stack works. The client SHALL display real loading and error states and SHALL NOT substitute mock data if the API is unavailable. The iOS configuration SHALL declare local-network intent and allow local networking for development; Expo Go users SHALL also grant the Expo Go application Local Network permission in iOS settings.

### 6. Phase gates and evidence

Phase 0 establishes the OpenSpec contract, independent scaffold, dependency lockfile, and runbook. Phase 1 implements and verifies the API vertical slice. Phase 2 implements and verifies the Expo client. Each phase SHALL end with self-checks followed by a read-only formal review using the repository's `review-agent-code` contract before the next phase begins.

Phase 3 extends the same route/service/repository boundaries for billing/VietQR. Phase 4 creates the presentation and evidence package. Phase 6 adds the private-LAN physical-iPhone workflow. Each phase remains unchecked until its implementation and formal review finish.

### 7. Reproducible billing snapshot and decimal policy

The Phase 3 billing input SHALL identify an owned property, a normalized room reference, a tenant display name, a `YYYY-MM` billing period, issue and due dates, base rent in integer VND, and previous/current electricity and water meter readings expressed as decimal strings with at most three fractional digits. The property MUST have utility rates before billing.

Readings SHALL be normalized to integer milli-units with `BigInt`; current readings lower than previous readings SHALL be rejected. A utility charge SHALL be calculated from `consumptionMilli × integerRate`, rounded half-up to the nearest VND using integer arithmetic. Base rent, each utility charge, and the total SHALL be stored as integer VND. The invoice SHALL snapshot all readings, rates, line items, calculation policy, and dates so later property-rate changes cannot mutate it.

This representation was selected instead of JavaScript floating-point multiplication because the hard-problem proof must be reproducible at fractional meter readings. A full tariff-band/default-rate engine is outside this PoC; configured property rates are required.

### 8. Database-enforced idempotency and bounded invoice lifecycle

The generation identity SHALL be the tuple `(property_id, normalized_room_reference, billing_period)`, enforced by a database unique constraint. A SHA-256 fingerprint SHALL cover the normalized calculation input. Repeating an identical request SHALL return the stored invoice with `replayed: true`; reusing the identity with different input SHALL return HTTP 409 and preserve the original snapshot.

The PoC lifecycle SHALL be `Draft → Sent`. Sending a Draft records `sent_at`; repeating send on an already Sent invoice SHALL be idempotent and keep the original timestamp. No endpoint in this phase marks an invoice `Paid`. Every invoice query and transition SHALL join through its property and filter by the authenticated landlord.

### 9. Local VietQR contract

Each landlord MAY store one local bank configuration containing a six-digit bank BIN, a 5-19 character alphanumeric account number, and an account-holder display name. Sensitive bank configuration SHALL be owner-scoped and SHALL NOT be logged.

Only a Sent owned invoice with configured bank details SHALL produce VietQR. The payload SHALL use EMV TLV encoding with dynamic initiation (`01=12`), NAPAS AID `A000000727` in merchant-account field `38`, service `QRIBFTTA`, currency `704`, country `VN`, the exact integer invoice total, deterministic remark `ROSI <ROOM> <YYYYMM>` limited to 25 safe characters, and CRC16-CCITT-FALSE in field `63`. The API SHALL locally parse and validate the generated TLV and CRC before rendering a QR image. QR generation SHALL be deterministic for the stored invoice and SHALL NOT change invoice status or represent a payment.

An external QR/payment API was rejected because it would violate local isolation. Structural validation proves the payload contract, not the existence of a real beneficiary; a live bank scan requires the presenter to enter a real account locally and is optional manual evidence.

### 10. Presentation evidence as a repository artifact

The final phase SHALL provide a concise architecture narrative, diagrams, a timed demo script, a requirement-to-evidence matrix, and a repeatable local verification command. Evidence SHALL distinguish automated checks, HTTP/runtime checks, and optional manual bank scanning, and SHALL explicitly list all unimplemented production capabilities.

## Risks / Trade-offs

- **PGlite is not a production PostgreSQL server** -> Treat it as a local architecture PoC, use PostgreSQL-compatible schema/query patterns and database constraints, and avoid operational claims about production concurrency or availability.
- **Expo Web does not prove native-device behavior** -> State that Phase 2 proves the shared React Native presentation layer and HTTP integration; native packaging remains outside the PoC scope.
- **Local JWT secret and demo credentials are intentionally weak operational controls** -> Use only synthetic records, ignore `.env` and `.data/`, and label all credentials as local demo data.
- **A single-machine two-process demo can fail because of ports or startup order** -> Bind to documented ports, expose `/health`, surface connection errors, and provide separate as well as combined run commands.
- **Binding to all interfaces exposes the synthetic PoC to the current LAN** -> Use only disposable demo data and credentials, disable the unauthenticated HTTP reset route in LAN mode, document the exposure, permit a loopback-only override, and never use this mode on an untrusted/public network.
- **The Windows LAN address can change** -> Store it only in ignored `apps/mobile/.env.local`, show the current-IP discovery command, and require a full Expo reload after updates.
- **iOS local-network privacy, ATS, Wi-Fi isolation, or Windows Firewall can still block the device** -> Declare iOS local-network intent, document the required iOS permission and Private-network firewall boundary, and use `/health` in Safari to isolate networking from application behavior.
- **Workspace package versions can drift** -> Commit one root npm lockfile and verify dependency resolution during Phase 0.
- **Review after every phase adds time for a solo implementer** -> Keep each review scoped to the phase delta and record exact checks and findings before proceeding.
- **A structurally valid VietQR can still reference a nonexistent synthetic account** -> Label synthetic data clearly, make real local bank configuration optional for a scan demo, and never claim a transfer was made or verified.
- **The bounded invoice input does not implement the full room/lease/meter subsystem** -> Snapshot the synthetic room/tenant context and present it as a hard-problem vertical slice, not full backlog completion.

## Migration Plan

No production migration is required. The change adds an isolated workspace. A user installs dependencies inside `poc-local/`, copies the tracked environment examples when overrides are needed, sets a machine-specific ignored mobile `.env.local` for iPhone use, starts the API and Expo client, and can return to the seeded state with the reset command. Rollback consists of removing only the standalone workspace and this OpenSpec change; existing application runtime and data remain untouched.

## Open Questions

- Native-device packaging, full lease/meter integration, payment proof, automatic bank confirmation, and the `Paid` lifecycle remain future product decisions outside this PoC.

## ADDED Requirements

### Requirement: Standalone local runtime
The PoC SHALL run locally from `poc-local/` without importing runtime code or configuration from the existing `backend/` or `mobile/`, and without contacting the deployed backend, Supabase, or another required external service.

#### Scenario: Start the complete local vertical slice
- **WHEN** the developer installs the standalone dependencies and starts the documented API and presentation commands
- **THEN** the API SHALL listen locally on port 3100 and the Expo Web presentation SHALL be available locally on port 8082

#### Scenario: Local API is unavailable
- **WHEN** the presentation client cannot reach the local API
- **THEN** it SHALL show an explicit connection error and SHALL NOT silently display fallback mock records

### Requirement: Persistent disposable local data
The API SHALL store PoC records in a PostgreSQL-compatible PGlite database beneath the standalone workspace by default, and SHALL provide a reset operation that restores deterministic synthetic demo data.

#### Scenario: Data survives an API restart
- **WHEN** a property is created, the database is closed, and the API reopens the same local data path
- **THEN** the property SHALL remain queryable by its owning landlord

#### Scenario: Reset demo state
- **WHEN** the developer runs the documented local reset operation
- **THEN** mutable PoC data SHALL be cleared and the documented synthetic landlord accounts SHALL be restored

### Requirement: Local landlord authentication
The API SHALL authenticate seeded synthetic landlords with salted password hashes and SHALL issue a time-limited JWT for valid credentials.

#### Scenario: Successful login
- **WHEN** a client submits valid seeded landlord credentials
- **THEN** the API SHALL return a JWT and a non-sensitive landlord profile

#### Scenario: Invalid login
- **WHEN** a client submits an unknown email or incorrect password
- **THEN** the API SHALL return an unauthorized error without revealing which credential was incorrect

### Requirement: Protected and owner-scoped property access
The API SHALL require a valid JWT for property operations and SHALL scope property-specific reads and updates to the authenticated landlord.

#### Scenario: Missing authentication
- **WHEN** a client calls a protected property endpoint without a valid JWT
- **THEN** the API SHALL reject the request as unauthorized

#### Scenario: Cross-landlord access
- **WHEN** one seeded landlord requests or updates a property owned by the other seeded landlord
- **THEN** the API SHALL respond as though the property was not found and SHALL NOT modify it

### Requirement: Property and utility-rate vertical slice
An authenticated landlord SHALL be able to list and create owned properties, inspect one owned property, and set non-negative integer electricity and water rates for that property.

#### Scenario: Create and list a property
- **WHEN** an authenticated landlord submits a valid property name and address
- **THEN** the API SHALL create the property for that landlord and include it in the landlord's property list

#### Scenario: Update utility rates
- **WHEN** an authenticated owner submits valid electricity and water rates for a property
- **THEN** the API SHALL persist the rates and return them with the property detail

#### Scenario: Reject invalid utility rates
- **WHEN** an authenticated owner submits a negative or non-integer utility rate
- **THEN** the API SHALL reject the request with validation details and SHALL NOT persist the invalid values

### Requirement: Expo presentation workflow
The Expo/React Native presentation SHALL use the real local API to support login, property listing and creation, property selection, and utility-rate update workflows with visible loading, success, empty, and error states.

#### Scenario: Complete the Phase 2 demo path
- **WHEN** a developer logs in with a seeded account, creates a property, selects it, and saves utility rates in Expo Web
- **THEN** each screen SHALL display the state returned by the local API and the saved values SHALL still appear after an explicit reload

### Requirement: Physical iPhone private-LAN workflow
The PoC SHALL provide a documented development configuration in which a physical iPhone running Expo can reach the Windows-hosted local API over the same private LAN without contacting the deployed backend. The API host SHALL be configurable for loopback or all-interface binding, and the native client SHALL receive an explicit `EXPO_PUBLIC_API_URL` containing the Windows LAN address rather than treating iPhone loopback as the API host.

#### Scenario: Reach the local health endpoint from iPhone
- **WHEN** the API listens on `0.0.0.0:3100`, the iPhone and Windows host share a private LAN, the OS permits local-network traffic, and Expo receives the documented LAN URL
- **THEN** the iPhone SHALL be able to request `/health` from the Windows host and the app SHALL use the same local API for its protected workflows

#### Scenario: Keep local configuration out of source control
- **WHEN** the developer configures a machine-specific LAN address
- **THEN** that value SHALL live in an ignored `.env.local` file, while tracked examples and runbooks SHALL explain how to refresh it when the LAN address changes

#### Scenario: Do not expose HTTP reset on the LAN
- **WHEN** the API uses all-interface binding for a physical iPhone
- **THEN** the unauthenticated HTTP reset endpoint SHALL be unavailable, while the Windows-local reset CLI SHALL remain available

#### Scenario: Preserve the web workflow
- **WHEN** the developer uses the existing Expo Web command
- **THEN** the client MAY continue using the loopback API URL and the existing Web build/export evidence SHALL remain valid

### Requirement: Repeatable verification and review gates
The standalone workspace MUST provide type-check, automated API test, and presentation build/export commands, and each implementation phase SHALL receive a read-only formal code review before the next phase begins.

#### Scenario: Verify Phase 1
- **WHEN** the developer runs the Phase 1 verification commands
- **THEN** authentication, validation, ownership isolation, API behavior, and close/reopen persistence tests SHALL pass

#### Scenario: Verify Phase 2
- **WHEN** the developer runs the Phase 2 verification commands
- **THEN** both packages SHALL type-check and the Expo Web presentation SHALL export successfully

#### Scenario: Verify the physical-device extension
- **WHEN** the developer runs the Phase 6 verification commands
- **THEN** configuration tests, all existing tests, strict type-checking, Expo config resolution, build/export, and a LAN-address HTTP smoke test SHALL pass before formal review

### Requirement: Reproducible invoice calculation
An authenticated landlord SHALL be able to generate a Draft invoice for an owned property using integer-VND base rent, configured property rates, and previous/current decimal meter readings with at most three fractional digits. The invoice SHALL snapshot its inputs, rates, line items, rounding policy, total, dates, room reference, tenant label, and billing period.

#### Scenario: Calculate fractional metered consumption
- **WHEN** the current electricity and water readings are greater than or equal to their preceding readings
- **THEN** consumption SHALL equal the decimal difference and each charge SHALL be rounded half-up to integer VND using integer milli-unit arithmetic

#### Scenario: Reject decreasing readings
- **WHEN** either current reading is lower than its preceding reading
- **THEN** generation SHALL fail with field-level validation details and SHALL NOT create an invoice

#### Scenario: Preserve invoice rates
- **WHEN** a property utility rate changes after an invoice was generated
- **THEN** the stored invoice line items and total SHALL remain unchanged

### Requirement: Idempotent owner-scoped invoice generation
The API MUST enforce at most one invoice for each owned property, normalized room reference, and billing period, and SHALL compare a normalized input fingerprint when that identity already exists.

#### Scenario: Replay identical generation
- **WHEN** the owning landlord repeats an invoice-generation request with the same normalized input
- **THEN** the API SHALL return the existing invoice with `replayed: true` and SHALL NOT add another record

#### Scenario: Reject conflicting generation
- **WHEN** the owning landlord reuses the same property, room reference, and billing period with different calculation input
- **THEN** the API SHALL return HTTP 409 and SHALL preserve the original invoice snapshot

#### Scenario: Isolate invoices by landlord
- **WHEN** a landlord requests, sends, or generates VietQR for an invoice attached to another landlord's property
- **THEN** the API SHALL respond as though the invoice was not found and SHALL NOT disclose or mutate it

### Requirement: Bounded invoice state transition
An invoice SHALL begin in `Draft` and MAY transition only to `Sent` in this PoC. Sending SHALL record one immutable sent timestamp, and this phase MUST NOT expose a transition to `Paid`.

#### Scenario: Send a Draft invoice
- **WHEN** the owning landlord sends a Draft invoice
- **THEN** its status SHALL become `Sent` and the API SHALL record the sender time exactly once

#### Scenario: Replay send
- **WHEN** the owning landlord sends an already Sent invoice again
- **THEN** the API SHALL return it unchanged and SHALL preserve the first sent timestamp

### Requirement: Deterministic local VietQR
An authenticated landlord SHALL be able to save owner-scoped bank details and generate a local VietQR for a Sent owned invoice. The payload SHALL contain NAPAS AID `A000000727`, service `QRIBFTTA`, currency `704`, country `VN`, the exact integer invoice total, a deterministic safe transfer remark, and a valid CRC16-CCITT-FALSE checksum.

#### Scenario: Generate and validate VietQR
- **WHEN** the owner requests VietQR for a Sent invoice with valid configured bank details
- **THEN** the API SHALL return a locally rendered QR image, the deterministic payload, amount, and remark after validating its TLV structure and CRC

#### Scenario: Reject QR for a Draft
- **WHEN** the owner requests VietQR for a Draft invoice
- **THEN** the API SHALL reject the request and SHALL leave the invoice in Draft

#### Scenario: QR has no payment side effect
- **WHEN** VietQR is generated repeatedly or scanned
- **THEN** the invoice SHALL remain Sent and the PoC SHALL NOT claim that money moved or payment was verified

### Requirement: Presentation and evidence package
The PoC SHALL include a timed architecture/hard-problem presentation, diagrams, deterministic demo instructions, a requirement-to-evidence matrix, and a repeatable local verification command that distinguishes implemented behavior from manual or future evidence.

#### Scenario: Reproduce final evidence
- **WHEN** a reviewer follows the final local verification and demo instructions
- **THEN** the documented architecture, billing calculation, idempotency, ownership, persistence, state, and VietQR claims SHALL each map to an observable automated or runtime result

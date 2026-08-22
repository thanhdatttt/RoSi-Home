# Mobile UI Integration Specification

## ADDED Requirements

### Requirement: Canonical mobile route baseline

The system SHALL use the mobile route tree restored from `main` as the canonical presentation baseline and SHALL NOT retain duplicate legacy routes when an equivalent canonical route exists.

#### Scenario: Equivalent legacy screen exists

- **WHEN** a legacy `Frontend` screen and a canonical `main` route cover the same user interaction
- **THEN** required behavior is ported into the canonical route or its adapter
- **AND** the duplicate route is not restored

### Requirement: Story and contract traceability

Every implemented mobile flow SHALL be traceable to a Product Backlog story, allowed role, backend contract, and verification state.

#### Scenario: Route is considered implementation-ready

- **WHEN** work begins on a mobile route
- **THEN** its story, method/path, role, request/response envelope, OpenAPI state, and verification requirements are recorded

#### Scenario: Backend contract is missing

- **WHEN** the desired UI interaction has no approved backend contract
- **THEN** the client presents an explicit unavailable state or omits the interaction
- **AND** it does not fabricate a successful response

### Requirement: Role-aware navigation and authorization

The mobile application SHALL route authenticated users according to their single backend role and SHALL treat server-side authorization as authoritative.

#### Scenario: User signs in successfully

- **WHEN** the backend returns a valid access token, refresh token, and user role
- **THEN** a Landlord is routed to the landlord shell
- **AND** a Tenant is routed to the tenant shell

#### Scenario: Refresh cannot recover an unauthorized request

- **WHEN** an authenticated request receives `401` and token refresh fails
- **THEN** stored credentials are cleared
- **AND** the user returns to the login flow
- **AND** concurrent failed requests do not trigger multiple refresh rotations

### Requirement: Standard API envelopes

The mobile client SHALL support the standard success, paginated-list, and error envelopes defined by the architecture specification.

#### Scenario: Paginated list is returned

- **WHEN** an endpoint returns `{ data, meta }`
- **THEN** the route receives both the data collection and pagination metadata without unsafe casting

#### Scenario: API error is returned

- **WHEN** the backend returns a non-success status with a standard error envelope
- **THEN** the UI receives the status, code, user-safe message, and field errors needed by the interaction

### Requirement: Multipart uploads remain binary-safe

Payment proof and maintenance photo uploads SHALL use multipart requests without JSON serialization or a manually forced multipart boundary.

#### Scenario: User submits an allowed image

- **WHEN** the mobile client uploads a supported image within the configured size/count limit
- **THEN** it sends `FormData` to the approved endpoint with authentication
- **AND** the backend remains responsible for MIME validation, ownership, and private storage

### Requirement: Evidence-based completion

A mobile story SHALL NOT be reported Done solely because its route renders, TypeScript passes, or Expo exports successfully.

#### Scenario: Automated build succeeds

- **WHEN** typecheck and export pass for a slice
- **THEN** compile/bundle evidence is recorded
- **AND** remaining API integration, real-device, delivery, file, QR, or PDF UAT gates remain explicit

### Requirement: pnpm is canonical

The mobile project SHALL use pnpm and SHALL keep a single pnpm lockfile.

#### Scenario: Dependencies are installed or changed

- **WHEN** a developer installs or updates a mobile dependency
- **THEN** pnpm updates `pnpm-lock.yaml`
- **AND** no npm lockfile is introduced

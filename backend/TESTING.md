# Backend Testing and TDD

## Commands

```bash
npm test
npm run test:api
npm run test:integration
npm run test:integration:local
npm run test:watch
npm run test:coverage
npm run typecheck
npm run typecheck:test
npm run build
```

## TDD Workflow

For every new backend business rule:

1. Add or update an OpenSpec scenario.
2. Write the smallest test that expresses the scenario.
3. Run the focused test and confirm it fails for the expected reason.
4. Implement the smallest production change that makes it pass.
5. Refactor while keeping the test suite green.
6. Run the full test, coverage, typecheck, and build commands.
7. Mark the OpenSpec task complete only after all checks pass.

## Current Test Boundary

Billing Foundation has automated coverage for:

- Utility Metered/Flat business combinations and `422` errors.
- Utility request validation and deterministic current-rate query ordering.
- Surcharge inclusive range overlap and invalid period behavior.
- Surcharge request validation and non-unique active-name index intent.
- Shared transaction executors for billing mutations and audit writes.
- Surcharge `updatedAt` and soft-delete metadata.

Meters (US-METER-01/02/03) has automated coverage for:

- Initial baseline readings (no consumption/charge) and duplicate-reading `409`s.
- Flat-water properties rejecting a water meter reading.
- Missing-previous-reading and reading-lower-than-previous `422`s.
- Electricity and metered-water consumption/charge calculation from the
  effective rate.
- Correction: supersedes (not overwrites) the original reading, blocks
  corrections once the linked invoice is `Sent`/`Paid`, and triggers draft
  invoice recalculation.
- Room-ownership authorization for both recording and correcting readings.

Invoices (US-INVOICE-01/02/03/04) has automated coverage for:

- Draft generation: itemized rent/electricity/water/surcharge line items,
  idempotent re-generation, skip-with-reason when a required reading is
  missing, and the flat-per-tenant-water exemption from needing a reading.
- The scheduled monthly job evaluating every property with an active lease.
- View authorization: landlord ownership, tenant-own-invoice-only, and
  `Draft` invoices being landlord-only.
- PDF download reusing the same authorization and headers.
- Send: `Draft` → `Sent` exactly once, rejecting a non-`Draft` send, and the
  tenant push notification.
- Recalculation on correction, and no-op once the invoice has left `Draft`.

Maintenance submission (US-MAINT-01) has automated coverage for:

- Tenant-only multipart submission with required room, title, and description.
- An applicable active lease on the submitted room, including cross-owner `404` behavior.
- Zero to three PNG/JPG/JPEG photos, 5 MB per-file limits, extension checks, and magic-byte MIME sniffing.
- Whole-batch validation before storage, plus compensating object cleanup on storage or database failure.
- Atomic request, photo metadata, and audit persistence in PostgreSQL.
- Initial `Pending` status and an owning-landlord push notification with a maintenance deep link.

Tenant maintenance request reads (US-MAINT-02) have automated coverage for:

- Tenant-only paginated list and detail contracts.
- SQL scoping through the authenticated user's own `tenant_info` relationship.
- Room identity/name, submission timestamp, and the current persisted status.
- Private photo paths converted to five-minute signed URLs only after ownership succeeds.
- Cross-tenant request-ID guessing returning scoped `404` without reading or signing attachments.

Landlord maintenance request reviews (US-MAINT-03) have automated coverage for:

- Landlord-only portfolio scoping at the SQL query layer, including paginated list reads.
- `propertyId` and `status` filters using the fixed maintenance-status vocabulary.
- List/detail responses with property, room, tenant, description, submission time, current status, and five-minute signed photo URLs.
- Cross-landlord list/detail isolation, with scoped `404` detail responses and no foreign attachment signing.
- Read-only review behavior: GET requests do not change status/completion timestamps or create status-history/audit rows.

Maintenance status updates (US-MAINT-04) have automated coverage for:

- Landlord-only `PATCH /api/v1/maintenance-requests/:id/status` with scoped owner authorization.
- Allowed `Pending -> InProgress`, `InProgress -> Completed`, and direct `Pending -> Completed` transitions.
- `422` responses for same-status retries and backward/disallowed transitions with no side effects.
- Atomic request status/completion timestamp, status-history, responsible-landlord, and audit persistence.
- Tenant-visible status after the update and Push-only tenant notification after transaction commit.
- Compare-and-set concurrency behavior so duplicate updates create one history/audit/notification set.

Room maintenance history (US-MAINT-05) has automated coverage for:

- Landlord-only `GET /api/v1/rooms/:roomId/maintenance-requests` with standard pagination.
- SQL-level room/property ownership scoping and indistinguishable `404` responses for missing or foreign rooms.
- Request title, requester identity/name, submission timestamp, current status, and complete chronological status history.
- Completed requests remaining visible and historical requester names surviving tenant archival.
- Empty owned rooms returning an empty `200` list and tenant access returning `403`.

## API Automation Layers

### Contract tests — available now

Run:

```bash
npm run test:api
```

These Supertest scenarios start the Express app in-process and verify:

- health response;
- missing-token `401`;
- wrong-role `403`;
- request validation `400`;
- business-rule `422`;
- Utility create/get status codes and response envelopes;
- Surcharge create/list/update/delete status codes, pagination, and envelopes.

Domain services are mocked in this layer. Contract tests are fast and deterministic,
but they do not prove SQL queries, migrations, or real transaction rollback.

### PostgreSQL integration tests

Run:

```bash
npm run test:integration
```

The suite creates a uniquely named temporary schema, applies the generated Billing
migration, runs real repository/service/HTTP behavior, and drops the schema after
the run. Prefer `TEST_DATABASE_URL`; `DATABASE_URL` is accepted only when the
operator explicitly approves temporary-schema writes to that database.

Recommended setup:

1. For a zero-configuration local run with Docker, use
   `npm run test:integration:local`. It starts PostgreSQL 16 on port `55432`,
   waits for readiness, exports the dedicated `TEST_DATABASE_URL`, runs the
   suite, and removes the container even when tests fail.
2. To keep the local test server running between commands, use
   `npm run test:db:up`, run `npm run test:integration`, then use
   `npm run test:db:down`. The matching URL is:
   `postgresql://rosihome_test:rosihome_test@127.0.0.1:55432/rosihome_test`.
3. Alternatively, provision a dedicated PostgreSQL server and set
   `TEST_DATABASE_URL` explicitly.
4. Apply the committed Drizzle migration chain before the suite.
5. Start `createApp()` with real services and repositories.
6. Seed a landlord, tenant, property, room, and JWT fixtures.
7. Reset data between tests using transaction rollback or table truncation.
8. Run the same HTTP scenarios plus cross-owner `404`, audit rollback,
   non-overlapping surcharge versions, and concurrency cases.
9. In CI, use a disposable PostgreSQL service container; never point tests at
   development, staging, or production data.

### Deploy smoke/UAT collection — optional

For human-readable manual verification, maintain a Bruno collection containing the
same core flows and environment variables (`baseUrl`, tokens, resource IDs).
Bruno is useful for demos and exploratory testing, while Supertest remains the
authoritative automated regression suite.

The integration suite covers:

- transaction rollback when a utility audit insert fails;
- concurrent overlapping surcharge writes;
- generated migration behavior for `surcharges_name_active`;
- real-service cross-landlord `404`;
- same-name, non-overlapping surcharge persistence.
- maintenance request/photo/audit transaction rollback and storage compensation;
- maintenance active-lease authorization and owner-only notification persistence.
- maintenance tenant list/detail pagination, current-status reads, signed-photo responses,
  and cross-tenant request/attachment isolation.
- maintenance landlord portfolio/status filtering, triage context, cross-landlord
  request/attachment isolation, and mutation-free list/detail review behavior.
- maintenance status transition/history/completion/audit persistence, scoped owner updates,
  Push-only tenant notification, and concurrent duplicate suppression.
- room maintenance-history pagination, full chronological transition reads, completed-request
  visibility, archived-requester retention, empty-room behavior, and cross-landlord isolation.

## Coverage Gate

Vitest enforces minimum Billing Foundation coverage:

- Statements: 70%
- Branches: 65%
- Functions: 65%
- Lines: 70%

Coverage is a regression signal, not proof of correctness. Acceptance still
requires scenarios, code review, and the pending PostgreSQL integration tests.

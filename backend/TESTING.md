# Backend Testing and TDD

## Commands

```bash
npm test
npm run test:api
npm run test:integration
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

1. Provision a dedicated PostgreSQL database through `TEST_DATABASE_URL`.
2. Apply the committed Drizzle migration chain before the suite.
3. Start `createApp()` with real services and repositories.
4. Seed a landlord, tenant, property, room, and JWT fixtures.
5. Reset data between tests using transaction rollback or table truncation.
6. Run the same HTTP scenarios plus cross-owner `404`, audit rollback,
   non-overlapping surcharge versions, and concurrency cases.
7. In CI, use a disposable PostgreSQL service container; never point tests at
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

## Coverage Gate

Vitest enforces minimum Billing Foundation coverage:

- Statements: 70%
- Branches: 65%
- Functions: 65%
- Lines: 70%

Coverage is a regression signal, not proof of correctness. Acceptance still
requires scenarios, code review, and the pending PostgreSQL integration tests.

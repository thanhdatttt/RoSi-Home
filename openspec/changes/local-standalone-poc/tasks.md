## 1. Phase 0 - Contract and standalone scaffold

- [x] 1.1 Create and validate the OpenSpec proposal, design, capability specification, and phased task list.
- [x] 1.2 Create the isolated npm workspace, API and Expo package manifests, TypeScript configuration, environment example, ignore rules, and local runbook.
- [x] 1.3 Install and lock the standalone dependencies and verify package resolution without modifying the existing application workspaces.
- [x] 1.4 Perform the read-only Phase 0 formal review and record its bilingual result before Phase 1 begins.

## 2. Phase 1 - Local API vertical slice

- [x] 2.1 Implement injectable PGlite/Drizzle database creation, schema initialization, deterministic synthetic seed accounts, and reset behavior.
- [x] 2.2 Implement salted password verification, JWT login, authentication middleware, validation, error handling, and local-only CORS/configuration.
- [x] 2.3 Implement owner-scoped property list/create/detail and utility-rate update modules through route, service, and repository layers.
- [x] 2.4 Add automated tests for health, login failure/success, missing authentication, validation, property workflows, ownership isolation, reset, and close/reopen persistence.
- [x] 2.5 Run API tests, type-check, and build checks and perform the read-only Phase 1 formal review before Phase 2 begins.

## 3. Phase 2 - Expo presentation vertical slice

- [x] 3.1 Implement the typed local API client and in-memory authentication session with no mock-data fallback.
- [x] 3.2 Implement Expo/React Native login, property list/create, property detail, and utility-rate edit workflows with loading, empty, success, and error states.
- [x] 3.3 Add deterministic local demo instructions and verify API/mobile type-checking plus Expo Web export.
- [x] 3.4 Perform the read-only Phase 2 formal review and record its bilingual result.

## 4. Later phase - Billing and VietQR hard problem

- [x] 4.1 Specify billing state transitions, utility consumption rules, monetary rounding, idempotency, and a local VietQR payload contract.
- [x] 4.2 Implement billing generation, owner isolation, and deterministic local VietQR generation without an external payment service.
- [x] 4.3 Add hard-problem tests and perform a formal review of the billing/VietQR phase.

## 5. Later phase - Presentation evidence

- [x] 5.1 Create the architecture and hard-problem demonstration script with observable claims and expected results.
- [x] 5.2 Capture repeatable verification evidence and prepare the final presentation artifact.
- [x] 5.3 Perform the final formal review and reconcile evidence against every implemented requirement.

## 6. Physical iPhone private-LAN extension

- [x] 6.1 Extend the OpenSpec contract for configurable LAN binding, machine-local Expo environment, iOS local-network intent, runtime evidence, and preserved Web behavior.
- [x] 6.2 Implement and document the API LAN host, Expo iOS configuration, iPhone run command, ignored machine-local URL, and current-device runbook.
- [x] 6.3 Add configuration coverage, run all verification plus a LAN HTTP smoke test, and perform the read-only bilingual Phase 6 review.

## 7. Rename local PoC workspace

- [x] 7.1 Rename the standalone workspace to `poc-local/` and update all source, OpenSpec, evidence, runbook, and presentation references.
- [x] 7.2 Verify no old workspace token remains, run the complete verification suite, validate OpenSpec strictly, and perform the read-only bilingual Phase 7 review.

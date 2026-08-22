# Requirement-to-evidence matrix

This matrix maps each implemented PoC claim to evidence a reviewer can reproduce locally. “Automated” means the claim is asserted without manual UI interpretation; “Runtime” means the expected result is visible during the deterministic walkthrough; “Future” marks capabilities deliberately outside the PoC.

| Claim | Implementation boundary | Evidence type | Reproduce | Expected result |
| --- | --- | --- | --- | --- |
| Standalone local runtime | `poc-local/` imports no existing app runtime and defaults to ports 3100/8082 | Runtime + inspection | `npm run dev`; inspect package imports | API and Expo Web start without Render, Supabase, `backend/`, or `mobile/` |
| Physical iPhone private-LAN path | API binds to configurable host; ignored Expo URL points at the Windows LAN address; iOS declares local-network intent; HTTP reset is disabled on LAN | Runtime + automated configuration test | `npm run dev:iphone`; open `http://<WINDOWS-LAN-IP>:3100/health` in iPhone Safari | Health returns PGlite status, Expo uses the same local API, and unauthenticated LAN reset returns 404 |
| No silent mock fallback | Typed Expo client talks only to the configured local API | Runtime | Stop API and reload properties | Explicit connection error is shown |
| Persistent disposable data | Filesystem PGlite plus deterministic reset | Automated + runtime | `npm test`; restart API; `npm run poc:reset` | Close/reopen persistence passes and reset restores seed accounts |
| Authentication | Salted password verification and time-limited JWT | Automated | `npm test` | Valid login succeeds; invalid login and missing token are rejected |
| Owner-scoped properties | Property queries include authenticated landlord ID | Automated + runtime | Run tests; compare Landlord A/B UI | Cross-owner read/update behaves as not found |
| Layered architecture | Route, middleware, service, repository, Drizzle, and injected database are separate | Inspection + automated | Inspect `apps/api/src`; run Supertest suite | Real HTTP pipeline passes without a TCP listener |
| Expo vertical slice | Login/property/rate screens use the real API | Runtime + build | Follow `DEMO.md`; `npm run build` | Saved rates reload from PGlite; Expo Web export succeeds |
| Reproducible billing | Milli-unit `BigInt` calculation with integer-VND half-up rounding | Automated + runtime | Billing tests; demo `100.125 -> 112.625` and `20 -> 22.333` | Total is exactly `4,085,744` VND |
| Immutable invoice snapshot | Inputs, rates, line items, policy, dates, and fingerprint are stored | Automated + runtime | Generate invoice, then alter property rates | Existing invoice total and snapshot do not change |
| Database idempotency | Unique `(property, normalized room, period)` plus SHA-256 fingerprint | Automated + runtime | Repeat identical request, then change one input | Identical request replays; conflicting input returns 409 |
| Bounded state machine | Only `Draft -> Sent`; first `sent_at` is preserved | Automated + runtime | Send the same invoice twice | Status is Sent and timestamp remains unchanged |
| Owner-scoped invoices | Every invoice path joins through the owned property | Automated | Run billing tests as the second landlord | Read/send/QR operations return 404 and do not mutate data |
| Deterministic local VietQR | Local TLV/CRC builder and QR renderer; no payment API | Automated + runtime | Run VietQR tests; generate twice in UI | Payload/amount/remark match, CRC validates, status remains Sent |
| Repeatable verification | One command runs tests, type-check, build/export, and audit gate | Automated artifact | `npm run verify:evidence` | `verification-latest.md` and `.json` report PASS |
| Native packaging | Outside PoC | Future | Not applicable | No claim |
| Production PostgreSQL operations | Outside PoC | Future | Not applicable | No claim |
| Full leases/meters and tariff engine | Outside PoC | Future | Not applicable | No claim |
| Payment proof, reconciliation, automatic confirmation, `Paid` | Outside PoC | Future | Not applicable | No claim |

## Evidence files

- `verification-latest.md`: human-readable latest verification run.
- `verification-latest.json`: machine-readable equivalent with command, exit code, duration, and bounded output.
- `../DEMO.md`: deterministic live walkthrough and expected observations.
- `../presentation/PRESENTATION_SCRIPT.md`: timed talk track connecting architecture decisions to the live proof.

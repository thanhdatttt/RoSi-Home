# RoSi-Home local PoC — presentation script

Target duration: 10-12 minutes. The talk proves two claims only: the selected architecture works end to end, and the hardest bounded billing/VietQR problem is solvable. Keep the slide deck open while Expo on the physical iPhone (with Expo Web as fallback) and two PowerShell terminals are ready in the background.

## Slide 1 — Architecture works; the hard problem has evidence (30 seconds)

“This is a new, disposable PoC under `poc-local/`. It neither calls the deployed backend nor imports the existing application. I will prove an end-to-end architecture first, then prove reproducible billing and local VietQR.”

## Slide 2 — Two questions must be answered (45 seconds)

Explain the acceptance criteria:

1. Can Expo/React Native, Express/TypeScript, and a PostgreSQL-compatible data layer operate through the proposed boundaries?
2. Can fractional metering, integer money, idempotency, state, ownership, and a deterministic VietQR be implemented without external services?

## Slide 3 — One machine, three real layers (60 seconds)

Walk from Expo on the iPhone over private Wi-Fi to Express on Windows port 3100 and filesystem PGlite. Expo Web on port 8082 remains the fallback. Point out that the client sees only HTTP, the route sees services rather than SQL, and repositories own database queries. PGlite is used as local PostgreSQL-compatible evidence, not as a production operations claim.

## Slide 4 — A UI action crosses observable boundaries (60 seconds)

Trace one rate update: typed fetch, JWT middleware, Zod validation, service policy, owner-scoped repository, Drizzle query, and persisted PGlite record. Mention that dependency injection lets Supertest exercise this real pipeline without listening on a port.

## Slide 5 — The difficult part is preserving invariants (60 seconds)

Frame billing as four coupled risks: floating-point money, duplicate generation, mutable historical rates, and cross-owner/state leakage. The PoC makes each invariant visible and testable.

## Slide 6 — 4,085,744 VND is reproducible (60 seconds)

Show the worked calculation. Readings are parsed into milli-units; charges use `consumptionMilli × rate` and integer half-up rounding. The invoice snapshots readings, rates, dates, line items, calculation policy, and a SHA-256 fingerprint.

## Slide 7 — Duplicate and conflict are different outcomes (60 seconds)

Explain the database unique identity `(property, normalized room, period)`. An identical fingerprint returns the existing record; changed input for the same identity returns 409. `Draft -> Sent` is the only transition and repeated send preserves the original timestamp.

## Slide 8 — VietQR is local and deliberately bounded (60 seconds)

Explain that the API builds and parses the EMV TLV locally, validates CRC16, then renders the QR. The payload contains the exact stored amount and deterministic remark. Generating or scanning it does not set `Paid`; no payment gateway or bank confirmation exists in this PoC.

## Slide 9 — Evidence replaces promises (45 seconds)

Point to 25 passing tests across six files, strict checks for both packages, a successful API/Expo build, a zero high/critical audit gate, and strict OpenSpec validation. Moderate Expo toolchain advisories may still be reported, but they do not fail the configured high-severity production gate.

## Live demo — follow `DEMO.md` (4-5 minutes)

1. Reset and start the workspace.
2. Login, create/select a property, set and reload rates.
3. Generate the worked invoice and repeat it to show replay.
4. Change one reading to show conflict without overwriting history.
5. Save synthetic bank data; show Draft rejection, send once, then generate QR twice.
6. Switch landlord to show isolation.
7. Run `npm run verify:evidence` in the second terminal.

If time is short, skip the API-offline and second-landlord UI steps; show their automated test rows in the evidence report instead.

## Slide 10 — Conclusion (45 seconds)

“The architecture claim is supported by a working vertical slice, not a diagram alone. The hard-problem claim is supported by deterministic arithmetic, database constraints, immutable snapshots, owner/state guards, and locally validated VietQR. Production identity, native packaging, operational PostgreSQL, full lease/meter integration, payment proof, reconciliation, and `Paid` remain explicit future work.”

## Recovery plan

- Port conflict: run `Get-NetTCPConnection -LocalPort 3100,8082` and stop only the identified local PoC process.
- Dirty demo data: run `npm run poc:reset` and fully reload Expo on the iPhone or Expo Web fallback.
- Expo page unavailable: keep the API proof with `npm test` and the latest evidence report; do not substitute screenshots as runtime proof.
- QR scan cannot resolve the synthetic beneficiary: explain that structural validity is automated and real account scanning is optional manual evidence.

## Technical references for the VietQR explanation

- NAPAS QR format version 1.5.2: `https://www.kiemtrabank.com/documents/QR_Format_T%26C_v1.5.2_EN_102022.pdf`
- VietQR payload field examples: `https://app.unpkg.com/vietqr-payment%400.0.2/files/README.md`

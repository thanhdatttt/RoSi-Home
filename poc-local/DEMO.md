# Complete local PoC demo script

This deterministic walkthrough proves the two requested PoC claims: the chosen architecture works end to end, and the difficult billing/VietQR path can be solved within a clearly bounded local scope. It uses synthetic data and never calls the deployed RoSi-Home backend.

## 1. Prepare and start (1 minute)

Open PowerShell in `poc-local/`:

```powershell
npm run poc:reset
npm run dev
```

For a physical iPhone on the same private Wi-Fi, use the machine-specific URL in `apps/mobile/.env.local` and start instead with:

```powershell
npm.cmd run dev:iphone
```

On the iPhone, grant Expo Go Local Network permission and verify `http://<WINDOWS-LAN-IP>:3100/health` in Safari before scanning the Expo QR code.

Expected evidence:

- API listens on port 3100, prints loopback/LAN candidates, and persists beneath `.data/rosihome-poc`.
- Expo Web opens at `http://127.0.0.1:8082`.
- The login screen identifies the local API and the three architecture layers.

## 2. Prove the real vertical slice (2 minutes)

1. Sign in as `landlord-a@poc.local` with `demo-password`.
2. Create `Sunrise House` at `12 Local Demo Street` and select it.
3. Save electricity rate `3500` and water rate `18000`.
4. Choose **Tải lại từ DB**, select the property again, and observe the persisted rates.

Observable request path:

```text
Expo field -> typed fetch -> Express route -> JWT middleware
           -> service -> owner-scoped repository -> Drizzle -> PGlite
           <- JSON response <- persisted record
```

Optional failure proof: stop the API, choose **Tải lại từ DB**, and observe the explicit connection error instead of mock data. Restart with `npm run dev:api` before continuing.

## 3. Prove the hard billing calculation (2 minutes)

In the Billing panel, use:

| Input | Value |
| --- | ---: |
| Room | `P.101` |
| Period | `2026-07` |
| Base rent | `4000000` VND |
| Electricity | `100.125 -> 112.625` |
| Water | `20 -> 22.333` |

Expected calculation:

```text
Electricity: 12.500 x 3,500 =    43,750 VND
Water:        2.333 x 18,000 =    41,994 VND
Base rent:                         4,000,000 VND
Total:                             4,085,744 VND
```

The API converts readings to integer milli-units and rounds half-up with integer arithmetic. The UI shows the snapshotted inputs, rates, line items, rounding policy, and SHA-256 input fingerprint.

Generate the same invoice again. Expected: the existing invoice is returned as an idempotent replay, with no duplicate record. Change one reading while keeping the same property, room, and period. Expected: HTTP 409 is displayed and the original snapshot remains unchanged.

## 4. Prove state and local VietQR boundaries (2 minutes)

1. Save synthetic bank details: BIN `970422`, account `123456789`, holder `ROSI LOCAL DEMO`.
2. Attempt QR while the invoice is Draft. Expected: the API rejects it.
3. Choose **Gửi hóa đơn**. Expected: status becomes `Sent` and one `sent_at` value appears.
4. Send again. Expected: the first timestamp is preserved.
5. Generate VietQR. Expected: a QR image and payload appear with amount `4085744` and remark `ROSI P.101 202607`.
6. Generate QR again. Expected: the payload is identical and invoice status remains `Sent`.

The server validates the local EMV TLV structure and CRC before returning the image. This proves deterministic payload construction, not a real bank account, money movement, or payment confirmation.

## 5. Prove ownership isolation (1 minute)

Log out and sign in as `landlord-b@poc.local` with `demo-password`. Landlord B cannot see Sunrise House or its invoice. Automated tests additionally assert cross-owner property, invoice, send, and VietQR operations return 404.

## 6. Reproduce automated evidence (2 minutes)

In a separate PowerShell terminal:

```powershell
npm run verify:evidence
```

Expected result:

- 6 test files and 25 tests pass.
- API and Expo packages pass strict TypeScript checks.
- API compiles and Expo Web exports successfully.
- The high/critical production dependency audit gate passes.
- `evidence/verification-latest.md` and `.json` record the result.

Validate the implementation contract from the repository root:

```powershell
npx.cmd -y @fission-ai/openspec@latest validate local-standalone-poc --strict
```

## Claims deliberately not made

- Expo Go on a physical iPhone proves the shared React Native runtime and LAN integration, not app-store packaging or a standalone production binary.
- PGlite is not evidence of production PostgreSQL concurrency, backup, or operations.
- Local JWT/demo credentials are not production identity controls.
- The synthetic room and tenant input is not a complete lease/meter subsystem.
- VietQR structure and CRC do not prove the beneficiary exists or that payment occurred.
- Payment proof, bank reconciliation, automatic confirmation, and `Paid` remain future work.

# RoSi-Home local PoC

This workspace is a local, disposable proof of concept. It is runtime-isolated from the repository's existing `backend/` and `mobile/`: it does not import their code or configuration and does not call the deployed RoSi-Home backend, Supabase, or another required external service.

## Implemented PoC scope

- Local Express/TypeScript API on port `3100`, reachable by loopback and the private LAN
- Private-LAN API binding for a physical iPhone running Expo
- Local PostgreSQL-compatible PGlite data beneath `.data/`
- JWT login with two synthetic landlord accounts
- Owner-scoped property creation, listing, detail, and utility rates
- Reproducible integer-VND invoice calculation from decimal meter readings
- Immutable invoice snapshots, database-enforced idempotency, and `Draft -> Sent`
- Owner-scoped local bank configuration and deterministic local VietQR rendering
- Expo SDK 54/React Native presentation at `http://127.0.0.1:8082`
- Automated API, authorization, persistence, billing, state, and VietQR checks

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer

No Docker, PostgreSQL server, cloud database, or deployed backend is required.

For a physical iPhone, Windows and the phone must use the same trusted/private Wi-Fi. Node.js must be allowed through Windows Firewall for Private networks only.

## Install and run

From this directory:

```powershell
npm install
npm run dev
```

The combined command starts the API and Expo Web. To run the processes in separate terminals:

```powershell
npm run dev:api
npm run dev:mobile
```

## Run on a physical iPhone

Find the Windows Wi-Fi IPv4 address:

```powershell
ipconfig | Select-String IPv4
```

Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`, replace the example with that address, and start LAN mode:

```powershell
npm.cmd run dev:iphone
```

Scan the Expo QR code with the iPhone. In iOS, enable **Settings → Privacy & Security → Local Network → Expo Go**. Before opening the PoC workflow, verify this URL in iPhone Safari, replacing the address when necessary:

```text
http://192.168.1.24:3100/health
```

Expected response: `{"status":"ok","storage":"pglite"}`. If Safari cannot open it, check that both devices are on the same Wi-Fi, Windows classifies the network as Private, and Node.js is allowed through the Private-network firewall. `expo start --tunnel` tunnels Metro only; it does not tunnel API port 3100.

`apps/mobile/.env.local` is machine-specific and ignored by Git. Fully reload Expo after changing it. The default API bind is `0.0.0.0`; set `POC_API_HOST=127.0.0.1` in the root `.env` to restore loopback-only mode.

For safety, LAN mode does not expose the HTTP `/api/poc/reset` endpoint. Reset from the Windows terminal with `npm.cmd run poc:reset`; the HTTP reset endpoint is available only in loopback/test mode.

The defaults work without a `.env` file. To override them, copy `.env.example` to `.env` and keep the file local.

## Deterministic demo accounts

These accounts contain synthetic data only:

| Role | Email | Password |
| --- | --- | --- |
| Landlord A | `landlord-a@poc.local` | `demo-password` |
| Landlord B | `landlord-b@poc.local` | `demo-password` |

## Verification and reset

```powershell
npm test
npm run typecheck
npm run build
npm run verify:evidence
npm run poc:reset
```

`verify:evidence` runs the tests, strict type-checks, API/Expo build, and high-severity production dependency audit. It writes the latest reproducible result to `evidence/verification-latest.md` and `.json`.

`poc:reset` removes mutable local PoC records and recreates the synthetic seed state. `.data/`, `.env`, build output, and dependencies are ignored by Git.

The complete timed walkthrough is in `DEMO.md`; presentation notes and the requirement-to-evidence matrix are under `presentation/` and `evidence/`.

## Demonstration boundary

Expo Web and the optional physical-iPhone LAN workflow demonstrate that the React Native presentation layer, HTTP API, authentication, layered services/repositories, PostgreSQL-compatible local persistence, billing calculation, and local VietQR rendering work together. LAN mode exposes synthetic PoC endpoints to devices on the current network, so use it only on a trusted/private Wi-Fi. It does not claim production security, native app-store packaging, cloud operations, production PostgreSQL performance, a real beneficiary account, money movement, or payment verification.

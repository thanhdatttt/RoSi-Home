# RoSi-Home

Property management system for landlords and tenants — automated monthly billing, lease
tracking, utility metering, and maintenance requests. Mobile-first (React Native / Expo),
backed by a Node.js/Express REST API and PostgreSQL (Supabase).

## Architecture

Monolithic 3-layer client-server system (see `docs/architecture.md` and
`openspec/specs/ARCHITECTURE.md` for the full engineering conventions).

| Layer | Tech |
|---|---|
| Mobile app | React Native (Expo) — `mobile/` |
| API | Node.js + Express + TypeScript — `backend/` |
| ORM / DB | Drizzle ORM + PostgreSQL (Supabase) |
| File storage | Supabase Storage |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Scheduled jobs | `node-cron` (in-process) |
| Push / Email | FCM / SMTP provider behind an interface |

> **Scope note:** Per PD-07 in `docs/product_backlog.md`, the current development cycle is
> **mobile-only**. The web client is architected for but not part of this cycle.

## Repository layout

```
/backend   Node.js/Express/TypeScript REST API (port 3000)
/mobile    React Native (Expo) mobile app
/docs       Product & architecture documentation
/openspec  Approved specs (architecture + feature specs)
```

## Getting started

### Backend (`backend/`)
1. `cp .env.example .env` and fill in `DATABASE_URL`, `JWT_SECRET`, Supabase/FCM/email keys.
2. `npm install`
3. `npm run db:push` (apply Drizzle schema to Supabase Postgres)
4. `npm run db:seed` (seed regulatory rate defaults — PD-03)
5. `npm run dev`

### Mobile (`mobile/`)
1. `cp .env.example .env` (set `EXPO_PUBLIC_API_BASE_URL`)
2. `npm install`
3. `npm start` (Expo Dev Tools)

## Conventions (must read before coding)
- Error/response envelopes, auth/ownership rules, money rounding, soft-delete + audit,
  status enums, and the full data model are fixed in `openspec/specs/ARCHITECTURE.md`.
- Feature behavior per story lives in `openspec/specs/FEATURE-SPECS.md`.
- Each backend module under `backend/src/modules/<name>` follows:
  `router.ts`, `controller.ts`, `service.ts`, `repository.ts`, `schema.ts`, `types.ts`.
- Business logic belongs in `service.ts`, never in route handlers (keeps it testable).

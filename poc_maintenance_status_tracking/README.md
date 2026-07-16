# RosiHome Maintenance Status Tracking PoC

This standalone Proof of Concept validates **F-13 — Maintenance Status Tracking** in `docs/product_backlog.md` using the stack selected in `docs/architecture.md`:

- React web demonstration surface;
- Node.js/Express REST API;
- PostgreSQL-compatible PGlite with Drizzle ORM;
- JWT demo authentication with backend role/ownership enforcement; and
- persistent simulated mobile-push events.

The approved PoC state machine is:

```text
Pending → In Progress → Completed
```

Skipping, moving backward, and reopening are rejected. Repeating the current status is idempotent and creates no duplicate history or notification.

## Scope Boundary

F-13 depends on F-12 Maintenance Request Submission. To keep this PoC focused, valid requests and active lease relationships are seeded. Request creation and photo upload are not implemented. The seeded requests contain zero attachments, which is allowed by F-12's zero-to-three-photo rule.

This PoC validates status tracking feasibility. It does not mark F-12 or F-13 as production `Done`.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Install and Run

```powershell
cd poc_maintenance_status_tracking
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5174`. Vite proxies `/api` to Express at `http://localhost:3001`.

Production-style local run:

```powershell
npm.cmd run build
npm.cmd start
```

Then open `http://localhost:3001`.

## Demonstration Flow

1. Sign in as **Chủ nhà P101**.
2. Filter the owned requests by Pending, In Progress, or Completed.
3. Open the pending kitchen-sink request. Confirm that reviewing it does not change status.
4. Change `Pending → In Progress`. Review the actor/timestamp audit entry.
5. Repeat `In Progress`; the API returns an idempotent result without duplicate history or notification.
6. Change `In Progress → Completed` and open the P101 room history. Both completed requests remain visible.
7. Sign in as **Người thuê P101**. Confirm the final status, shared history, and two `mobile_push_simulated` events.
8. Use the unrelated landlord and tenant accounts to verify portfolio isolation.

## Main API Surface

| Method and path | Purpose |
|---|---|
| `GET /api/maintenance-requests?status=...` | Return only requests accessible to the authenticated landlord/tenant, optionally filtered |
| `GET /api/maintenance-requests/:id` | Return request, property, room, tenant, attachments, and status history without side effects |
| `PATCH /api/maintenance-requests/:id/status` | Apply the linear owner-only transition or return an idempotent same-status result |
| `GET /api/rooms/:roomId/maintenance-history` | Return all requests/history for an owned room, including completed work |
| `GET /api/notifications` | Return the authenticated user's simulated mobile-push events |

## Automated Verification

```powershell
npm.cmd test
```

The suite maps to POC-M-01 through POC-M-12 and covers:

- owner-scoped listing and status filters;
- side-effect-free detail review;
- landlord and tenant data isolation;
- rejected skip/backward/reopen transitions;
- successful owner-only transitions with actor/timestamp history;
- same-status idempotency;
- tenant read-only behavior;
- simulated mobile-push recipient/channel behavior;
- completed room history; and
- persistence after database restart.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Express port | `3001` |
| `JWT_SECRET` | JWT signing key | Development-only built-in value |
| `DATABASE_PATH` | Persistent PGlite data directory | `.data/rosihome-maintenance-poc` |

## PoC Limitations

- Demo login replaces real registration, password management, and tenant provisioning.
- F-12 request creation, photo upload, and storage are seeded/excluded.
- React Web is a demonstration surface; the Product Backlog's final Definition of Done still requires mobile delivery.
- Notification rows prove trigger and recipient behavior but do not contact a real mobile push provider. No Web notification is created.
- Reopening a completed request is deliberately excluded from the approved PoC transition policy.
- Production deployment, migration workflow, monitoring, security hardening, and performance validation remain future work.

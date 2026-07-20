# Testing the RosiHome mobile app (React Native / Expo)

This guide covers three things:
1. How to run the frontend and exercise **US-TENANT-01/02** and **US-LEASE-01→06**.
2. How to test **push notifications** end-to-end on a real device.
3. The HTTP collections in `/test` for hitting the backend endpoints directly.

---

## 1. Running the mobile app

```bash
cd mobile
npm install        # already done; run again if node_modules changed
npm start          # expo dev server (Metro)
```

Then choose a runner:
- **Android physical device**: `npm run android` (or scan the QR with the Expo Go / dev-build app).
- **iOS physical device**: `npm run ios` (requires a dev build + your Mac).
- **Web (no push)**: `npm run web` — push notifications are mobile-only, so the Push tab shows an error on web by design.

> The app uses the `@/` path alias for imports (e.g. `@/lib/f you ever see
> `Cannot find module '@/...'`, delete `.expo` and restart Mapi`, `@/contexts/auth-context`).
> This was broken because two modules were missing and `babel.config.js` did not exist.
> Both are now in place, so Metro resolves `@/` correctly. Ietro.

### Pointing the app at the backend

The API base URL is read from `mobile/app.json` → `expo.extra.apiUrl`
(currently `http://localhost:3000`). **On a physical device `localhost` means
the phone, not your laptop.** Set it to your machine's LAN IP, e.g.:

```jsonc
"extra": {
  "apiUrl": "http://192.168.1.20:3000",
  ...
}
```

(Or override via the `API_BASE_URL` env var.) Make sure the backend is running
(`cd backend && npm run dev`) and reachable on that port.

---

## 2. Testing US-TENANT-01 / US-TENANT-02 and US-LEASE-01 → 06 in the app

The fastest full-path check is the **Push** tab (bottom nav), which also serves
as a login + device-registration screen:

1. Log in as a **landlord** (email + password).
2. The lease/tenant stories themselves have no dedicated screen yet — they are
   backend-driven. Verify them two ways:
   - **Via the backend HTTP collections** in `/test` (see §4) — this exercises
     every acceptance criterion (201/422/409, ownership 404, tenant provisioning).
   - **Via the mobile Push screen** for the tenant-provisioning half of
     US-TENANT-02: after creating a lease in `/test/leases.http`, the tenant
     receives an emailed temporary password. Log in on a second device/simulator
     with **username = the tenant's phone number** and that temp password; the
     app is then forced to change the password (US-AUTH-05), which proves the
     provisioned `Tenant` account works.

### What to assert per story
| Story | How to verify |
|---|---|
| US-TENANT-01 | Landlord `GET /tenants`, `GET /tenants/:id`, `PATCH /tenants/:id`, `DELETE /tenants/:id` (soft archive, then 404). Use `/test/tenants.http`. |
| US-TENANT-02 | Create a lease with a brand-new phone/email (`/test/leases.http` → US-LEASE-01). Then log in as that phone and confirm a `Tenant` account exists + must change password. |
| US-LEASE-01 | `POST /leases` returns 201 with `tenantAccountProvisioned:true`; overlap/date/format errors return 422/409. |
| US-LEASE-02 | `GET /leases/:id` as landlord and as the linked tenant; cross-user fetch → 404. |
| US-LEASE-03 | `PATCH /leases/:id` plain edit (endDate/rent/deposit) and renewal (renewalStartDate+renewalEndDate); editing a non-Active lease → 422. |
| US-LEASE-04 | `POST /leases/:id/end` → status `Ended`; ending again → 422. |
| US-LEASE-05 | `GET`/`PATCH /properties/:propertyId/lease-reminder-config` enable 7/3/1-day flags. |
| US-LEASE-06 | `GET /leases/upcoming-expirations` lists leases expiring inside the window. |

---

## 3. Testing push notifications

Push uses **Expo's push service** (the backend sends to Expo, Expo fans out to
FCM/APNs). The mobile app already has a dedicated **Push** tab.

### Prerequisites
- A **physical device** (Expo push does not work in simulators/emulators or in
  Expo Go on Android for remote push — use a dev build).
- `expo.extra.eas.projectId` set in `app.json` (already present).
- The device and your laptop on the **same network**, with `apiUrl` pointing at
  your laptop's LAN IP (§1).

### Manual test (recommended)
1. Open the app → **Push** tab.
2. Log in (landlord or tenant).
3. Tap **Register this device for push**. The app requests notification
   permission, gets an Expo push token, and `POST`s it to
   `POST /api/v1/notifications/device-tokens`. The token shows on screen.
4. Tap **Send test notification**. This calls
   `POST /api/v1/notifications/test`, which sends a real Expo push to your
   device. You should see the banner/alert even while the app is open.
5. The "Last notification received" card updates when the push arrives.

### Automated / backend-only check (no device needed)
Use `/test/notifications.http`:
- Register a placeholder Expo-format token → expect `201`.
- `POST /notifications/test` → expect `200 { sent:true }`.
- On a real device, replace the placeholder token with the one shown in the
  mobile Push tab to actually receive it.

> Note: `sendNotification` is fire-and-forget by design (architecture §6) — a
> failed push never rolls back the business operation (e.g. sending an invoice
> stays `Sent`). Delivery failures are logged server-side, not surfaced as API
> errors.

### Scheduled reminders (US-REMINDER-01, US-LEASE-05)
These are fired by `node-cron` jobs in the backend (`sendLeaseExpirationReminders`,
`sendOverdueReminders`). To test without waiting for the schedule, trigger the
job function directly (exposed as an internal callable in
`backend/src/jobs/`), or temporarily set the cron to a near time. The device
must be registered (step 3 above) to receive them.

---

## 4. HTTP test collections (`/test`)

Open these with the **REST Client** VS Code extension (the `.http` files use
its `{{variable}}` syntax). Select the `local` or `device` environment from the
`rest-client.env.json` file.

| File | Covers |
|---|---|
| `auth.http` | US-AUTH-01..06 (register, login, refresh, logout, change pw, recover) |
| `profile.http` | US-PROFILE-01 |
| `tenants.http` | US-TENANT-01 (list/get/update/archive), US-TENANT-02 context |
| `leases.http` | US-LEASE-01 → 06 (create, view, list, update/renew, end, upcoming, reminder config) + tenant login/provisioning |
| `notifications.http` | device-token registration + test push (US-REMINDER/US-LEASE-05 pathway) |

### Chaining variables
Files capture tokens and IDs across requests:
- `auth.http` / `leases.http` login → `@accessToken`, `@refreshToken`.
- `leases.http` auto-resolves a room: `@propertyId` (from `GET /properties`),
  then `@roomId` (from `GET /properties/:id/rooms`), so you don't hard-code IDs.
- Created lease → `@leaseId`, `@tenantInfoId` are reused by later requests.

Run order within a file: top-to-bottom. Start with `auth.http` (login) so the
other files have `accessToken` in REST Client's variable scope, or just run
`leases.http` which logs in itself.

> The backend must be running and migrated (`cd backend && npm run dev`,
> `npm run db:migrate`) and reachable at the `baseUrl` you selected.

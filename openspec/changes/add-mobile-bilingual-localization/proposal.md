## Why

RosiHome's mobile UI is currently English-only and strings are distributed across routes and components, which prevents users from choosing Vietnamese without duplicating screens or altering backend contracts. The mobile app needs a persistent, role-independent language preference that supports English and Vietnamese.

## What Changes

- Add a mobile i18n provider with English and Vietnamese dictionaries.
- Persist a user's language selection locally and expose it from Profile.
- Localize shared navigation, account/profile, role labels, primary landlord and tenant dashboards, and the landlord Property/Room management flow.
- Add locale-aware date, number, and VND formatting helpers for client-rendered values.
- Keep backend API routes, request/response fields, enums, and stored business data unchanged.

## Capabilities

### New Capabilities

- `mobile-bilingual-localization`: User-selectable English and Vietnamese presentation for the Expo mobile client.

### Modified Capabilities

- None.

## Impact

- Affected code: `mobile/src/app`, `mobile/src/components`, and new `mobile/src/i18n` modules.
- No new runtime dependency is required; existing secure/local storage persists the preference.
- Backend errors, email, PDF, and push-message content remain unchanged in this change.

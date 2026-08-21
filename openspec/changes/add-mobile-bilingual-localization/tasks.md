## 1. Localization foundation

- [x] 1.1 Create typed English and Vietnamese dictionaries for shared UI, role, status, and primary dashboard content.
- [x] 1.2 Add the provider, persisted preference, and locale-aware date, number, and VND formatting helpers.
- [x] 1.3 Mount the provider at the app root and add a language selector to Profile.

## 2. Primary mobile surfaces

- [x] 2.1 Localize role-aware bottom navigation and account/profile UI.
- [x] 2.2 Localize authentication entry and Landlord/Tenant dashboard presentation.
- [x] 2.3 Localize landlord Property and Room management views and retain the landlord dock throughout that module.
- [x] 2.4 Migrate the remaining feature routes (auth recovery, leases, invoices, maintenance, utilities, surcharges, reports, and tenant detail screens) from English literals to the shared dictionary.
- [x] 2.5 Localize client presentation of API error codes and transport failures without changing backend payloads.

## 3. Verification

- [ ] 3.1 Typecheck the mobile client and manually verify the selected language persists across a reload.

## Delivery status

**Done and wait to review**

- Static implementation review is complete: role-specific sign-in guidance, tenant payment history routing, Vietnamese presentation strings, and client-side transport/API error presentation are covered across landlord and tenant surfaces.
- Automated checks passed on 2026-08-18: `pnpm --dir mobile exec tsc --noEmit`, OpenSpec strict validation, and `git diff --check`.
- The remaining checkbox is an intentional reviewer/device step: select Vietnamese in Profile, reload the app, and exercise one landlord and one tenant screen. It must be observed in the target runtime rather than inferred from static code.

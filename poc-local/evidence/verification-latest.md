# Latest local PoC verification

- Started: `2026-07-22T17:31:54.677Z`
- Completed: `2026-07-22T17:32:45.413Z`
- Overall result: **PASS**

| Check | Command | Result | Duration |
| --- | --- | --- | ---: |
| Automated API and hard-problem tests | `npm test` | PASS | 23.6 s |
| Strict TypeScript checks | `npm run typecheck` | PASS | 5.2 s |
| API build and Expo Web export | `npm run build` | PASS | 19.6 s |
| Production dependency audit (high or critical) | `npm audit --omit=dev --audit-level=high` | PASS | 2.4 s |

### Automated API and hard-problem tests

```text
   ✓ persists an owned property after closing and reopening PGlite  4385ms
 ✓ tests/billing.test.ts (8 tests) 2730ms
   ✓ billing and VietQR hard-problem slice > sends exactly once and generates deterministic locally validated VietQR  314ms
 ✓ tests/api.test.ts (9 tests) 2637ms
   ✓ local API > resets mutable data and restores seeded login  369ms
 ✓ tests/config.test.ts (3 tests) 5ms
 ✓ tests/vietqr.test.ts (3 tests) 4ms

 Test Files  6 passed (6)
      Tests  25 passed (25)
   Start at  00:31:56
   Duration  22.04s (transform 237ms, setup 0ms, collect 4.99s, tests 15.10s, environment 1ms, prepare 844ms)
```

### Strict TypeScript checks

```text
> poc-local@0.1.0 typecheck
> npm run typecheck --workspace @rosi-home-poc/api && npm run typecheck --workspace @rosi-home-poc/mobile


> @rosi-home-poc/api@0.1.0 typecheck
> tsc --noEmit


> @rosi-home-poc/mobile@0.1.0 typecheck
> tsc --noEmit
```

### API build and Expo Web export

```text
Web apps\mobile\index.ts ▓▓▓▓░░░░░░░░░░░░ 27.3% (23/44)
Web apps\mobile\index.ts ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 99.0% (204/205)
Web Bundled 7700ms apps\mobile\index.ts (209 modules)

› web bundles (1):
_expo/static/js/web/index-7dc0591f413b3437fe9f1bb5e375bf53.js (412 kB)

› Files (2):
index.html (1.19 kB)
metadata.json (49 B)

Exported: dist
```

### Production dependency audit (high or critical)

```text
      @expo/prebuild-config  *
      Depends on vulnerable versions of @expo/config
      Depends on vulnerable versions of @expo/config-plugins
      node_modules/@expo/prebuild-config

11 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

## Evidence boundaries

- No deployed backend, Supabase, payment gateway, or banking API is required.
- Expo Web does not prove native app-store packaging.
- PGlite does not prove production PostgreSQL operations or concurrency.
- VietQR structural validity does not prove that money moved or payment was verified.

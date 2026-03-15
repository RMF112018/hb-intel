# Wave 1 CI Gate Checklist

**Purpose:** Define what CI must enforce for Wave 1-critical areas.
**Date:** 2026-03-15
**CI config:** `.github/workflows/ci.yml`

---

## 1. Current CI Jobs

| Job | What It Enforces | Packages Covered |
|-----|-----------------|-----------------|
| `lint-and-typecheck` | ESLint (all workspace tasks), PH7.13 stub scan (grep-based), TypeScript `check-types` (all targets) | All workspace packages |
| `unit-tests` | Backend + provisioning unit tests with Azurite emulator | `@hbc/functions`, `@hbc/provisioning` |
| `unit-tests-p1` | P1 platform package tests with 95%/90% coverage thresholds | `@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity` |

---

## 2. Wave 1 Gate Additions

| Gate | What It Covers | Implementation | CI Job |
|------|---------------|----------------|--------|
| **Admin app tests** | 59 tests: provisioning oversight, operational dashboards, alert polling, system settings, routing, complexity | `pnpm --filter @hbc/spfx-admin test` | `unit-tests-apps` |
| **Estimating app tests** | Wizard, request detail, coordinator retry, completion handoff, complexity gating | `pnpm --filter @hbc/spfx-estimating test` | `unit-tests-apps` |
| **Accounting app tests** | Review queue, review detail, complexity gating | `pnpm --filter @hbc/spfx-accounting test` | `unit-tests-apps` |
| **PWA tests** | Parity (wizard config, state labels), bootstrap, routing | `pnpm --filter @hbc/pwa test` | `unit-tests-apps` |
| **Role-branch gate** | No hardcoded `role ===` checks in app source files | `bash tools/check-no-role-branch.sh` | `unit-tests-apps` |

The `unit-tests-apps` job runs in parallel with existing `unit-tests` and `unit-tests-p1` jobs.

---

## 3. Gate Enforcement Rules

1. **All four CI jobs must pass** before merge to `main`: `lint-and-typecheck`, `unit-tests`, `unit-tests-p1`, `unit-tests-apps`
2. **CD triggers only on CI success** — enforced via `check-ci` gate job in `cd.yml`
3. **Coverage thresholds** — P1 packages maintain 95% lines/functions/statements, 90% branches (Vitest workspace config)
4. **App tests** — no coverage thresholds (app-level, not library-level) but all tests must pass with zero failures
5. **Stub enforcement** — PH7.13 grep scan in `lint-and-typecheck` job exits non-zero on unapproved stubs
6. **Type safety** — `pnpm turbo run check-types` must report zero type errors across all workspace targets

---

## 4. Cross-Contract Verification (Already Covered)

The following cross-surface verification is already enforced through existing CI jobs:

| Verification | CI Job | Package |
|-------------|--------|---------|
| Provisioning state transitions (all 8 states) | `unit-tests` | `@hbc/provisioning` |
| BIC ownership derivation (all states + edge cases) | `unit-tests` | `@hbc/provisioning` |
| Cross-contract alignment (TC-OWN, TC-NOTIF, TC-FLOW, TC-MYWK, TC-CMPLX) | `unit-tests` | `@hbc/provisioning` |
| Notification registration validation (15 events) | `unit-tests` | `@hbc/provisioning` |
| Auth guard resolution | `unit-tests-p1` | `@hbc/auth` |
| Shell navigation and degraded recovery | `unit-tests-p1` | `@hbc/shell` |
| Complexity tier gating | `unit-tests-p1` | `@hbc/complexity` |
| BIC module registration | `unit-tests-p1` | `@hbc/bic-next-move` |

---

## 5. What CI Does NOT Enforce (Accepted Boundaries)

| Gap | Why Accepted | Mitigation |
|-----|-------------|------------|
| Smoke tests (SharePoint operations) | Requires live Azure tenant; unsafe for CI | Opt-in via `SMOKE_TEST=true` for manual verification |
| Integration tests (`.todo()` placeholders) | Gated on dev-tenant provisioning | Activate when safe dev-tenant is available |
| SPFx deployment verification | Blocked on Vite-to-.sppkg pipeline (PH8) | CD has `if: false` guard; PH8 scope |
| E2E / Playwright | Requires browser runtime; separate verification tier | Available via `pnpm e2e` for targeted runtime validation |

---

## Related Documents

- [Cross-Surface Verification](./cross-surface-verification.md) — test posture and coverage inventory
- [Stub Enforcement CI](./stub-enforcement-ci.md) — PH7.13 enforcement details
- [Release Verification Checklist](./release-verification-checklist.md) — pre-merge and pre-release checklists
- [Verification Commands](./verification-commands.md) — command routing and reporting standard

# Release Verification Checklist

**Purpose:** Compact pre-merge and pre-release checklists for foundational flows and Wave 1-critical areas.
**Date:** 2026-03-15
**Related:** [Verification Commands](./verification-commands.md), [Release Readiness Taxonomy](../release-readiness-taxonomy.md)

---

## 1. Pre-Merge Checklist (Every PR to main)

- [ ] `pnpm turbo run lint` — zero errors
- [ ] `pnpm turbo run check-types` — zero type errors
- [ ] `pnpm scan-stubs` — zero unapproved stubs (exit 0)
- [ ] Changed-package tests pass: `pnpm --filter <package> test`
- [ ] No new `role ===` checks in app source: `bash tools/check-no-role-branch.sh`
- [ ] If shared package changed → consumer app tests pass
- [ ] If auth/permission changed → `pnpm --filter @hbc/auth test` passes
- [ ] If provisioning changed → `pnpm --filter @hbc/provisioning test` passes (includes cross-contract)
- [ ] If UI changed → visual review in dev-harness or Storybook
- [ ] Documentation updated for changed behavior (per `docs/reference/developer/documentation-authoring-standard.md`)

---

## 2. Pre-Release Checklist (Wave-Level)

- [ ] All CI jobs green on `main`:
  - [ ] `lint-and-typecheck` (lint + stub scan + type check)
  - [ ] `unit-tests` (backend + provisioning with Azurite)
  - [ ] `unit-tests-p1` (auth, shell, sharepoint-docs, bic-next-move, complexity)
  - [ ] `unit-tests-apps` (admin, estimating, accounting, PWA, role-branch gate)
- [ ] `pnpm scan-stubs:all` reviewed — no unexpected approved stubs
- [ ] Cross-contract tests pass: `pnpm --filter @hbc/provisioning test -- --grep "t08"`
- [ ] PWA parity tests pass: `pnpm --filter @hbc/pwa test`
- [ ] Admin app tests pass: `pnpm --filter @hbc/spfx-admin test` (59 tests)
- [ ] Code-Ready readiness level confirmed per `docs/reference/release-readiness-taxonomy.md`
- [ ] Wave 0 closeout items confirmed as Wave 1 scope (per `current-state-map.md §7.2–7.3`)

---

## 3. Foundational Flow Verification

Quick-reference commands for verifying foundational flows:

| Flow | Command | Expected |
|------|---------|----------|
| Provisioning state machine | `pnpm --filter @hbc/provisioning test` | All state transition tests pass |
| BIC ownership derivation | `pnpm --filter @hbc/provisioning test -- --grep "bic"` | `deriveCurrentOwner` tested for all 8 states |
| Cross-contract alignment | `pnpm --filter @hbc/provisioning test -- --grep "t08"` | All TC-* IDs pass |
| Admin recovery paths | `pnpm --filter @hbc/spfx-admin test` | 59 tests: oversight, dashboards, alerts, routing |
| Shell route protection | `pnpm --filter @hbc/auth test` | Guard resolution tests pass |
| PWA parity | `pnpm --filter @hbc/pwa test` | Wizard config + state label parity pass |
| Stub enforcement | `pnpm scan-stubs` | Exit 0 (clean) |
| Role-branch gate | `bash tools/check-no-role-branch.sh` | Exit 0 (clean) |
| Notification registrations | `pnpm --filter @hbc/provisioning test -- --grep "notification"` | 15 event registrations validated |
| Failure modes | `pnpm --filter @hbc/provisioning test -- --grep "failure"` | FM-01 through FM-10 validated |

---

## 4. Smoke Test Activation (Optional — Not Required for Merge)

Backend smoke tests verify live SharePoint operations. They are opt-in and require Azure credentials.

```bash
# Activate smoke tests (requires Azure tenant access)
SMOKE_TEST=true pnpm --filter @hbc/functions test -- --grep "smoke"

# Activate integration tests (requires safe dev-tenant)
SHAREPOINT_INTEGRATION_TEST=true pnpm --filter @hbc/functions test -- --grep "integration"
```

These tests have 180s timeouts and clean up by deleting created sites. **Do not run against production tenants.**

---

## 5. Release Readiness Levels (Reference)

Per `docs/reference/release-readiness-taxonomy.md`:

| Level | Meaning | Sign-Off Required |
|-------|---------|-------------------|
| **Code-Ready** | Source code, tests, docs complete; CI passes | Architecture Owner + Product Owner |
| **Environment-Ready** | Infrastructure provisioned in target environment | Factual checklist (no named sign-off) |
| **Operations-Ready** | Monitoring, alerting, runbooks, support handoff complete | Architecture Owner + Operations Owner |
| **Production-Ready** | All three levels achieved | Product Owner (final) |

Wave 0 achieved Code-Ready (PH7.12 evidence package, ADR-0091). Wave 1 targets Code-Ready at minimum.

---

## Related Documents

- [Wave 1 CI Gates](./wave-1-ci-gates.md) — CI job definitions
- [Verification Commands](./verification-commands.md) — command routing and reporting standard
- [Release Readiness Taxonomy](../release-readiness-taxonomy.md) — three-level readiness model
- [Release Sign-Off Template](../../architecture/release/release-signoff-template.md) — sign-off format

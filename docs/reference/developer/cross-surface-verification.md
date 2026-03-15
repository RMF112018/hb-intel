# Cross-Surface Verification

**Purpose:** Define test posture requirements for Wave 1-critical packages and inventory existing cross-surface verification coverage.
**Date:** 2026-03-15

---

## 1. Test Posture Requirements

Wave 1-critical packages must not pass CI with absent or purely placeholder test coverage.

| Package Tier | Test Requirement | Enforcement |
|-------------|-----------------|-------------|
| **Category A (core platform)** | Tests required. P1 packages maintain 95%/90% coverage thresholds. | Vitest workspace config + `unit-tests-p1` CI job |
| **Category C (shared-feature primitives)** | Tests required for all packages with runtime logic. 19/20 have tests. | Code review + CI (via consuming app tests) |
| **Wave 1 apps** | All existing tests must pass. No placeholder-only test files. | `unit-tests-apps` CI job |
| **Backend** | Tests required. Azurite-backed integration tests. | `unit-tests` CI job |
| **`@hbc/health-indicator`** | **Must add tests** before Wave 1 critical-path use (0 tests, 6 src files). | Hardening action — blocks Estimating bid readiness. |

---

## 2. Existing Cross-Surface Coverage Inventory

### Parity Tests (SPFx ↔ PWA consistency)

| Test | What It Verifies | Location |
|------|-----------------|----------|
| Wizard config parity | Wizard step configuration matches between SPFx and PWA surfaces | `apps/pwa/src/test/parity/wizardConfig.test.ts` |
| State labels parity | All 8 lifecycle states have labels and badge variants | `apps/pwa/src/test/parity/stateLabels.test.ts` |

### Cross-Contract Verification (shared primitive interaction)

| Test ID | What It Verifies | Location |
|---------|-----------------|----------|
| TC-OWN-04 | BIC config is a single importable object | `packages/provisioning/src/t08-cross-contract-verification.test.ts` |
| TC-OWN-06 / TC-NOTIF-07 | Action string ↔ notification body alignment | Same file |
| TC-FLOW-06 | projectNumber excluded from wizard field map | Same file |
| TC-CLAR-03 | Notification template key distinctness | Same file |
| TC-CLAR-04 | Clarification response shape | Same file |
| TC-MYWK-01–04 | BIC module registration shape for My Work Feed | Same file |
| TC-NOTIF-06 | No frontend send in provisioning exports | Same file |
| TC-CMPLX-06 | Complexity helpers accept tier, not role | Same file |
| TC-CMPLX-07 | Coaching prompts Essential-only | Same file |
| TC-FAIL-06 | Complexity fallback contract | Same file |

### App-Level Verification

| Test Suite | Tests | What It Covers | Location |
|-----------|-------|---------------|----------|
| Admin oversight | 17 | State filter tabs, detail modal, admin-exclusive actions, cross-app nav | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` |
| Admin dashboards | 10 | Alert summary, probe health, infrastructure status | `apps/admin/src/test/OperationalDashboardPage.test.tsx` |
| Admin alert polling | 9 | Polling service lifecycle, skip-when-no-backend | `apps/admin/src/test/alertPollingService.test.ts` |
| Estimating wizard | ~10 | Draft auto-save, resume, clarification return, submission, complexity | `apps/estimating/src/test/NewRequestPage.test.tsx` |
| Estimating detail | ~8 | State badge, ownership, clarification banner, complexity | `apps/estimating/src/test/RequestDetailPage.test.tsx` |
| Estimating coordinator | ~5 | Retry eligibility, failure classification, retry action | `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` |
| Estimating completion | ~5 | Completion card, Project Hub URL, handoff assembly | `apps/estimating/src/test/RequestDetailPage.completion.test.tsx` |
| Accounting queue | ~8 | Filter tabs, queue columns, action routing | `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` |
| Accounting detail | ~7 | Approve/clarify/hold/route-to-admin actions | `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` |

### Infrastructure Verification

| Tool | What It Verifies | Location |
|------|-----------------|----------|
| Role-branch gate | No hardcoded `role ===` in app source | `tools/check-no-role-branch.sh` |
| Stub scanner | No unapproved stub implementations | `tools/scan-stubs.ts` |
| Backend smoke tests | 5 SharePoint operations (opt-in) | `backend/functions/src/.../smoke.test.ts` |

---

## 3. What Is Not Yet Covered

| Gap | Risk | Mitigation |
|-----|------|------------|
| No parity tests for estimating/accounting/project-hub SPFx ↔ PWA | Medium — surface behavior drift | Add parity tests during Wave 1 feature implementation |
| Smoke tests opt-in only | Low — env-gated for safety | Document activation; do not force in CI |
| Integration tests as `.todo()` | Low — gated on dev-tenant | Activate when safe dev-tenant provisioned |
| No systematic shell route protection tests in app suites | Low — guards tested in `@hbc/auth` | Auth guard tests cover the contract |
| No end-to-end browser tests in CI | Low — separate verification tier | Available via `pnpm e2e` for targeted runtime validation |

---

## 4. Adding Cross-Surface Tests for Wave 1 Features

When implementing a Wave 1 feature that spans SPFx and PWA:

1. **Add parity tests** verifying shared config/state between surfaces (follow `apps/pwa/src/test/parity/` pattern)
2. **Add cross-contract tests** if the feature introduces new shared-primitive interactions (follow `t08-cross-contract-verification.test.ts` pattern)
3. **Ensure BIC registration tests** exist if the feature registers a BIC module
4. **Verify action strings** align between BIC config and notification templates

---

## Related Documents

- [Wave 1 CI Gates](./wave-1-ci-gates.md) — CI job definitions and enforcement rules
- [Verification Commands](./verification-commands.md) — command routing and reporting standard
- [Provisioning Verification Matrix](../provisioning/verification-matrix.md) — provisioning-specific evidence

# Phase 11 — Accounting SPFx Reconciliation and Closure Report

**Date:** 2026-04-02
**Phase:** Phase 11 — Accounting SPFx Artifact Reconciliation, Packaging Alignment, and Production Hardening
**Scope:** 9 prompts covering packaging truth, bundle contract, API permissions, runtime injection, hosted dependencies, shell continuity, artifact rebuild, hosted validation planning, and closure.

---

## 1. Executive Summary

**Phase 11 is repo-complete. The Accounting SPFx surface is classified as staging-ready only.**

All 6 core audit concerns that triggered this phase have been resolved through evidence-based investigation, documentation hardening, targeted test additions, and a fresh artifact rebuild. The Accounting `.sppkg` can now be traced from source through build path, permissions, runtime injection, and packaged artifact without ambiguity.

What remains are hosted environment validations and tenant-admin prerequisites (23 hosted checks, 9 external prerequisites) that cannot be verified from the repo. The next step is hosted staging execution, not further repo work.

### Phase 11 by the numbers

| Metric | Value |
|--------|-------|
| Prompts executed | 9 of 9 |
| Review memos created | 8 |
| Phase-local reference docs created | 9 |
| New test files added | 3 (bundleContract, shellInjectionChain, runtimeConfig already existed) |
| New tests added | 45 (18 bundle contract + 27 injection chain) |
| Total Accounting tests | 105 (9 files) |
| Docs updated (stale → current) | 3 (auth contract, Phase 7 audit, current-state-map) |
| Code changes required | 0 (all source was already correct) |
| Artifact rebuilt | Yes — `hb-intel-accounting.sppkg` verified against all P11 determinations |

---

## 2. Original Finding Disposition Matrix

| # | Original Audit Finding | P11 Prompt | Disposition | Evidence |
|---|----------------------|-----------|-------------|----------|
| F1 | Canonical packaging/build truth is ambiguous — unclear whether `ShellWebPart` indicates drift | P11-01 | **Disproven** — ShellWebPart is the intentional, canonical generic wrapper for all 12 domains | [Packaging Truth Freeze](accounting-spfx-packaging-truth-freeze.md) |
| F2 | Accounting entry surface and bundle contract are under-documented | P11-02 | **Confirmed and resolved** — dual-entry path (mount.tsx production, AccountingWebPart.tsx dev) documented, bundle contract tests added | [Bundle Contract Reconciliation](accounting-entry-surface-and-bundle-contract-reconciliation.md) |
| F3 | Permission contract contradiction — docs say no API access, package declares it | P11-03 | **Confirmed and resolved** — Phase 10 made Accounting an active API caller; stale docs updated | [Permission Contract Reconciliation](accounting-protected-api-permission-contract-reconciliation.md) |
| F4 | Runtime config injection may not match Project Setup parity | P11-04 | **Disproven** — injection mechanism is identical across all domains; injection chain tests added | [Runtime Config Injection Hardening](accounting-runtime-config-injection-and-packaged-shell-hardening.md) |
| F5 | Hidden `/api/users/me/*` dependencies may be active in hosted runtime | P11-05 | **Disproven** — triple-gate isolation (default-off flag, no consumer activation, dynamic import) ensures zero runtime calls; confirmed by Phase 10 P10-07 | [Hidden Dependency Reconciliation](accounting-hidden-hosted-dependency-reconciliation.md) |
| F6 | Accounting and Project Setup shell behaviors may have drifted | P11-06 | **Disproven** — all differences are justified domain specializations; no accidental drift found | [Shell Continuity Review](accounting-vs-project-setup-shell-continuity-review.md) |

**Summary:** 2 findings confirmed and resolved (F2, F3); 4 findings disproven by repo evidence (F1, F4, F5, F6). No findings remain open.

---

## 3. Final Package/Repo Alignment Status

| Property | Repo Truth | Artifact Truth | Aligned |
|----------|-----------|---------------|---------|
| Solution name | `hb-intel-accounting` | `hb-intel-accounting` | Yes |
| Solution ID | `7dca8e93-b2fb-4e06-9e4b-d14118f87990` | Same | Yes |
| Component ID | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` | Same | Yes |
| Feature ID | `fbb5ac04-cf50-458b-91dd-3784de51a7af` | Same | Yes |
| Build entry | `apps/accounting/src/mount.tsx` | IIFE bundle from mount.tsx | Yes |
| Global name | `__hbIntel_accounting` | Confirmed in shell asset | Yes |
| Packaging path | Vite → orchestrator → spfx-shell → .sppkg | Confirmed by successful build | Yes |

---

## 4. Final Permission Contract Status

| Property | Status |
|----------|--------|
| `webApiPermissionRequests` declared | Yes — `hb-intel-api-production / access_as_user` |
| Permission in AppManifest.xml | Confirmed in rebuilt .sppkg |
| Auth contract doc updated | Yes — Accounting added as authorized caller |
| Phase 7 audit updated | Yes — G7-02 resolution corrected for Phase 10 evolution |
| Code paths using protected API | `ProjectReviewQueuePage.listRequests()`, `ProjectReviewDetailPage.advanceState()` |

---

## 5. Final Runtime Injection Status

| Constant | Injection Path Verified | App Default When Empty |
|----------|------------------------|----------------------|
| `__FUNCTION_APP_URL__` | Yes | ConfigError in production mode |
| `__BACKEND_MODE__` | Yes | `'production'` |
| `__ALLOW_BACKEND_MODE_SWITCH__` | Yes (intentionally unused in Accounting) | `false` |
| `__API_AUDIENCE__` | Yes | `undefined` — token acquisition skipped |

Parity with Estimating: **Full** — identical injection mechanism. Consumer-side differences (no ui-review adapter, no mode switching) are intentional.

---

## 6. Final Hosted Dependency Status

| Dependency | Runtime Status | Isolation |
|-----------|---------------|-----------|
| `/api/users/me/preferences` | Unreachable | Triple-gate: `enableApiSync=false` + no consumer activation + dynamic import |
| `/api/users/me/groups` | Unreachable | Same triple-gate |
| `ComplexityProvider` | Active — required for UI gating | Legitimate production dependency |

---

## 7. Final Shell Continuity Status

All 7 identified differences between Accounting and Estimating are governed as intentional domain specializations. No accidental drift was found. Key distinctions:

- Accounting: multi-view controller workspace with tool picker
- Estimating: single-workflow surface with backend mode switching and draft persistence

Both share identical shell infrastructure: `ShellLayout` (simplified), `WorkspacePageShell`, `HbcErrorBoundary`, `ComplexityProvider`, breadcrumbs, session guards.

---

## 8. Artifact Evidence Summary

| Property | Value |
|----------|-------|
| Artifact | `dist/sppkg/hb-intel-accounting.sppkg` |
| Size | 293.1 KB |
| SHA-256 | `b0c0ee558e358835b4618f3f45a53c30d7e46be7d00be5ca96176472001ae53d` |
| Vite bundle | `accounting-app-8acaff18.js` (1,029 KB) |
| Shell webpart | `shell-web-part_e0c51b569817b47b5742.js` (3 KB) |
| Build classification | Staging-targeted (local build; CI/CD required for production env vars) |
| All P11 determinations verified against artifact | Yes |

---

## 9. Hosted Validation Readiness Summary

| Category | Items | Status |
|----------|-------|--------|
| App catalog deployment + trust | H1–H3 | Pending — requires SharePoint Admin |
| API access approval | H4–H6 | Pending — requires SharePoint Admin |
| Token acquisition | H7–H9 | Pending — requires Developer + Admin |
| Function App URL resolution | H10–H11 | Pending — requires CI/CD-built artifact |
| Backend connectivity | H12–H14 | Pending — requires Developer |
| CORS verification | H15–H16 | Pending — requires DevOps |
| Same-origin isolation | H17 | Pending — requires Developer |
| Smoke workflow | H18–H23 | Pending — requires Developer |

Full checklist: [P11-08 Hosted Staging Validation](accounting-hosted-staging-validation-and-tenant-approval-readiness.md)

---

## 10. Remaining External Blockers

| # | Blocker | Owner | Severity |
|---|---------|-------|----------|
| E1 | App registration `hb-intel-api-production` in Entra ID | IT / Identity | Blocker |
| E5 | SharePoint admin API access approval | SharePoint Admin | Blocker |
| E6 | Function App with `API_AUDIENCE` + `AZURE_TENANT_ID` | DevOps | Blocker |
| E8 | CI/CD pipeline builds `.sppkg` with production env vars | DevOps | Blocker |

5 additional prerequisites (E2, E3, E4, E7, E9) block specific validation tiers. See [P11-08](accounting-hosted-staging-validation-and-tenant-approval-readiness.md) for the complete register.

---

## 11. Final Readiness Classification

### **Staging-ready only**

**Repo-truth:** Complete. All packaging, contract, permission, injection, dependency, and continuity questions are resolved with evidence. 105 tests pass. Fresh artifact verified.

**Hosted-truth:** Not yet evidenced. 23 hosted validation items and 9 external prerequisites remain pending. No hosted environment execution has occurred.

**Production-truth:** Blocked on hosted validation + CI/CD production-target artifact build.

---

## 12. Recommended Next Action

**Execute hosted staging validation.**

1. **Immediate:** Request external prerequisites E1, E5, E6, E8 from IT / SharePoint Admin / DevOps teams (these can proceed in parallel)
2. **When prerequisites are met:** Execute hosted validation checklist H1–H23 with a CI/CD-built production-target artifact
3. **After hosted validation:** Re-classify based on evidence — if all H-items pass, the surface advances to pilot-ready or production-ready
4. **No further repo work is required** for Phase 11 — the next repo milestone is the phase that follows hosted validation results

---

## 13. Exact Files Inspected

### Phase 11 evidence chain (P11-01 through P11-08)
- `docs/architecture/reviews/accounting-spfx-packaging-truth-freeze.md`
- `docs/architecture/reviews/accounting-entry-surface-and-bundle-contract-reconciliation.md`
- `docs/architecture/reviews/accounting-protected-api-permission-contract-reconciliation.md`
- `docs/architecture/reviews/accounting-runtime-config-injection-and-packaged-shell-hardening.md`
- `docs/architecture/reviews/accounting-hidden-hosted-dependency-reconciliation.md`
- `docs/architecture/reviews/accounting-vs-project-setup-shell-continuity-review.md`
- `docs/architecture/reviews/accounting-production-target-sppkg-build-evidence.md`
- `docs/architecture/reviews/accounting-hosted-staging-validation-and-tenant-approval-readiness.md`

### Phase-local reference docs (01–08)
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/01-Canonical-Packaging-Truth-Freeze.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/02-Entry-Surface-and-Bundle-Contract.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/03-Accounting-API-Permission-Decision-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/04-Packaged-Shell-Injection-Evidence.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/05-Hosted-Dependency-Decision-Log.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/06-Shell-Continuity-and-Specialization-Guidance.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/07-Accounting-Production-Target-Artifact-Evidence.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/08-Hosted-Staging-Validation-Checklist.md`

### Docs updated during Phase 11
- `docs/reference/configuration/project-setup-api-auth-contract.md` (P11-03)
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md` (P11-03)
- `docs/architecture/blueprint/current-state-map.md` (P11-01)

### Tests added during Phase 11
- `apps/accounting/src/test/bundleContract.test.ts` (P11-02 — 18 tests)
- `apps/accounting/src/test/shellInjectionChain.test.ts` (P11-04 — 27 tests)

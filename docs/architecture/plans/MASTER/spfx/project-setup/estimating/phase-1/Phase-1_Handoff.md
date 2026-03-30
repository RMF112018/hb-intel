# Phase 1 — Final Handoff: Scope Control Complete

> Completed: 2026-03-30
> Package: `@hbc/spfx-project-setup` (apps/estimating)
> Version at handoff: 0.2.14

## 1. What Phase 1 Accomplished

### Routes
- Confirmed 4 frontend routes, all scoped to Project Setup (`/`, `/project-setup`, `/project-setup/new`, `/project-setup/$requestId`)
- No out-of-scope routes existed or were removed — the route tree was already clean

### Shell
- Confirmed simplified shell mode with no sidebar nav, no tool picker, back-to-hub enabled
- No out-of-scope shell affordances existed or were removed

### Code Changes
- Removed vestigial `useProjectStore` mock-project seeding from `bootstrap.ts` (no component consumed it)
- Removed dead `bid-tracking` feature flag from `bootstrap.ts` (never read by any component)
- Removed `IActiveProject` type import (only used by deleted mock data)

### API Surface
- Confirmed all 5 `IProjectSetupClient` methods map to real backend endpoints
- Confirmed SignalR negotiate endpoint is active and supported
- Confirmed no orphaned calls to notifications, groups, proxy, or preferences endpoints
- Documented `ComplexityProvider` → `GET /api/users/me/preferences` as gracefully degrading deferred dependency

### Contract
- Frozen contract document at `phase-1/Phase-1_Contract-Freeze.md` covering:
  - 4 frontend routes
  - 9 backend endpoints (6 frontend-callable + 3 backend-only)
  - Full type contract with all domain models
  - Response envelope shapes
  - Runtime mode rules (production vs ui-review)
  - Configuration contract with resolution order
  - Excluded scope enumeration

### Regression Guards
- 14 new acceptance tests in `phase1ScopeGuards.test.ts`:
  - Route scope guard (exact route set + 11 out-of-scope rejections)
  - API client scope guard (exactly 5 contracted methods)
  - Runtime mode guard (production defaults, ConfigError, ui-review behavior)
  - Static scope guard (source-level scan for prohibited imports)

### Test Coverage
- 18 test files, 126 tests passing (up from 112 at Phase 1 start)

## 2. What Remains Intentionally Deferred

| Item | Reason | Phase |
|------|--------|-------|
| `GET /api/users/me/preferences` endpoint | Backend preferences service not yet built; `ComplexityProvider` degrades gracefully to localStorage | Phase 2+ |
| Full auth-model redesign | Token-version hardening out of Phase 1 scope | Phase 2+ |
| SharePoint list-field remapping | Field mapping deferred per action plan | Phase 2+ |
| Full provisioning maturity (Steps 5/6/7 hardening) | Infrastructure work deferred | Phase 2+ |
| Entra token-version redesign | Out of Phase 1 scope | Phase 2+ |
| Non-Project-Setup backend routes | 80+ routes in shared Function App; not called by this frontend; no action needed | N/A |

## 3. Verification Status

| Check | Status | Details |
|-------|--------|---------|
| `check-types` | **Passed** | 24 tasks, full turbo cache |
| `lint` | **Passed** | 0 errors, 61 warnings (all pre-existing) |
| `build` | **Passed** | 1,183 kB bundle |
| `test` | **Passed** | 18 files, 126 passed, 2 todo |
| Route scope guard | **Passed** | Exact 4-route set verified |
| API client scope guard | **Passed** | Exactly 5 methods verified |
| Runtime mode guard | **Passed** | Production/ui-review rules verified |
| Static scope guard | **Passed** | No prohibited imports in source |

**Overall: Phase 1 verification PASSED.**

No failures, no partial results, no unresolved items.

## 4. Recommended Next Phase Entry Point

**First task for Phase 2:** Build the `/api/users/me/preferences` backend endpoint so the `ComplexityProvider` preferences call has a real backend. This is the only identified gap where the frontend expects a backend capability that doesn't yet exist (currently degrades gracefully).

**Alternative entry point:** If preferences are deprioritized, the next highest-value work is SharePoint list-field remapping to align the backend data model with the live SharePoint schema.

## Phase 1 Artifacts

| Artifact | Location |
|----------|----------|
| Scope Inventory & Decision Matrix | `phase-1/Phase-1_Scope-Inventory.md` |
| Prompt 02 Summary | `phase-1/Phase-1_Prompt-02-Summary.md` |
| Prompt 03 Summary | `phase-1/Phase-1_Prompt-03-Summary.md` |
| Contract Freeze | `phase-1/Phase-1_Contract-Freeze.md` |
| Release Checklist | `phase-1/Phase-1_Release-Checklist.md` |
| Scope Guard Tests | `apps/estimating/src/test/phase1ScopeGuards.test.ts` |
| This Handoff | `phase-1/Phase-1_Handoff.md` |

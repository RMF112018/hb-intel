# Backend Boundary Remediation Implementation — Scoped Service Resolution for PS Routes

> **Created:** 2026-04-01 (P9-G3-02)
> **Status:** Implemented

## 1. Chosen Remediation Path

**Option A** — switch all Project Setup route handlers and their internal dependencies from `createServiceFactory()` (monolithic) to `createProjectSetupServiceFactory()` (scoped). Both the dedicated PS host and the monolithic host now use the scoped factory for PS routes.

## 2. Files Changed

### Handler imports (5 files)

| File | Change |
|------|--------|
| `backend/functions/src/functions/projectRequests/index.ts` | Import and call `createProjectSetupServiceFactory` from `hosts/project-setup/service-factory.js` |
| `backend/functions/src/functions/provisioningSaga/index.ts` | Same |
| `backend/functions/src/functions/acknowledgments/index.ts` | Same |
| `backend/functions/src/functions/cleanupIdempotency/index.ts` | Same |
| `backend/functions/src/functions/timerFullSpec/handler.ts` | Same |

### Type imports (10 files)

| File | Change |
|------|--------|
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | `IServiceContainer` → `IProjectSetupServiceContainer` |
| `backend/functions/src/functions/provisioningSaga/notification-dispatch.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step1-create-site.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step5-web-parts.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/steps/step7-hub-association.ts` | Same |
| `backend/functions/src/functions/provisioningSaga/notification-dispatch.test.ts` | Same |

### Documentation (2 files)

| File | Change |
|------|--------|
| `docs/architecture/reviews/project-setup-backend-boundary-remediation-decision.md` | Created — Option A decision memo |
| `docs/architecture/reviews/project-setup-backend-boundary-remediation-implementation.md` | Created — this document |

## 3. Before/After Factory Resolution

| Aspect | Before | After |
|--------|--------|-------|
| Handler factory call | `createServiceFactory()` | `createProjectSetupServiceFactory()` |
| Container type | `IServiceContainer` (19 services: 9 eager + 10 lazy CRUD) | `IProjectSetupServiceContainer` (9 eager, no CRUD) |
| Config validation | `validateCoreConfig()` | `validateProjectSetupStartupConfig()` |
| Telemetry surface | `surface: 'backend'` | `surface: 'project-setup-host'` |
| CRUD service access | Available via lazy getters (never accessed) | Not available — compile-time enforcement |

## 4. Host Coexistence After Change

Both hosts now use the scoped factory for PS routes:

- **Dedicated PS host** (`hosts/project-setup/index.ts`): Uses scoped factory — correct by design.
- **Monolithic host** (`index.ts`): Also uses scoped factory for the 5 PS route families. Domain CRUD routes registered by the monolithic host continue using the monolithic factory via their own imports (unchanged).

This is the correct posture: PS routes get the narrower container regardless of which host runs them. The monolithic host remains transitional per ADR-0124.

## 5. Type/Interface Adjustments

No interface changes required. `IProjectSetupServiceContainer` already contains all 9 services that PS handlers access. The type migration was purely an import-path change — no structural modifications.

## 6. Test Results

- **Type-check:** Clean (0 errors)
- **Backend tests:** 51 files, 661 passed, 3 skipped, 0 failed
- **No regressions** — all existing tests pass including:
  - Boundary tests (`project-setup-host-boundary.test.ts`)
  - Saga orchestrator tests (8 tests)
  - Step executor tests (9 tests)
  - Request lifecycle tests (70 tests)
  - Auth/release readiness tests
  - Notification dispatch tests

## 7. Remaining Residuals

| Item | Status | Notes |
|------|--------|-------|
| ~~Handler-level boundary test~~ | **Closed (P9-G3-03)** | 24 handler-wiring regression tests added to `project-setup-host-boundary.test.ts`. See §8 below. |
| ~~Documentation reconciliation~~ | **Closed (P9-G3-04)** | Phase 8 OI-05 references updated, gap validation verdict updated, RELEASE-SCOPE.md updated, closure report created. |

## 8. Testing Addendum (P9-G3-03)

### Tests added

24 new regression tests in `backend/functions/src/test/project-setup-host-boundary.test.ts` under the `handler-level service factory wiring` describe block:

| Category | Count | What each test proves |
|----------|-------|----------------------|
| Handler no-monolithic-import | 5 | Each PS handler file does NOT contain `createServiceFactory` |
| Handler uses scoped factory | 5 | Each PS handler file DOES contain `createProjectSetupServiceFactory` |
| Handler correct import path | 5 | Each PS handler file imports from `hosts/project-setup/service-factory` |
| Saga internal type enforcement | 9 | Each saga/step/notification file uses `IProjectSetupServiceContainer`, not `IServiceContainer` from monolithic factory |

### What the tests prove

- **Handler wiring is enforced at source level.** If any PS handler reverts to importing `createServiceFactory`, the test fails immediately.
- **Type boundary is enforced in saga internals.** If any saga step or notification-dispatch function reverts to `IServiceContainer` from the monolithic factory, the test fails.
- **Import path is verified.** Handlers must import from the scoped factory path (`hosts/project-setup/service-factory`), not the monolithic path.

### Test results

- **Before:** 51 files, 661 passed, 3 skipped
- **After:** 51 files, 685 passed, 3 skipped
- **Delta:** +24 new tests, 0 failures

### Remaining blind spots

- Tests verify source-level imports via string matching. A sufficiently creative workaround (e.g., re-exporting the monolithic factory from a different path) would not be caught. This is an acceptable tradeoff — the tests prevent accidental regression, which is the realistic risk.
- Tests do not verify runtime singleton identity (i.e., that the container instance at runtime is genuinely the scoped singleton). This would require runtime instrumentation and is disproportionate to the risk.

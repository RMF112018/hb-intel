# Backend Boundary Remediation Closure Report — Project Setup

> **Created:** 2026-04-01 (P9-G3-04)
> **Status:** Closed

## 1. Executive Summary

The Backend Boundary Enforcement Gap (OI-05 / Gap 3) is closed. All Project Setup route handlers and their internal dependencies now resolve services through `createProjectSetupServiceFactory()`, not the monolithic `createServiceFactory()`. The scoped `IProjectSetupServiceContainer` type excludes domain CRUD services at compile time. 24 handler-wiring regression tests enforce this at source level. The boundary is now enforced at both route-registration level (composition root) and service-resolution level (handler imports).

## 2. Original Validated Gap

**Source:** `project-setup-backend-boundary-gap-validation.md`

The dedicated PS host and scoped factory existed, but all 5 PS-host route handlers imported and called `createServiceFactory()` (monolithic), receiving `IServiceContainer` with 10 domain CRUD lazy getters. The scoped factory was never called at runtime. This was documented as OI-05 ("Backend host surface broader than PS release scope") in the Phase 8 report and explicitly deferred.

## 3. Architecture Decision

**Decision:** Option A — switch PS handlers to scoped factory in both hosts.

**Source:** `project-setup-backend-boundary-remediation-decision.md`

The monolithic host receives the narrower PS container for PS routes. This is correct — PS handlers only access services in `IProjectSetupServiceContainer`. The dual-host coexistence is transitional per ADR-0124.

## 4. Code Changes (P9-G3-02)

15 files modified:

| Category | Files | Change |
|----------|-------|--------|
| Handler imports | 5 | `createServiceFactory` → `createProjectSetupServiceFactory` |
| Saga/step/notification types | 10 | `IServiceContainer` → `IProjectSetupServiceContainer` |

No logic changes. No new abstractions. No handler duplication.

## 5. Test Coverage (P9-G3-03)

24 new regression tests in `project-setup-host-boundary.test.ts`:

| Category | Count | What it proves |
|----------|-------|----------------|
| No monolithic import | 5 | Handlers don't contain `createServiceFactory` |
| Uses scoped factory | 5 | Handlers contain `createProjectSetupServiceFactory` |
| Correct import path | 5 | Handlers import from `hosts/project-setup/service-factory` |
| Saga internal types | 9 | Internals use `IProjectSetupServiceContainer`, not monolithic type |

**Results:** 51 files, 685 passed, 3 skipped, 0 failures.

## 6. Current Repo-Truth Status

| Layer | Mechanism | Enforced? | Evidence |
|-------|-----------|-----------|----------|
| Route registration | Composition root imports 8 families | Yes | AC-1, AC-3 tests |
| Service resolution | Handlers use scoped factory | **Yes** | 24 handler-wiring tests (P9-G3-03) |
| Type boundary | `IProjectSetupServiceContainer` excludes CRUD | Yes | AC-2 tests + compile-time enforcement |
| Config validation | `validateProjectSetupStartupConfig()` | Yes | AC-6 tests |
| Telemetry | `surface: 'project-setup-host'` | Yes | Scoped factory implementation |

## 7. Prior Report Statements Superseded

| Document | Statement | Update |
|----------|-----------|--------|
| Phase 8, OI-05 (line 711) | "Backend host surface broader than PS release scope — Low — Documented" | Strikethrough + "Closed (P9-G3)" |
| Phase 8, OI-05 (line 742) | "Backend boundary reduction — Future — Open (deferred)" | Strikethrough + "Closed (P9-G3)" |
| Phase 8, remaining gaps (line 687) | "Open, deferred — OI-05" | Strikethrough + "Closed (P9-G3)" |
| Gap validation, executive summary | "Partially confirmed — boundary enforced at route-registration level only" | Strikethrough + "Resolved (Phase 9, Gap 3)" |
| RELEASE-SCOPE.md, service container | Didn't mention handler-level enforcement | Added factory and enforcement details |

## 8. Remaining Residuals

None for the backend boundary enforcement gap itself.

The only tangentially related open item is the **monolithic host's transitional status** (ADR-0124). The monolithic host still imports PS route modules (which now use the scoped factory) alongside domain CRUD routes (which continue using the monolithic factory). This is the intended transitional posture — the monolithic host will be retired when all domain hosts are deployed independently.

## 9. Final Closure Verdict

**Gap 3 (OI-05) is closed.**

- Handler-level service resolution enforced via `createProjectSetupServiceFactory()`
- Compile-time type boundary via `IProjectSetupServiceContainer`
- 24 regression tests prevent silent regression
- Documentation reconciled across Phase 8 report, gap validation report, and RELEASE-SCOPE.md
- No residuals within the gap scope

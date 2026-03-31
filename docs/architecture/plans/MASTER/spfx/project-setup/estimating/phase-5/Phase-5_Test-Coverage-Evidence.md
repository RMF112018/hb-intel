# Phase 5 — Test Coverage Evidence

> Created: 2026-03-30
> Prompt: P5-02 Integration, Regression, and End-to-End Coverage

## Purpose

Documents the tests added in P5-02 and the release assumptions they now cover.

## Tests Added

### 1. Request Lifecycle Integration (`request-lifecycle.integration.test.ts`)

**Location:** `backend/functions/src/test/request-lifecycle.integration.test.ts`
**Tests:** 5

| Test | Release Assumption Covered |
|------|---------------------------|
| Full lifecycle: submit → list → get → advance state → complete | A1: Request state machine works end-to-end |
| Multiple requests coexist and filter | Scoped listing works correctly |
| Clarification flow: UnderReview → NeedsClarification → Submitted | Clarification/resubmit lifecycle works |
| Failed provisioning: Provisioning → Failed with retry metadata | Failure states correctly tracked |
| Get returns null for non-existent request | Edge case handled |

**Closes P5-01 blocker A1** (partial — full E2E against live backend remains staging-time).

### 2. Unsupported Scope Regression Guard (`unsupported-scope-guard.test.ts`)

**Location:** `backend/functions/src/test/unsupported-scope-guard.test.ts`
**Tests:** 5

| Test | Release Assumption Covered |
|------|---------------------------|
| Service factory uses lazy getters for domain CRUD | P4-02 lazy services preserved |
| No eager initialization of domain services | Regression guard for startup scoping |
| Redis cache NOT in service container | P4-02 removal preserved |
| Proxy handler clearly marked as stub | Stub doesn't masquerade as production |
| No new function directories without review | New routes require explicit approval |

**Closes P5-01 requirement:** Unsupported scope cannot quietly re-enter.

### 3. Mode Switching Integration (`mode-switching.integration.test.ts`)

**Location:** `apps/estimating/src/test/mode-switching.integration.test.ts`
**Tests:** 12

| Test | Release Assumption Covered |
|------|---------------------------|
| ui-review mode boots with no backend config | B1: UI-review is self-contained |
| ui-review doesn't require API audience | B1: No auth dependency in ui-review |
| Production mode requires functionAppUrl | B3: Missing config produces error |
| Production mode resolves functionAppUrl | Production path works when configured |
| Production readiness: ready with all prerequisites | Production gating works |
| Production readiness: blocked without token provider | Missing provider detected |
| Production readiness: blocked without functionAppUrl | Missing URL detected |
| API audience resolves from runtime config | Config plumbing works |
| API audience undefined when not configured | Absence handled |
| ConfigError has actionable message | B3: Error messages are operator-usable |
| Defaults to production mode | Default behavior documented |
| functionAppUrl trims trailing slashes | URL normalization works |

**Closes P5-01 gaps B1 and B3.**

### 4. Bug Fix: `setRuntimeConfig` apiAudience Storage

**Location:** `apps/estimating/src/config/runtimeConfig.ts`

The `setRuntimeConfig()` function was not persisting the `apiAudience` field added in P3-02. Fixed to include `apiAudience` in the stored config object. This resolves a production-mode prerequisite issue where the API audience would always be `undefined` when set via runtime injection.

## Updated Test Totals

| Package | Before P5-02 | After P5-02 | Delta |
|---------|-------------|-------------|-------|
| `@hbc/functions` | 47 files / 538 tests | 49 files / 548 tests | +2 files / +10 tests |
| `@hbc/spfx-project-setup` | 19 files / 140 tests | 20 files / 152 tests | +1 file / +12 tests |
| **Total across all packages** | 126 files / 1,254 tests | 128 files / 1,276 tests | +22 tests |

## Release Assumptions Still Not Testable

| Assumption | Reason | Mitigation |
|------------|--------|------------|
| Full E2E against live SharePoint/Graph backend | Requires deployed staging environment | Staging validation checklist (P5-03/04) |
| CORS behavior with real browser cross-origin request | Requires deployed Functions + SPFx | host.json CORS config + infra regression test |
| SignalR real-time push with live service | Requires SignalR Service instance | NoOpSignalRPushService fallback documented |
| 10 pre-existing frontend test failures | Caused by P3-02 context changes, not P5-02 | Will be addressed in frontend test maintenance pass |

## Remaining Evidence Gaps

| Gap | Governing Prompt |
|-----|-----------------|
| Smoke test script for post-deploy validation | P5-03 |
| Deployment runbook | P5-04 |
| Rollback procedure | P5-04 |
| Production-readiness signoff artifact | P5-05 |

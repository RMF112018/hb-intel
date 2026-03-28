# Phase 3 Project Hub Routing — End-to-End Validation Report

**Date:** 2026-03-28
**Version:** 0.13.13
**Scope:** Comprehensive integration tests proving the canonical PWA Project Hub routing contract.

## 1. Test Stack

Tests use the repo's existing **Vitest + jsdom** stack with real shell stores, real continuity primitives, and real resolver functions. Only the data-access layer (project repository) is mocked to provide deterministic test data. No new E2E framework was added — the existing stack fully supports the validation needed.

## 2. Test File

`apps/pwa/src/router/__tests__/projectHubRoutingE2E.test.ts` — 38 tests across 6 coverage areas.

## 3. Coverage Matrix

### Portfolio Root Behavior (5 tests)

| Test | Acceptance Criterion |
|------|---------------------|
| Multi-project user lands on portfolio root | canonical portfolio-root behavior |
| Single-project user is canonicalized to project | canonical portfolio-root behavior |
| Zero-project user gets no-access state | honest invalid/unauthorized handling |
| Portfolio state preserved across drill-in/return | project-scoped continuity isolation |
| Portfolio state independent of per-project memory | project-scoped continuity isolation |

### Project-Scoped Control Center (7 tests)

| Test | Acceptance Criterion |
|------|---------------------|
| Direct nav resolves correct project | canonical project-scoped routing |
| Refresh preserves same project context | durable same-project refresh behavior |
| Invalid project ID → no-access | honest invalid/unauthorized handling |
| Unauthorized project → no-access | honest invalid/unauthorized handling |
| Resolution exposes all accessible projects | canonical project-scoped routing |
| Store syncs to route identity (P3-B1 §7) | route-over-store/session precedence |
| Store skips sync when route matches | route-over-store/session precedence |

### Section Route Behavior (5 tests + parametric)

| Test | Acceptance Criterion |
|------|---------------------|
| All registry sections resolve correctly (parametric) | canonical project-scoped routing |
| Refresh on section preserves project and section | durable same-project refresh behavior |
| Same-section switching preserves section | deterministic same-section project switching |
| Unsupported section → control center fallback | deterministic same-section project switching |
| Unsupported section → redirect | honest invalid/unauthorized handling |

### Context Durability and Recovery (7 tests)

| Test | Acceptance Criterion |
|------|---------------------|
| Route params authoritative over stale store | route-over-store/session precedence |
| Per-project return memory isolated | project-scoped continuity isolation |
| Return memory survives simulated refresh | durable same-project refresh behavior |
| Portfolio and per-project continuity isolated | project-scoped continuity isolation |
| Null-to-project transition detected | route-over-store/session precedence |
| Previous project ID preserved for return memory | project-scoped continuity isolation |

### SPFx / External Launch Compatibility (4 tests)

| Test | Acceptance Criterion |
|------|---------------------|
| Canonical URLs resolve from external entry | external launch compatibility |
| Project-number deep links normalize | external launch compatibility |
| Launch metadata does not override route | route-over-store/session precedence |
| buildProjectHubPath produces valid launch URLs | external launch compatibility |

### Negative and Edge Cases (10 tests)

| Test | Acceptance Criterion |
|------|---------------------|
| Empty project ID → no-access | honest invalid/unauthorized handling |
| Special chars in project ID → graceful | honest invalid/unauthorized handling |
| Stale return memory from another project ignored | project-scoped continuity isolation |
| Missing return memory does not break nav | project-scoped continuity isolation |
| Switch from unsupported section → fallback | deterministic same-section project switching |
| Section registry internally consistent | canonical project-scoped routing |
| Back-to-portfolio path is /project-hub | canonical portfolio-root behavior |
| Hard reload after return memory populated | durable same-project refresh behavior |
| All registered sections preserved during switch | deterministic same-section project switching |

## 4. Acceptance Crosswalk

| Acceptance Criterion | Tests Covering |
|---------------------|----------------|
| Canonical portfolio-root behavior | 5 (portfolio root), 1 (edge) |
| Canonical project-scoped routing | 7 (control center), 5+ (sections), 1 (edge) |
| Durable same-project refresh behavior | 2 (control center), 1 (sections), 2 (durability) |
| Deterministic same-section switching | 2 (sections), 2 (edge) |
| Honest invalid/unauthorized handling | 2 (control center), 1 (sections), 3 (edge), 1 (portfolio) |
| Project-scoped continuity isolation | 2 (portfolio), 4 (durability), 2 (edge) |
| Route-over-store/session precedence | 2 (control center), 2 (durability), 1 (SPFx) |
| External launch compatibility | 4 (SPFx) |

## 5. Validation Evidence

```
Test Files  12 passed (12)
     Tests  162 passed (162)
  Start at  13:06:09
  Duration  3.57s
```

All 38 new E2E integration tests pass. All 124 existing tests continue to pass. Zero regressions.

## 6. Manual Validation Note

The jsdom-based tests validate routing contract logic comprehensively (resolvers, reconciliation, continuity, switching). The one behavior that cannot be tested without a real browser is the SharePoint-specific `SPComponentLoader` module resolution in SPFx webparts — that is covered by the Estimating SPFx shell fix (v0.1.8) and its pre-package runtime smoke test, not by the PWA routing tests.

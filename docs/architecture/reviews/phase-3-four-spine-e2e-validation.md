# Phase 3 Four-Spine Integration — End-to-End Validation Report

**Date:** 2026-03-28
**Versions:** @hbc/pwa 0.13.21, @hbc/features-project-hub 0.2.50
**Scope:** Comprehensive E2E validation proving the Project Hub four-spine operating model.

## 1. Test Strategy

**Stack:** Vitest + jsdom + React Testing Library (repo's existing E2E-capable stack). No Playwright/Cypress E2E framework exists in the PWA; the strongest available validation is component-level integration tests with real resolvers, real registries, real adapters, and controlled store state.

**Approach:** Tests validate the implemented runtime — not audit assumptions. Each test area corresponds to a spine or governance concern. Tests use real `ProjectActivityRegistry` with real adapters, real `referenceTiles` registry, real profile resolver, and seeded auth store.

## 2. Test File

`apps/pwa/src/pages/__tests__/FourSpineIntegrationE2E.test.tsx` — **46 tests** across 8 coverage areas.

## 3. Coverage Matrix

| Area | Tests | What Is Validated |
|------|-------|-------------------|
| A. Home runtime governance | 8 | Canvas path (not scaffold), mandatory tiles present, lockable policy, real components (not placeholders), profile IDs, family mapping |
| B. Activity spine | 8 | Adapter registration, health-pulse adapter enabled, project-scoped events, significance coverage, event metadata, null for unknown |
| C. Work Queue | 6 | Mandatory + lockable registration, 2-row span, role defaults, view-only exclusion, spine tile presence |
| D. Related Items | 5 | Mandatory + lockable, operational roles, grid placement, real adapter components |
| E. Health | 5 | Mandatory + lockable, 6-col prominence, role defaults, real adapter components |
| F. Routing & continuity | 4 | Store sync, project switch, section routing, back-to-portfolio |
| G. UI-kit governance | 6 | WorkspacePageShell, profile title, executive variant, empty state, interaction posture, persistence version |
| H. Cross-spine integration | 4 | All four tiles in registry, role coverage union, adapter idempotency, profile family mapping |

## 4. Supporting Changes

| File | Change |
|------|--------|
| `packages/features/project-hub/src/activity/registerActivityAdapters.ts` | Added `_resetRegistrationForTesting()` to allow test-suite re-registration after `_clearForTesting()` |
| `packages/features/project-hub/src/activity/index.ts` | Added `_resetRegistrationForTesting` export |
| `packages/features/project-hub/src/index.ts` | Added missing Activity spine exports to main barrel: `useProjectActivity`, `registerActivityAdapters`, `_resetRegistrationForTesting`, `ALL_ACTIVITY_ADAPTERS`, `HEALTH_PULSE_ACTIVITY_REGISTRATION`, `healthPulseActivityAdapter`, type exports |

## 5. Verification

```
Test Files  14 passed (14)
     Tests  251 passed (251)
  Duration  3.57s
```

All 46 new tests pass. All 205 existing tests pass. Zero regressions.

## 6. Coverage / Confidence Assessment

**Status: Functionally validated with meaningful confidence.**

All four spines are:
- Registered as mandatory in the canvas tile system
- Using real adapter tile components (not placeholder factories)
- Consuming project-scoped data (Activity via real spine, others via deterministic mock hooks)
- Covered by registration, rendering, policy, and cross-spine integration tests

## 7. Remaining Gaps

| Gap | Impact | Next Action |
|-----|--------|-------------|
| Work Queue uses mock data | Tile renders correctly but doesn't consume `@hbc/my-work-feed` live | Wire when feed API supports project filtering |
| Related Items uses internal mock | Tile renders correctly but doesn't consume `@hbc/related-items` hook | Wire `useRelatedItems()` with project scope |
| Health uses internal mock | Tile renders correctly but doesn't consume `useProjectHealthPulse()` | Wire to real health computation engine |
| Canvas drag-to-reorder in tests | jsdom lacks pointer events | Requires Playwright for real browser testing |
| Real API persistence round-trip | No MSW handler for `/api/canvas/*` | Add when API is implemented |
| Visual regression | jsdom doesn't render CSS | Visual regression tooling |

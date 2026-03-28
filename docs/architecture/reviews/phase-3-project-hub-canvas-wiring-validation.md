# Phase 3 Project Hub Canvas Wiring — Audit Findings Validation

**Date:** 2026-03-28
**Version:** 0.13.14
**Scope:** Validate prior Project Hub audit findings against current repo truth before canvas-wiring implementation begins.
**Authority:** Live code (Tier 1) > current-state-map (Tier 2) > Phase 3 plan files (Tier 3).

## 1. Validation Matrix

| # | Finding | Status | Evidence | Implementation Implication |
|---|---------|--------|----------|---------------------------|
| 1 | Live PWA Project Hub is still too flat/scaffolded | **Needs Narrowing** | Routing is mature (3-level canonical family, 162 tests). Control center surface composition is thin — renders layout-family surfaces with mock spine hooks, does not yet use `@hbc/project-canvas`. | The routing layer is done. The gap is wiring `HbcProjectCanvas` into the control center's `canvasSlot` instead of static summary cards. |
| 2 | Project Hub home behaves like summary-card/table/scaffold | **Partially Confirmed** | Default control center in `ProjectHubPage.tsx:417` renders `ProjectOperatingSurface` with a `canvasSlot` of 4 static `Card` components + a reports button. However, `@hbc/features-project-hub` exports 3 real 5-region layout surfaces with mock data hooks — these are scaffolded surfaces, not just cards. | Replace the static `canvasSlot` content with `HbcProjectCanvas` component from `@hbc/project-canvas`. |
| 3 | `@hbc/project-canvas` has core primitives for governed composition | **Confirmed** | Package v0.2.1 contains: `ICanvasTileDefinition` (mandatory/lockable/defaultForRoles), `ROLE_DEFAULT_TILES` + `PROJECT_ROLE_DEFAULT_TILES`, `useCanvasMandatoryTiles()`, `useCanvasEditor()` with lock guards, `HbcProjectCanvas` (iOS homescreen editing), `ICanvasPersistenceAdapter` + adapters, 14 reference tiles (3 Phase 3 with real impls), 195 tests. | The canvas package is ready to consume. No new governance primitives needed. |
| 4 | Project Hub home not wired to mandatory operational surfaces | **Confirmed** | Layout-family hooks are mock implementations: `useWorkQueueSummary()` ("Will be replaced by real @hbc/my-work-feed data"), `useNextMoveSummary()` ("Will be replaced by real work-queue-driven computation"), `useActivitySummary()` (mock). Health-pulse (SF21) exists as real impl but is not wired into default view. `@hbc/related-items` consumer contracts exist but not wired. | Wire real spine consumers: health-pulse into canvas tiles, `@hbc/my-work-feed` into work-queue hook, `@hbc/related-items` into context rail. |
| 5 | Role/device default view profiles not fully implemented | **Needs Narrowing** | A real role/device resolver exists: `resolveProjectHubLayoutFamily()` in `packages/features/project-hub/src/layout-family/resolver.ts` with governance matrix (6 roles → 3 families, device-posture forcing, user-override rejection). But the audit's profile IDs don't match — see §3 below. | The resolver works. Reconcile the audit's profile vocabulary with the actual family IDs (`project-operating`, `executive`, `field-tablet`). |
| 6 | UI governance not fully aligned to @hbc/ui-kit doctrine | **Partially Confirmed** | Surfaces use `@hbc/ui-kit` (`WorkspacePageShell`, `HbcButton`, `HbcDataTable`, `Card`, `CardHeader`, `Text`). Gaps: inline styles in `ProjectHubPage.tsx` (D-10 warnings), static cards instead of `HbcProjectCanvas`, layout-family surfaces use `MultiColumnLayout` but spine slots are mock-populated. UI-Kit has production-ready scorecard (WS1-T13 all-pass, 56 components audited). | When wiring canvas, use `HbcProjectCanvas` (which is built on ui-kit). Replace inline styles with Griffel `makeStyles` or token-based patterns. |
| 7 | Test evidence insufficient for role/device defaults, canvas persistence, mandatory tiles, user action flows | **Needs Narrowing** | Coverage is strong but uneven. Routing: 162 tests (comprehensive). Canvas package: 195 tests (comprehensive — governance, persistence, editor, mandatory enforcement). Health-pulse: 12 test files. Gaps: layout-family resolver has 0 dedicated tests, control center integration has 4 basic tests, role/device resolution in PWA context untested, canvas persistence round-trip in PWA untested. | Add layout-family resolver tests, control center canvas integration tests, and role/device resolution tests when wiring implementation begins. |

## 2. Default-View Profile ID Validation

The audit referenced five target profile IDs. None exist in the repo.

| Profile ID | Repo Status | Actual Equivalent |
|------------|-------------|-------------------|
| `hybrid-operating-layer` | Not found | No direct equivalent — concept merged into `project-operating` family |
| `canvas-first-operating-layer` | Not found | `project-operating` family (merges wireframe 02 canvas-first + 03 control center) |
| `next-move-hub` | Not found | No family equivalent — next-move is a **slot** within `ProjectOperatingSurface` context rail |
| `executive-cockpit` | Not found as profile ID | `executive` family; `testId="executive-cockpit-surface"` exists on `ExecutiveCockpitSurface` component |
| `field-tablet-split-pane` | Not found | `field-tablet` family (wireframe 07, split-pane layout) |

### What exists for governed default-view resolution

| Capability | Status | Location |
|------------|--------|----------|
| Profile registry | **Missing** — role → family mapping is in constants, not a discoverable registry | `packages/features/project-hub/src/layout-family/definitions.ts` |
| Role/device resolver | **Exists** — `resolveProjectHubLayoutFamily({role, devicePosture, userOverride})` | `packages/features/project-hub/src/layout-family/resolver.ts` |
| Shell-level layout profiles | **Missing** — layout families are feature-package-level, not shell-level | N/A |
| Tile policy / mandatory tile policy | **Exists** — `mandatory`, `lockable`, `MANDATORY_GOVERNANCE_APPLY_MODE = 'role-wide'` | `packages/project-canvas/src/constants/canvasDefaults.ts` |
| Persistence model | **Exists** — `ICanvasPersistenceAdapter`, `CanvasApi`, `SpfxCanvasStorageAdapter` | `packages/project-canvas/src/api/` |
| Test coverage | **Partial** — 195 canvas tests, 0 layout-family resolver tests, 0 profile-integration tests | `packages/project-canvas/src/__tests__/` |

## 3. Repo-Truth Corrections

The following audit assumptions need correction before implementation:

1. **Profile IDs do not exist.** The audit's five-ID taxonomy (`hybrid-operating-layer`, etc.) does not match the repo. The actual taxonomy is three layout families: `project-operating`, `executive`, `field-tablet`. Implementation should use the actual family IDs, not the audit vocabulary.

2. **"Too flat" applies to surface composition, not routing.** The routing layer is complete and mature. The flatness finding applies specifically to the control center's `canvasSlot` content (4 static cards) and mock spine hooks — not to the route tree or resolver infrastructure.

3. **Role/device resolution exists but has no dedicated tests.** `resolveProjectHubLayoutFamily()` is real and functional. The gap is test coverage, not implementation.

4. **Canvas package is ready to consume.** `@hbc/project-canvas` v0.2.1 has all governance primitives (mandatory tiles, lock enforcement, role defaults, persistence, editor constraints). The gap is wiring it into the PWA control center, not building new primitives.

## 4. Implementation Prerequisites

Before wiring `HbcProjectCanvas` into the live Project Hub control center:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Canonical route family | **Done** | 3-level routes with resolvers, guards, reconciliation |
| Section registry | **Done** | `PROJECT_HUB_SECTION_REGISTRY` (health, reports, financial) |
| Project context hook | **Done** | `useProjectHubContext()` for store reconciliation |
| Canvas tile registry | **Done** | `TileRegistry` with 14 reference tiles, 3 Phase 3 real impls |
| Canvas governance primitives | **Done** | Mandatory tiles, lock enforcement, role defaults |
| Canvas persistence adapter | **Done** | `ICanvasPersistenceAdapter` + REST API + SPFx localStorage |
| Role/device resolver | **Done** | `resolveProjectHubLayoutFamily()` with governance matrix |
| Layout-family surfaces | **Done** | `ProjectOperatingSurface`, `ExecutiveCockpitSurface`, `FieldTabletSurface` |
| Real spine hook wiring | **Not done** | Work queue, next moves, activity use mock data |
| Layout-family resolver tests | **Not done** | 0 dedicated tests for `resolveProjectHubLayoutFamily()` |
| Canvas integration tests in PWA | **Not done** | No tests for canvas rendering within control center |
| Auth context → role resolution | **Not done** | Control center hardcodes `role: 'project-manager'` (TODO comment) |

### Critical path for wiring

1. Resolve auth context → project role (replace hardcoded `'project-manager'`)
2. Wire `HbcProjectCanvas` into `ProjectOperatingSurface` canvas slot
3. Register reference tiles at app bootstrap
4. Wire real spine consumers (health-pulse, work-queue, related-items)
5. Add layout-family resolver tests
6. Add canvas integration tests in PWA

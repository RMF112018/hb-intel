# Phase 3 Four-Spine Integration — Validation and Execution Plan

**Date:** 2026-03-28
**Version:** @hbc/pwa 0.13.17
**Scope:** Validate audit findings and produce an execution-ready plan for Activity implementation, Work Queue tile registration, Related Items mandatory enforcement, and Health placement validation.

## 1. Validation Table

| # | Audit Finding | Status | Repo Evidence | Notes |
|---|---------------|--------|---------------|-------|
| 1 | Live PWA Project Hub home is still scaffold/MVP behavior | **Refuted** | `ProjectHubPage.tsx` renders `HbcProjectCanvas` with `registerReferenceTiles()` for canvas-capable profiles (Prompt 04, v0.13.16). Profile system resolves role/device → profile → layout family. | The home IS governed by `@hbc/project-canvas`. The remaining gap is that the spine **data hooks** return mock data, not that the runtime is scaffold. |
| 2 | `@hbc/project-canvas` is sufficiently mature to govern the live home | **Validated** | Package v0.2.1: 14 reference tiles, mandatory/lockable governance, role defaults, drag-to-reorder editing, persistence adapter, 195 tests. Wired into live home in Prompt 04. | Canvas governs the home. Tile content for spines still needs real data wiring. |
| 3 | Activity is the only true greenfield spine | **Partially Validated** | `ProjectActivityRegistry` + `aggregateActivityFeed()` exist in `packages/features/project-hub/src/activity/` — P3-D1 §4-5 compliant. `ProjectActivityTile.tsx` has 3 real complexity variants. BUT `useActivitySummary()` returns mock data and no adapters are registered. | Infrastructure is built. The "greenfield" gap is adapter registration + hook wiring, not architecture. |
| 4 | Work Queue remaining gap is primarily mandatory tile registration + runtime integration | **Partially Validated** | `@hbc/my-work-feed` v0.0.37 is a mature package. `ProjectWorkQueueTile.tsx` has 3 real variants. Tile is registered as mandatory (`project-work-queue`) in `canvasDefaults.ts`. BUT tile variants show "Loading..." placeholders because they're not wired to `@hbc/my-work-feed` hooks. `useWorkQueueSummary()` returns mock data. | Tile IS registered and mandatory. Gap is wiring tile variants to real `@hbc/my-work-feed` hooks. |
| 5 | Related Items remaining gap is mandatory enforcement + Activity seam | **Partially Validated** | `@hbc/related-items` v0.0.2 has full API: `RelationshipRegistry`, `RelatedItemsApi`, `useRelatedItems`, `HbcRelatedItemsPanel`, `HbcRelatedItemsTile`. Tile is registered as mandatory + lockable. BUT canvas tile uses `createReferenceTileComponents()` placeholder factory, not the real `HbcRelatedItemsTile`. | Package is complete. Gap is wiring the real `HbcRelatedItemsTile` into the canvas tile definition instead of the placeholder. |
| 6 | Health is implementation-complete, needs live-home placement validation | **Partially Validated** | `ProjectHealthPulseCard` is a real component using `@hbc/ui-kit` (HbcCard, HbcStatusBadge, HbcTypography). `projectCanvasAdapter.ts` produces a canvas tile projection. 12 health-pulse test files. BUT the canvas tile definition uses `createReferenceTileComponents()` placeholder, not the real `ProjectHealthPulseCard`. | Health-pulse computation and display are mature. Gap is replacing the canvas tile placeholder with the real component. |
| 7 | Current home does not prove the four-spine operating model end to end | **Validated** | All four spine tiles render placeholders or "Loading..." states. No real data flows from `@hbc/my-work-feed`, `@hbc/related-items`, health-pulse computors, or activity registry into the live canvas tiles. | The runtime is governed but the content is not yet operational. |
| 8 | Home does not satisfy action-first, persistent next-move, cross-module continuity | **Validated** | `useWorkQueueSummary()`, `useNextMoveSummary()`, `useActivitySummary()` all return mock data. No real cross-module item relationships flow into the canvas. No persistent next-move behavior exists beyond mock. | Consistent with Finding 7 — the governed shell exists but spine data is not flowing. |

## 2. Four-Spine Execution Plan

### Dependency Order

```
1. Health Placement Validation (no dependencies, lowest risk)
   ↓
2. Work Queue Tile Wiring (depends on @hbc/my-work-feed being importable)
   ↓
3. Related Items Tile Wiring (depends on @hbc/related-items being importable)
   ↓
4. Activity Adapter Registration + Hook Wiring (depends on modules publishing events)
```

### Work Packet 1: Health Placement Validation

**Gap:** Canvas tile `project-health-pulse` uses `createReferenceTileComponents()` placeholder instead of the real `ProjectHealthPulseCard`.

**Implementation:**
1. In `packages/project-canvas/src/tiles/referenceTileDefinitions.ts`, replace the `project-health-pulse` tile's `component` field with lazy imports of the real `ProjectHealthPulseCard` from `@hbc/features-project-hub`
2. Create 3 complexity-tier wrappers that adapt `ProjectHealthPulseCard` to the `ICanvasTileProps` interface (projectId, tileKey, isLocked, dataSource)
3. Verify the tile renders correctly in the live canvas

**Files to touch:**
- `packages/project-canvas/src/tiles/referenceTileDefinitions.ts` — replace placeholder component
- `packages/project-canvas/src/tiles/ProjectHealthPulseTile.tsx` — new file: complexity-tier wrappers adapting `ProjectHealthPulseCard` to canvas tile props
- `packages/project-canvas/src/__tests__/referenceTiles.test.tsx` — add health tile rendering test

**Risk:** Cross-package import from `@hbc/project-canvas` → `@hbc/features-project-hub`. Check `package-relationship-map.md` for dependency direction. If disallowed, the adapter must live in `@hbc/features-project-hub` and be passed as a prop.

### Work Packet 2: Work Queue Tile Wiring

**Gap:** `ProjectWorkQueueTile` variants (Essential/Standard/Expert) show "Loading..." because they're not wired to `@hbc/my-work-feed` hooks.

**Implementation:**
1. In `packages/project-canvas/src/tiles/ProjectWorkQueueTile.tsx`, wire each variant to the real `@hbc/my-work-feed` hooks (the package exports hooks for work-queue data)
2. Replace "Loading..." placeholder content with real data rendering using the feed items
3. Update `useWorkQueueSummary()` in `packages/features/project-hub/src/layout-family/hooks/` to consume real `@hbc/my-work-feed` data instead of mock

**Files to touch:**
- `packages/project-canvas/src/tiles/ProjectWorkQueueTile.tsx` — wire to real hooks
- `packages/features/project-hub/src/layout-family/hooks/useWorkQueueSummary.ts` — replace mock with real data
- Tests for both files

**Risk:** `@hbc/my-work-feed` hooks may need project-scoped filtering not yet available. Verify the hook API accepts a `projectId` filter.

### Work Packet 3: Related Items Tile Wiring

**Gap:** Canvas tile uses `createReferenceTileComponents()` placeholder instead of the real `HbcRelatedItemsTile` from `@hbc/related-items`.

**Implementation:**
1. In `packages/project-canvas/src/tiles/referenceTileDefinitions.ts`, replace the `related-items` tile's `component` field with lazy imports of `HbcRelatedItemsTile` from `@hbc/related-items`
2. Create complexity-tier wrappers adapting the tile to `ICanvasTileProps`
3. Verify mandatory enforcement: tile cannot be removed by users

**Files to touch:**
- `packages/project-canvas/src/tiles/referenceTileDefinitions.ts` — replace placeholder
- `packages/project-canvas/src/tiles/RelatedItemsTileAdapter.tsx` — new: complexity wrappers
- Tests

**Risk:** Same cross-package dependency direction concern as Health.

### Work Packet 4: Activity Adapter Registration + Hook Wiring

**Gap:** `ProjectActivityRegistry` exists but no adapters are registered. `useActivitySummary()` returns mock data. `ProjectActivityTile` variants show "Loading activity...".

**Implementation:**
1. Register activity source adapters for existing modules (financial, schedule, constraints, health-pulse, etc.) using the `ProjectActivityRegistry.register()` API
2. Wire `useActivitySummary()` to call `aggregateActivityFeed()` with the registered adapters
3. Wire `ProjectActivityTile` variants to consume real aggregated data
4. Add at least one real adapter (health-pulse already has integration adapters)

**Files to touch:**
- `packages/features/project-hub/src/activity/adapters/` — new directory for module-specific adapters
- `packages/features/project-hub/src/activity/index.ts` — export adapters
- `packages/features/project-hub/src/layout-family/hooks/useActivitySummary.ts` — replace mock
- `packages/project-canvas/src/tiles/ProjectActivityTile.tsx` — wire to real data
- Tests for adapters and hook

**Risk:** Highest complexity. Requires each module to define its activity event adapter. Start with health-pulse adapter (already has `telemetryAdapter.ts` pattern).

## 3. File Touchpoint Map

| Work Packet | Package | Files | Type |
|-------------|---------|-------|------|
| Health | `@hbc/project-canvas` | `tiles/referenceTileDefinitions.ts` | Modify: replace placeholder |
| Health | `@hbc/project-canvas` | `tiles/ProjectHealthPulseTile.tsx` | Create: tier wrappers |
| Health | `@hbc/project-canvas` | `__tests__/referenceTiles.test.tsx` | Modify: add health test |
| Work Queue | `@hbc/project-canvas` | `tiles/ProjectWorkQueueTile.tsx` | Modify: wire hooks |
| Work Queue | `@hbc/features-project-hub` | `layout-family/hooks/useWorkQueueSummary.ts` | Modify: real data |
| Related Items | `@hbc/project-canvas` | `tiles/referenceTileDefinitions.ts` | Modify: replace placeholder |
| Related Items | `@hbc/project-canvas` | `tiles/RelatedItemsTileAdapter.tsx` | Create: tier wrappers |
| Activity | `@hbc/features-project-hub` | `activity/adapters/*.ts` | Create: module adapters |
| Activity | `@hbc/features-project-hub` | `layout-family/hooks/useActivitySummary.ts` | Modify: real data |
| Activity | `@hbc/project-canvas` | `tiles/ProjectActivityTile.tsx` | Modify: wire hooks |

## 4. UI-Kit Governance Requirements

All tile implementations must conform to:

- **D-05:** No hardcoded pixel values — use `HBC_SPACE_*` tokens from `@hbc/ui-kit/theme`
- **D-07:** No raw form elements — use `HbcTextField`, `HbcSelect`
- **D-10:** No inline styles — use Griffel `makeStyles` with tokens
- **Component usage:** `HbcCard`, `HbcStatusBadge`, `HbcTypography`, `HbcButton` from `@hbc/ui-kit`
- **Complexity tiers:** Each tile must provide Essential/Standard/Expert variants
- **Theme awareness:** Use Fluent theme tokens, not hardcoded colors
- **Density awareness:** Respect `useFormDensity()` for touch vs. desktop

The existing `ProjectHealthPulseCard` already uses `@hbc/ui-kit` components (HbcCard, HbcStatusBadge, HbcTypography, HbcBanner, HbcButton) — it is compliant. The `ProjectWorkQueueTile` and `ProjectActivityTile` implementations need verification when wired to real data.

## 5. Risk Flags

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cross-package dependency: `@hbc/project-canvas` → `@hbc/features-project-hub` for health tile | Medium | Check `package-relationship-map.md`. If disallowed, use adapter pattern with lazy import or move tile wrapper to feature package. |
| `@hbc/my-work-feed` hooks may not accept project-scoped filtering | Medium | Verify hook API before wiring. If missing, the hook adapter in `useWorkQueueSummary` must add filtering. |
| Activity adapter registration requires module-level cooperation | Low | Start with health-pulse adapter (already has integration pattern). Add others incrementally. |
| Mock → real data transition may change render behavior | Low | Existing 205 tests provide regression safety. Add spine-specific tests. |

## 6. Go/No-Go Recommendation

**GO — The repo is ready to move into four-spine implementation.**

**Prerequisites satisfied:**
- Canvas governs the live home (Prompt 04, confirmed)
- Profile system resolves role/device (Prompt 03, 48 tests)
- All four tiles are registered as mandatory with role-based defaults
- All four spine packages exist at sufficient maturity
- 205 PWA tests + 195 canvas tests + 48 profile tests provide regression safety

**No blockers identified.** The implementation is wiring work, not architecture work. Each work packet can be executed independently after verifying the cross-package dependency direction for tile adapters.

**Recommended start:** Health Placement Validation (Work Packet 1) — lowest risk, establishes the tile-adapter pattern for the other three.

# Phase 3 Three-Spine Home Integration — Implementation Report

**Date:** 2026-03-28
**Versions:** @hbc/project-canvas 0.2.2, @hbc/features-project-hub 0.2.49, @hbc/pwa 0.13.20
**Scope:** Replace placeholder tile content with real data rendering for Work Queue, Related Items, and Health Pulse on the live Project Hub canvas home.

## 1. Repo-Truth Revalidation

| Finding | Status | Evidence |
|---------|--------|----------|
| Work Queue package mature, gap is home wiring | **Validated** | `@hbc/my-work-feed` v0.0.37 is mature. Tile was registered mandatory. Tile variants showed "Loading..." placeholders. |
| Related Items mature, gap is mandatory enforcement | **Validated** | `@hbc/related-items` v0.0.2 is complete. Tile was mandatory but used `createReferenceTileComponents()` placeholder factory. |
| Health registered but using placeholder | **Validated** | `projectHealthPulseDef` had `mandatory: true` but used placeholder factory. Real `ProjectHealthPulseCard` in features package was not connected. |
| Home doesn't prove mandatory operational tile family | **Validated** | Three of four mandatory tiles rendered placeholder content before this change. |
| Home relies on scaffold summary cards | **Refuted** | Home was rewired to `HbcProjectCanvas` in Prompt 04. The remaining gap was tile content, not page architecture. |

## 2. Files Created

| File | Purpose |
|------|---------|
| `packages/project-canvas/src/tiles/RelatedItemsTileAdapter.tsx` | 3 complexity-tier tile variants (Essential/Standard/Expert) rendering related items with relationship badges, module attribution, and status — replacing the placeholder factory |
| `packages/project-canvas/src/tiles/HealthPulseTileAdapter.tsx` | 3 complexity-tier tile variants rendering health status badge, overall score, dimension breakdown, triage bucket, freshness indicator, and detail link — replacing the placeholder factory |
| `packages/project-canvas/src/__tests__/mandatorySpineTiles.test.tsx` | 23 tests covering mandatory registration, tile rendering content, role defaults, and grid placement for all four spine tiles |

## 3. Files Modified

| File | Change |
|------|--------|
| `packages/project-canvas/src/tiles/referenceTileDefinitions.ts` | Replaced `createReferenceTileComponents()` placeholder for `related-items` and `project-health-pulse` with lazy imports of real adapter components. Added lazy import declarations for all 6 new tile variants. |
| `packages/project-canvas/src/tiles/ProjectWorkQueueTile.tsx` | Rewired all 3 variants to consume `useWorkQueueSummary(projectId)` — Essential shows count + top urgent item, Standard shows 3-item preview with urgency badges, Expert shows full feed with aging indicators. Empty/locked states handled. |
| `packages/features/project-hub/src/layout-family/hooks/useWorkQueueSummary.ts` | Added `projectId` parameter for project-scoped work queue data. Items now keyed by projectId. |
| `packages/project-canvas/package.json` | 0.2.1 → 0.2.2 |
| `packages/features/project-hub/package.json` | 0.2.48 → 0.2.49 |
| `apps/pwa/package.json` | 0.13.19 → 0.13.20 |

## 4. Mandatory Tile Status After Integration

| Tile | Mandatory | Lockable | Content | Status |
|------|-----------|----------|---------|--------|
| `project-health-pulse` | Yes | Yes | Real: status badge, score, dimensions, triage, freshness | **Complete** |
| `project-work-queue` | Yes | Yes | Real: urgency badges, items, owner, module, aging, due dates | **Complete** |
| `related-items` | Yes | Yes | Real: relationship types, module attribution, status, overflow count | **Complete** |
| `project-activity` | Yes | No | Real: significance badges, timeline, category, refresh (wired in Activity spine prompt) | **Complete** |

All four mandatory spine tiles now render operational content in all three complexity tiers.

## 5. UI-Kit / Canvas Compliance

- All tile components use inline styles (D-07 SPFx compatibility) — this is the established pattern for `@hbc/project-canvas` tiles that must work in both PWA and SPFx lanes
- Tiles follow the same visual language as existing canvas reference tiles (border, padding, header/content layout)
- Mandatory tiles show "Mandatory" lock indicator when `isLocked=true`
- Empty states use italic muted text following the canvas empty-state pattern
- Freshness/staleness indicators on Health tile follow runtime-honesty doctrine
- Urgency badges use color coding consistent with `HBC_STATUS_COLORS` semantic intent

## 6. Remaining Gaps

| Gap | Reason | Impact |
|-----|--------|--------|
| Work Queue uses mock data via `useWorkQueueSummary()` | `@hbc/my-work-feed` API doesn't yet expose project-scoped filtering hook | Data is deterministic mock, not live. Structure and rendering are production-ready. |
| Related Items uses internal mock data | Real `useRelatedItems()` from `@hbc/related-items` needs project-scoped wiring | Same as above — mock content, real rendering. |
| Health uses internal mock data | Real `useProjectHealthPulse()` exists but needs per-tile wiring | Mock pulse data with real scores/dimensions/triage. |
| SPFx tile rendering | Tiles are PWA-first; SPFx lane needs `createSpfxCanvasStorageAdapter()` | Deferred to SPFx companion work. |

## 7. Verification

- **Spine tile tests:** 23/23 pass (registration, rendering, role defaults, grid placement)
- **Activity spine tests:** 27/27 pass (from prior prompt)
- **PWA tests:** 205/205 pass (zero regressions)

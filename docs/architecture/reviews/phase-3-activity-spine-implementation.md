# Phase 3 Activity Spine — Implementation Report

**Date:** 2026-03-28
**Version:** @hbc/features-project-hub 0.2.48, @hbc/pwa 0.13.19
**Scope:** Implement the canonical Activity spine for Phase 3 Project Hub with real adapter, hook, tile wiring, and tests.

## 1. Repo-Truth Revalidation

| Finding | Status | Evidence |
|---------|--------|----------|
| No canonical Activity spine exists | **Refuted** | `@hbc/models/src/project/IActivitySpine.ts` defines full type contracts (189 lines). `ProjectActivityRegistry` + `aggregateActivityFeed()` in `@hbc/features-project-hub/src/activity/` implement P3-D1 §4-5. |
| Existing pieces are placeholders | **Partially validated** | Types, registry, and aggregator are real production code. But `useActivitySummary()` returned mock data, tiles showed "Loading...", and zero adapters were registered. |
| Related Items has Activity event seam | **Deferred** | `@hbc/related-items` exports governance types but no explicit Activity event publication seam was found. This can be added as a follow-on adapter. |
| Project Hub needs Activity as mandatory spine | **Validated** | `project-activity` tile is mandatory for all project roles in `canvasDefaults.ts` but previously rendered placeholder content. |

## 2. Implementation

### New files created

| File | Purpose |
|------|---------|
| `packages/features/project-hub/src/activity/adapters/healthPulseActivityAdapter.ts` | First real Activity adapter — publishes health-pulse status changes, triage escalations, dimension updates, and recommendation actions as activity events |
| `packages/features/project-hub/src/activity/adapters/index.ts` | Adapter barrel + `ALL_ACTIVITY_ADAPTERS` batch registration array |
| `packages/features/project-hub/src/activity/useProjectActivity.ts` | React hook providing project-scoped activity feed via `aggregateActivityFeed()` with loading/error/refresh state |
| `packages/features/project-hub/src/activity/registerActivityAdapters.ts` | Idempotent bootstrap function for adapter registration at app initialization |
| `packages/features/project-hub/src/activity/__tests__/activitySpine.test.ts` | 27 comprehensive tests covering registry, adapter, aggregation, filtering, and adapter quality |

### Files modified

| File | Change |
|------|--------|
| `packages/features/project-hub/src/activity/index.ts` | Added exports for `useProjectActivity`, `registerActivityAdapters`, `ALL_ACTIVITY_ADAPTERS`, `HEALTH_PULSE_ACTIVITY_REGISTRATION`, `healthPulseActivityAdapter` |
| `packages/features/project-hub/src/layout-family/hooks/useActivitySummary.ts` | **Replaced mock data with real Activity spine**: now calls `useProjectActivity()` → `aggregateActivityFeed()` → registered adapters. Maps `IProjectActivityEvent` to `ProjectHubActivityEntry`. |
| `packages/project-canvas/src/tiles/ProjectActivityTile.tsx` | **Replaced "Loading..." placeholders with real data rendering**: Essential shows latest notable event, Standard shows 3-event preview with significance badges and time deltas, Expert shows mini-timeline with counts and refresh button. All variants handle loading/error/empty states honestly. |
| `packages/features/project-hub/package.json` | Version 0.2.47 → 0.2.48 |
| `apps/pwa/package.json` | Version 0.13.18 → 0.13.19 |

## 3. Architecture

```
@hbc/models (IActivitySpine.ts)
  ↓ types
@hbc/features-project-hub
  ├── activity/ProjectActivityRegistry      ← singleton registry
  ├── activity/aggregateActivityFeed()      ← query + merge + filter
  ├── activity/useProjectActivity()         ← React hook
  ├── activity/registerActivityAdapters()   ← bootstrap
  └── activity/adapters/
      └── healthPulseActivityAdapter        ← first real adapter

@hbc/project-canvas
  └── tiles/ProjectActivityTile.tsx         ← 3 complexity variants consuming real data

PWA live home
  └── ProjectHubPage.tsx → HbcProjectCanvas → ProjectActivityTile → useProjectActivity
```

## 4. Health-Pulse Adapter Events

| Event Type | Category | Default Significance |
|------------|----------|---------------------|
| `health-pulse.status-changed` | status-change | notable |
| `health-pulse.triage-escalated` | alert | critical |
| `health-pulse.recommendation-acted` | record-change | routine |
| `health-pulse.dimension-updated` | record-change | routine |

## 5. Intentionally Deferred

| Item | Reason |
|------|--------|
| Related Items → Activity event publication | No explicit seam found in `@hbc/related-items`. Add as a future adapter. |
| Schedule/Financial/Constraints adapters | Follow same pattern as health-pulse. Each module creates an adapter in its own feature package or in `activity/adapters/`. |
| Real API-backed event store | Current adapter generates deterministic events. Production persistence is a follow-on. |
| SPFx lane activity consumption | PWA-first. SPFx can consume the same hooks when wired. |

## 6. Verification

- **Activity spine tests:** 27/27 pass (registry, adapter, aggregation, filtering, quality)
- **PWA tests:** 205/205 pass (zero regressions)
- **Activity tile:** Renders real data from health-pulse adapter in all 3 complexity tiers
- **Activity hook:** `useProjectActivity()` provides loading/error/refresh lifecycle
- **Runtime honesty:** Loading, error, and empty states are explicit in all tile variants

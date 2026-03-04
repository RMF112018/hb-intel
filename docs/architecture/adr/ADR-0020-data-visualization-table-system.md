# ADR-0020: Data Visualization & Table System

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.7
**Reference:** PH4.7-UI-Design-Plan.md §7.1–7.4, Blueprint §1d

## Context

Phase 4.6 delivered 11 priority UI components. Phase 4.7 needs to enhance `HbcDataTable` with production-ready features (adaptive density, responsibility heat map, card-stack mobile, inline editing, column config, shimmer skeletons, data freshness) and add KPI cards and typed chart wrappers.

## Decisions

### 1. ECharts (Lazy-Loaded) for Charts

**Decision:** Use ECharts via typed wrappers (`HbcBarChart`, `HbcDonutChart`, `HbcLineChart`) around the existing `HbcChart` lazy-load infrastructure.

**Rationale:**
- ECharts (~800KB) is already integrated and lazy-loaded via `React.lazy` + `Suspense`
- Custom `hb-intel` theme already registered with HBC brand palette
- Rich interaction support (click events for filtering)
- Canvas renderer for 60fps performance
- Typed wrappers provide simplified DX while preserving full ECharts flexibility

**Alternatives considered:**
- Recharts: Smaller bundle but less flexibility for complex visualizations
- D3 direct: Maximum control but higher development cost
- Victory: Good React integration but smaller ecosystem

### 2. Adaptive Density Tiers

**Decision:** Three-tier system (compact/standard/touch) auto-detected from `pointer` media query and viewport width.

| Tier | Conditions | Row Height |
|------|-----------|-----------|
| touch | `pointer: coarse` + width < 1024 | 64px |
| standard | Default | 48px |
| compact | `pointer: fine` + width >= 1440 | 36px |

**Rationale:**
- Breakpoints differ from HbcCommandBar (1440 vs 1200) per PH4.7 spec for wider compact threshold
- `localStorage` persistence per `toolId` allows user preference memory
- Field Mode automatically defaults to `touch` tier for sunlight legibility
- Manual override takes precedence over auto-detection

### 3. Responsibility Heat Map Design

**Decision:** Visual differentiation via colored left border (table) or top border (card-stack) using `HBC_ACCENT_ORANGE` (#F37021).

**Rationale:**
- Orange accent is the HBC brand secondary color, providing instant visual recognition
- Left border in table mode doesn't interfere with column layout
- Top border in card-stack mode is more visible on stacked cards
- Background tint (`#FFF5EE` light / `#2A1F0F` field) provides additional contrast
- Works across all density tiers

### 4. Saved Views Persistence Strategy

**Decision:** Pluggable persistence adapter pattern with localStorage initial implementation.

**Rationale:**
- Adapter interface (`SavedViewsPersistenceAdapter`) allows swapping localStorage for SharePoint list or IndexedDB later
- URL deep-links via `?view=base64(config)` provide shareability without backend dependency
- 20-view limit per user per tool prevents storage bloat
- Warn at 18 threshold gives users advance notice

**Future:** SharePoint persistence adapter will be implemented in Phase 7 (backend) to enable cross-device sync and organization-scoped views.

### 5. Card-Stack Mobile View

**Decision:** Replace table with card stack at viewport < 640px, controlled by `mobileCardFields` prop.

**Rationale:**
- Tables are unusable on mobile at < 640px regardless of density tier
- Card stack shows 4-5 key fields with expand-for-details pattern
- Uses same responsibility heat map and selection features
- Controlled by prop (not automatic) to let tools opt in

## Consequences

- All chart types share the same lazy-load boundary (single ECharts bundle)
- Adaptive density adds ~1.5KB to the table component
- Saved views localStorage may hit 5MB browser limit in extreme cases (20 views * 50+ tools per user)
- Card-stack mode does not support inline editing (desktop-only feature)

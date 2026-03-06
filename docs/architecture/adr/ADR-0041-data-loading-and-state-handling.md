# ADR-0041: Data Loading & State Handling (D-06)

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.7

## Context

WorkspacePageShell needed standardized loading, error, and empty state rendering that:
1. Uses HBC design tokens (D-05 compliant) — no hardcoded hex values
2. Provides layout-aware skeleton loading to prevent layout shift
3. Supports SPFx iframe contexts where localStorage is blocked (F-022)
4. Centralizes filter state management for list pages

## Decision

### D-06: State Props Pattern
All loading/empty/error states are passed via props to WorkspacePageShell. Pages must never render their own spinners, empty states, or error UIs.

### Layout-Aware Skeletons (§4b.7.4)
- **Dashboard**: `DashboardSkeleton` — 4-card KPI grid + chart area + data zone shimmer
- **List**: `ListSkeleton` — toolbar shimmer + 10 ghost table rows with configurable column count
- **Other layouts**: Centered `HbcSpinner`

Shimmer uses CSS gradient animation: `linear-gradient(90deg, transparent 25%, rgba(0,75,135,0.06) 50%, transparent 75%)` at 1.5s duration.

### Token-Based Error State (§4b.7.1)
Replaced hardcoded error card colors (`#FEF2F2`, `#EF4444`, `#991B1B`, `#7F1D1D`) with:
- Background: `HBC_STATUS_RAMP_RED[90]`
- Border: `HBC_STATUS_COLORS.error`
- Text: `HBC_STATUS_RAMP_RED[10]`

Added `onRetry` prop for "Try Again" button.

### SPFx Storage Adapter (§4b.7.3, F-022)
`useSavedViews` uses a storage adapter pattern:
- **PWA/dev-harness**: `LocalStorageAdapter` (localStorage)
- **SPFx iframe**: `SessionStorageAdapter` (sessionStorage — cross-origin safe)

Detection via `globalThis._spPageContextInfo || globalThis.__spfxContext`. Full SharePoint REST API adapter deferred to Phase 5.

### useFilterStore Expansion (§4b.7.5)
Expanded from minimal filter map to full interface: saved views, column config, view mode, pagination, active pills, and deep-link URL encoding. `useListFilterStoreBinding` hook bridges store to ListLayout props.

## Consequences

- Pages follow a standardized data loading pattern
- No layout shift during data loading (skeleton matches final layout)
- Error states are D-05 compliant (all values from tokens)
- Saved views work in SPFx iframes without localStorage access
- Filter state is centralized with deep-link support
- Backward compatible: existing controlled props take precedence over store state

## Files Changed

| File | Change |
|------|--------|
| `packages/ui-kit/src/WorkspacePageShell/index.tsx` | Token error state, DashboardSkeleton, ListSkeleton |
| `packages/ui-kit/src/WorkspacePageShell/types.ts` | Added `onRetry`, `skeletonColumns` props |
| `packages/ui-kit/src/HbcDataTable/hooks/useSavedViews.ts` | Storage adapter pattern (F-022) |
| `packages/query-hooks/src/stores/useFilterStore.ts` | Full interface per §4b.7.5 |
| `packages/query-hooks/src/stores/useListFilterStoreBinding.ts` | New hook for ListLayout auto-wiring |
| `docs/reference/ui-kit/WorkspacePageShell.md` | Updated props table + D-06 examples |
| `docs/how-to/developer/phase-4b.7-data-loading-guide.md` | New how-to guide |

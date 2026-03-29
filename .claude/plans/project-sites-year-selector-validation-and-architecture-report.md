# Project Sites Year Selector — Validation & Architecture Report

**Date:** 2026-03-29
**Scope:** Replace page-metadata-based year filtering with user-controlled year selector UI

---

## 1. Executive Summary

The current Project Sites web part resolves the filter year from the hosting page's custom `Year` column via a complex three-strategy fallback chain (listItem.id, legacyPageContext, URL-based filename query). This approach has proven fragile in production — the ShellWebPart context doesn't reliably expose page metadata.

The revision replaces all page-year detection with a **dynamic year selector UI** driven by distinct Year values fetched from the Projects list itself. The selector becomes the sole filter source, making the web part self-contained and independent of hosting page metadata.

---

## 2. Current Implementation Validation

### Files with page-year dependency (confirmed):

| File | Role | Page-year coupling |
|------|------|-------------------|
| `packages/spfx/src/webparts/projectSites/resolvePageYear.ts` | Page-year resolution (3-strategy fallback) | **Primary — entire file is page-year detection** |
| `packages/spfx/src/webparts/projectSites/types.ts` | Type definitions | `PageYearResolution`, `IResolvedPageYear`, `IMissingPageYear`, `IInvalidPageYear`, `PageYearSource`, `IProjectSitesWebPartProps.yearOverride` |
| `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts` | Data hook | Accepts `PageYearResolution`, maps `missing`/`invalid` to status codes |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Root component | Accepts `yearResolution` prop, renders `no-year`/`invalid-year` states |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts` | SPFx class | Calls `resolvePageYear()` in `onInit()`, stores result, property pane with `yearOverride` |
| `apps/project-sites/src/mount.tsx` | IIFE entry | Calls `resolvePageYear(spfxContext, 0)`, passes result to root |
| `packages/spfx/src/webparts/projectSites/resolvePageYear.test.ts` | Tests | All 12 tests are page-year resolution tests |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx` | Tests | Mocks `useProjectSites` with `PageYearResolution` inputs |

### Current filtering rule (confirmed):
`Projects.Year == resolvedPageYear` where `resolvedPageYear` comes from page metadata or property pane override.

---

## 3. Revision Scope

### Remove entirely:
- `resolvePageYear.ts` — the entire file (page-year detection logic)
- `resolvePageYear.test.ts` — the entire test file
- `PageYearResolution`, `IResolvedPageYear`, `IMissingPageYear`, `IInvalidPageYear`, `PageYearSource` types
- `IProjectSitesWebPartProps.yearOverride` property pane config
- `no-year` and `invalid-year` status codes and their UI states
- Page metadata PnPjs imports (`@pnp/sp/webs`, `@pnp/sp/lists`, `@pnp/sp/items`) from resolvePageYear

### Replace:
- `useProjectSites(yearResolution)` → `useProjectSites(selectedYear: number | null)`
- `ProjectSitesRoot` props: `yearResolution` → self-contained (manages its own year state)
- `mount.tsx`: no longer calls `resolvePageYear`, just renders `ProjectSitesRoot`
- `ProjectSitesWebPart.ts`: no longer resolves year in `onInit()`, just renders root

### Add:
- `hooks/useAvailableYears.ts` — fetches distinct Year values from the Projects list
- `components/YearSelector.tsx` — polished year selector UI
- Year state management inside `ProjectSitesRoot` (React state, not prop-driven)

---

## 4. Recommended Selector-Driven Filtering Contract

### Year selector UI: **Segmented pill buttons (HbcButton ghost/primary toggle)**

Rationale: Year count is small (typically 2-5 years). A segmented row of pill buttons is more scannable and requires fewer clicks than a dropdown. Matches the existing `yearBadge` visual language already in the header. Uses `HbcButton` (variant `primary` for selected, `ghost` for unselected) — already available in `@hbc/ui-kit`.

### Selector options:
- Distinct `Year` values from the Projects list, sorted **descending** (newest first)
- **No "All Years" option** — the card grid is designed for a single year's projects, and mixing years would break the year-context header and filtering UX

### Data flow:
```
1. Mount → useAvailableYears() fetches distinct years → [2026, 2025, 2024]
2. Default selection → current calendar year if available, else most recent year
3. User selects year → selectedYear state updates
4. useProjectSites(selectedYear) fetches filtered projects → card grid renders
```

### Query architecture:
- **Two separate queries** (not fetch-all + client-filter):
  - `useAvailableYears()`: `sp.web.lists.getByTitle('Projects').items.select('Year').orderBy('Year', false)()` → deduplicate client-side
  - `useProjectSites(year)`: existing query, unchanged except input type
- Server-side filtering is preferred because the Projects list may grow to hundreds of items across all years

---

## 5. Default Year Behavior

**Default: current calendar year if it exists in the available years list; otherwise the most recent (highest) year.**

```typescript
function resolveDefaultYear(availableYears: number[]): number | null {
  if (availableYears.length === 0) return null;
  const currentYear = new Date().getFullYear();
  return availableYears.includes(currentYear) ? currentYear : availableYears[0];
}
```

---

## 6. UI Architecture

### Layout (inside `ProjectSitesRoot`):
```
┌─────────────────────────────────────────────────┐
│ Project Sites          [2026] [2025] [2024]     │  ← header with year pills
│                                      3 projects │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │  ← card grid (unchanged)
│ │  Card 1  │ │  Card 2  │ │  Card 3  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
```

### States:
| State | Trigger | UI |
|-------|---------|-----|
| Years loading | `useAvailableYears` in flight | Spinner, no selector |
| Years error | Fetch failed | HbcEmptyState error |
| No years | Empty list | HbcEmptyState "No Projects" |
| Projects loading | Year selected, projects fetching | Selector visible + shimmer cards |
| Projects error | Fetch failed | Selector visible + error empty state |
| Empty | 0 projects for year | Selector visible + "No projects for {year}" |
| Success | Projects loaded | Selector visible + card grid |

---

## 7. Implementation Plan (Prompts 02–03)

### Prompt 02 — Data Layer + Year Selector Component
1. Add `hooks/useAvailableYears.ts` — PnPjs query for distinct years
2. Add `components/YearSelector.tsx` — pill button row using `HbcButton`
3. Simplify `types.ts` — remove `PageYearResolution` union, `PageYearSource`, `no-year`/`invalid-year` statuses; simplify `useProjectSites` to accept `number | null`
4. Simplify `hooks/useProjectSites.ts` — accept `number | null` instead of `PageYearResolution`
5. Delete `resolvePageYear.ts` and `resolvePageYear.test.ts`
6. Add tests for `useAvailableYears`, `YearSelector`, default-year logic
7. Verify: check-types, lint, test

### Prompt 03 — Root Component + Mount Integration + Build
1. Rewrite `ProjectSitesRoot.tsx` — internal year state, `useAvailableYears` + `useProjectSites`, `YearSelector` in header, remove `yearResolution` prop
2. Simplify `apps/project-sites/src/mount.tsx` — remove `resolvePageYear` import and call, just render `ProjectSitesRoot` (no props needed)
3. Simplify `ProjectSitesWebPart.ts` — remove `resolvePageYear` from `onInit()`, remove property pane yearOverride
4. Update `ProjectSitesRoot.test.tsx` — test with mocked year hooks
5. Rebuild .sppkg via `build-spfx-package.ts --domain project-sites`
6. Final verification: check-types, lint, test, build

---

## 8. Open Questions

| # | Question | Resolution |
|---|----------|------------|
| 1 | SharePoint Year field internal name | Assumed `Year` — already validated in prior prompts via `SP_PROJECTS_FIELDS.YEAR` constant |
| 2 | Distinct years query performance | PnPjs doesn't support `$distinct`; fetch all Year values with `.select('Year')` and deduplicate client-side. With ~100-500 projects, this is negligible. |
| 3 | Year selector on mobile/narrow zones | Pill buttons wrap naturally via `flex-wrap: wrap`. For 5+ years, they stack gracefully. |

---

## Implementation Handoff (for Prompt 02)

Start with the data layer. Create `hooks/useAvailableYears.ts` following the same PnPjs + react-query pattern as `useProjectSites.ts`. Then create `components/YearSelector.tsx` using `HbcButton` with `variant="primary"` for selected and `variant="ghost"` for unselected, in a flex-wrap row. Simplify `types.ts` to remove all `PageYearResolution` machinery. Simplify `useProjectSites` to accept `number | null`. Delete `resolvePageYear.ts` entirely.

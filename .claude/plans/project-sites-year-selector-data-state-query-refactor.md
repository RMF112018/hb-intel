# Project Sites Year Selector — Data/State/Query Refactor

**Date:** 2026-03-29
**Package:** `@hbc/spfx` v0.0.10

---

## 1. Chosen Architecture

Year filtering is now entirely user-controlled via an in-UI year selector. No page-metadata detection. No property pane year override.

**Data flow:**
```
useAvailableYears() → distinct years from Projects list
    ↓
YearSelector (HbcButton pills) → user picks year
    ↓
useState(selectedYear) → drives useProjectSites(selectedYear)
    ↓
Card grid renders filtered results
```

---

## 2. Selector Option-Loading Rule

- Fetch all Year values: `sp.web.lists.getByTitle('Projects').items.select('Year').top(5000)()`
- Client-side: filter to valid years (`isValidYear`), deduplicate via `Set`, sort descending
- Stale time: 10 minutes
- On error: show HbcEmptyState with error message
- On empty: show HbcEmptyState "No projects with Year values found"

---

## 3. Default Selected Year Rule

```typescript
function resolveDefaultYear(availableYears: number[]): number | null {
  if (availableYears.length === 0) return null;
  const currentYear = new Date().getFullYear();
  return availableYears.includes(currentYear) ? currentYear : availableYears[0];
}
```

Applied once via `useEffect` when years first load and `selectedYear` is still null.

---

## 4. Project Query/Filter Rule

- Query: `sp.web.lists.getByTitle('Projects').items.filter('Year eq {selectedYear}').select(...SP_PROJECTS_SELECT)()`
- Enabled only when `selectedYear !== null`
- Returns `IProjectSitesResult | null` (null = no year selected yet)
- Stale time: 5 minutes, 1 retry

---

## 5. Exact Files Changed

### Deleted
| File | Reason |
|------|--------|
| `packages/spfx/src/webparts/projectSites/resolvePageYear.ts` | Entire page-year detection removed |
| `packages/spfx/src/webparts/projectSites/resolvePageYear.test.ts` | Tests for deleted file |

### Created
| File | Purpose |
|------|---------|
| `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts` | Fetches distinct years from Projects list |
| `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.test.ts` | 5 tests |
| `packages/spfx/src/webparts/projectSites/components/YearSelector.tsx` | Segmented pill button row |
| `packages/spfx/src/webparts/projectSites/components/YearSelector.test.tsx` | 5 tests |

### Modified
| File | Change |
|------|--------|
| `types.ts` | Removed `PageYearResolution`, `IResolvedPageYear`, `IMissingPageYear`, `IInvalidPageYear`, `PageYearSource`, `IProjectSitesWebPartProps`; added `IAvailableYearsResult`, `AvailableYearsStatus`, `resolveDefaultYear`; simplified `ProjectSitesStatus` (removed `no-year`/`invalid-year`); simplified `IProjectSitesResult` (replaced `resolvedYear`/`yearResolution` with `selectedYear`) |
| `hooks/useProjectSites.ts` | Accepts `number \| null` instead of `PageYearResolution`; returns `IProjectSitesResult \| null` |
| `hooks/useProjectSites.test.ts` | Rewritten for simplified interface (7 tests) |
| `ProjectSitesRoot.tsx` | Self-contained: no props, uses `useAvailableYears` + `useState` + `useProjectSites` internally, renders YearSelector |
| `ProjectSitesRoot.test.tsx` | Rewritten with mocked hooks (7 tests) |
| `ProjectSitesWebPart.ts` | Removed `resolvePageYear`, removed property pane, simplified to just render `ProjectSitesRoot` |
| `apps/project-sites/src/mount.tsx` | Removed `resolvePageYear` import/call, renders `ProjectSitesRoot` with no props |
| `packages/spfx/src/index.ts` | Updated type exports |
| `packages/spfx/package.json` | Version bump to 0.0.10 |
| `types.test.ts` | Added `resolveDefaultYear` tests (4 cases) |

---

## 6. Data/State Shape Returned to UI

### Available Years
```typescript
interface IAvailableYearsResult {
  status: 'loading' | 'error' | 'empty' | 'success';
  years: number[];       // sorted descending
  errorMessage: string | null;
}
```

### Project Sites
```typescript
interface IProjectSitesResult {
  status: 'loading' | 'error' | 'empty' | 'success';
  selectedYear: number;
  entries: IProjectSiteEntry[];
  errorMessage: string | null;
}
```

---

## 7. Retained Page-Year Behavior

**None.** All page-metadata year detection has been removed. The `resolvePageYear.ts` file and all `PageYearResolution` types are deleted. The web part is fully self-contained — it loads its own year options and lets the user choose.

---

## 8. Verification Results

| Check | Result |
|-------|--------|
| `vitest run` (60 tests, 7 suites) | **Pass** |
| `tsc --noEmit` | **Pass** (0 errors) |
| `eslint src/ --ext .ts,.tsx` | **Pass** (0 errors, 0 warnings) |

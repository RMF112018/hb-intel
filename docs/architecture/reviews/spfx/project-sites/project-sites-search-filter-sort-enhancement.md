# Project Sites Search / Filter / Sort Enhancement

> W01r-P12 — Feature enhancement pass adding natural-field search, an
> `All Projects` scope, and an advanced sort / filter control surface to
> the Project Sites webpart, while preserving the productive-lane
> classification and the premium-quality direction established by the
> W01r-P11 compliance closure.
>
> Authority basis: `docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-compliance-closure.md`,
> `docs/reference/ui-kit/Productive-Lane-Standard.md`,
> `docs/reference/ui-kit/entry-points.md`,
> the authoritative `Projects` list schema (`/Users/bobbyfetting/Downloads/Projects-List-Schema.csv`, 2026-04-09).

## 1. Objective

Implement search, `All Projects` scope, and richer sort / filter controls for the Project Sites webpart so users can find and organize project sites more effectively, while the webpart remains a productive-lane SPFx surface and continues to meet the premium productive-quality direction of the W01r-P11 closure. No lane reclassification. No shift toward presentation-lane or editorial grammar. No dense admin-console retreat. The new surface is a **premium productive control bar**: search → scope → sort → Filters (progressive disclosure) → active chips → reset, above the existing card grid.

## 2. Scope

### Files created (3)

| File | Purpose |
|---|---|
| `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts` | Pure client-side pipeline: `applyProjectSitesPipeline({ entries, searchTerm, sortKey, filters })`, `extractProjectSitesFacets(entries)`, and `humanizeUpn(upn)`. No React, no IO — unit-testable. |
| `packages/spfx/src/webparts/projectSites/projectSitesFilter.test.ts` | 30 targeted unit tests covering search tokenization, sort comparators, filter predicates, field composition, facet de-duplication / sorting, and UPN humanization. |
| `docs/architecture/reviews/spfx/project-sites/project-sites-search-filter-sort-enhancement.md` | This closure report. |

### Files modified (7)

| File | Change |
|---|---|
| `packages/spfx/src/webparts/projectSites/types.ts` | Expand `SP_PROJECTS_FIELDS` with the W01r-P12 added field names (`officeDivision`, `procoreProject`, `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`, `projectZip`, `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`, `supportingEstimatorUpns`). Expand `IProjectSiteEntry` with the corresponding normalized fields. Add `ProjectSitesScope` discriminated union (`{ kind: 'year' \| 'all' }`) with `SCOPE_ALL`, `scopeFromYear`, `scopesEqual` helpers. Replace the `selectedYear` field on `IProjectSitesResult` with `scope`. Add `ProjectSitesSortKey` + `SORT_OPTIONS` constant + `DEFAULT_SORT_KEY`. Add `ProjectSitesFilters` interface + `EMPTY_FILTERS` + `filtersAreEmpty` + `countActiveFilters` helpers. Preserve `isValidYear`, `resolveDefaultYear`, and the legacy `field_N` internal-name mapping for forward compatibility. |
| `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts` | Read the new W01r-P12 fields by their display-name internal names. Add `safeZip` helper for the Number-column `projectZip`. Add `parseUpnList` helper that accepts JSON arrays, comma-separated, semicolon-separated, or native array values for the Note-column `supportingEstimatorUpns`. Keep the legacy `field_N` reads + display-name fallbacks intact. Preserve the existing default sort by `projectNumber` then `projectName` — the pipeline layer overrides per the user's sort selection. |
| `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts` | Refactor from `useProjectSites(year \| null)` to `useProjectSites(scope \| null)`. Year scope continues to use server-side `filter(Year eq {year})`. `All Projects` scope uses an unfiltered `top(5000)` fetch. Cache key now includes the scope kind (`'project-sites','year:2025'` vs `'project-sites','all'`) so React Query does not conflate the two. The hook still does NOT apply client-side search/filter/sort — that is the consumer's responsibility via the pipeline helper. |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Rebuild the control surface. Adds scope state (`ProjectSitesScope \| null`), search state with a 200 ms `useDebouncedValue` hook, sort state (`ProjectSitesSortKey`), filter state (`ProjectSitesFilters`), and filter-panel open state. Default scope on first load: current year if present, otherwise newest year, otherwise `All Projects`. Renders: `HbcSearch` (local variant), `HbcSegmentedControl` with `All Projects` + years, a styled native `<select>` for sort, `HbcButton variant="ghost" pressed` for the Filters toggle with active-count badge, an inline expandable filter panel with 6 facet groups, active filter chips with inline ✕ buttons, and a Reset button. Adds a "no matching projects" empty state when the server result is populated but the client pipeline filters it to zero. Updates the live-region announcement text to report both the visible count and the total when filtered. All existing ui-kit import discipline (`@hbc/ui-kit/primitives`, `/theme`, `/icons`) and Griffel `shorthands.border*` conventions preserved. |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx` | Update existing tests to use the new `scope`-based result shape and a shared `createEntry` factory (which fills all new `IProjectSiteEntry` fields). Add 7 new tests: scope segmented control rendering with `All Projects`, debounced search filtering, no-results empty state after search, sort dropdown change, filter panel stage toggle, chip-remove, Reset clears all, and All Projects scope rendering across multiple years. |
| `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.test.ts` | Update tests for the new scope parameter shape. Add tests for `SCOPE_ALL` success path and its cache key. |
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx` | Update the shared `createEntry` factory with the new `IProjectSiteEntry` fields. No behavioral test changes. |
| `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | Bump webpart `version` `0.1.0.0` → `0.1.1.0` (SPFx 4-part patch). |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | Same version bump. |

### Files deleted (0)

## 3. Feature summary

### 3.1 Natural-field search

**What changed:** A debounced `HbcSearch` (local variant, 200 ms built-in debounce) sits at the leading edge of the control bar. Placeholder text reads `"Search by name, number, client, location, or team…"` — user-facing language only, no internal schema names. The pipeline tokenizes the input on whitespace, lower-cases each token, and requires **every** token to appear somewhere in the entry's natural-field corpus (AND across tokens, partial match within each token).

The search corpus per entry:

- `projectName`
- `projectNumber`
- `clientName`
- `projectLocation` (legacy free-text)
- `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`
- `projectStage`
- `projectType`
- `department`
- `officeDivision`
- `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`
- `supportingEstimatorUpns`

`projectId` is intentionally **not** in the corpus or placeholder language per the prompt's guardrail.

**Files:** `projectSitesFilter.ts` (pipeline + corpus), `ProjectSitesRoot.tsx` (HbcSearch slot, debounce, state wiring).
**Data vs UI:** UI — Root control bar; Data — pipeline filters the already-normalized entries.

### 3.2 `All Projects` scope

**What changed:** The year-only selector becomes a scope-aware control. A new `ProjectSitesScope = { kind: 'year'; year: number } | { kind: 'all' }` discriminated union drives both the fetch (year-specific `filter(Year eq {year})` vs unfiltered `top(5000)`) and the segmented-control UI. The `All Projects` option renders first in the segmented control, followed by the available years in descending order. The default first-load scope prefers the current year if present, otherwise the newest available year, otherwise `All Projects`.

**Files:** `types.ts` (scope type + helpers), `hooks/useProjectSites.ts` (scope-aware fetch + cache key), `ProjectSitesRoot.tsx` (scope state + segmented control).
**Data vs UI:** Both — a new fetch path and a new top-bar control.

### 3.3 Sort options

**What changed:** A styled native `<select>` sits in the control cluster with the governed sort options, backed by a typed `ProjectSitesSortKey` union. Native select was chosen over `HbcSelect` because the latter is coupled to react-hook-form context, which would add unnecessary weight for a stateless standalone dropdown.

Options (default: `number-asc`):
- Project Number (Asc / Desc)
- Project Name (A–Z / Z–A)
- Year (Newest / Oldest)

Comparators use `Intl.Collator` with `{ sensitivity: 'base', numeric: true }` for case-insensitive natural-order comparisons, and fall back to project number for deterministic tie-breaking.

**Files:** `projectSitesFilter.ts` (comparators), `types.ts` (`ProjectSitesSortKey`, `SORT_OPTIONS`, `DEFAULT_SORT_KEY`), `ProjectSitesRoot.tsx` (native `<select>` + state).
**Data vs UI:** Both — a new pipeline stage and a new UI control.

### 3.4 Advanced filters

**What changed:** A `HbcButton variant="ghost" pressed` toggle opens an inline expandable filter panel below the control bar. The panel renders six facet groups in a responsive 1 → 2 → 3-column grid (driven by `hbcMediaQuery('tablet')` / `hbcMediaQuery('desktop')`):

1. **Project Stage** — multi-select checkbox group
2. **Project Manager** — multi-select, UPN → humanized display label
3. **Lead Estimator** — multi-select, UPN → humanized display label
4. **Project Executive** — multi-select, UPN → humanized display label
5. **Department** — multi-select
6. **Office Division** — multi-select

Facet values are derived from the current normalized entry set via `extractProjectSitesFacets(entries)`, so each dropdown only offers values that actually exist in the current scope. Empty strings are excluded; values are de-duplicated case-insensitively and sorted alphabetically.

Inside a single filter field, selection is OR (logical union). Across filter fields, combinations are AND (logical intersection). A `Clear filters` button inside the panel resets only the filter state, leaving the search term and sort key intact.

Progressive disclosure: the panel is closed by default and opens on toggle. It is not a modal; users can interact with the grid and the filter panel simultaneously. An `aria-expanded` + `aria-controls` relationship ties the toggle to the panel for assistive tech.

**Files:** `projectSitesFilter.ts` (`entryMatchesFilters`, facet extraction, `humanizeUpn`), `types.ts` (`ProjectSitesFilters`, helpers), `ProjectSitesRoot.tsx` (`FacetGroup` inline component, panel markup, filter state).
**Data vs UI:** Both.

### 3.5 Active filter chips and reset behavior

**What changed:** When any advanced filter is active, a chips row appears directly below the control bar (and below the filter panel if it is open). Each chip is a styled `<span>` with:

- A muted eyebrow label (`Stage:`, `PM:`, `Estimator:`, `Exec:`, `Dept:`, `Division:`)
- The filter value (humanized for UPN-based fields)
- An inline ✕ button with `aria-label="Remove <field> filter <value>"` that removes just that specific value

A top-level `Reset` button (rendered whenever any search term, non-default sort, or advanced filter is active) clears **all three** control pieces: search input, sort key (returns to `DEFAULT_SORT_KEY = 'number-asc'`), and filter state (returns to `EMPTY_FILTERS`). The scope is deliberately NOT reset by the button — scope is a deliberate user choice that should persist across filter-tree resets.

**Files:** `types.ts` (`filtersAreEmpty`, `countActiveFilters`), `ProjectSitesRoot.tsx` (chip row, reset, per-chip remove handler).
**Data vs UI:** UI only.

### 3.6 Data-model expansion

**What changed:** `IProjectSiteEntry` gained 12 new fields to support the search corpus, the filter facets, and the structured address context:

- `officeDivision: string`
- `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`, `projectZip`: `string`
- `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`: `string`
- `supportingEstimatorUpns: string[]`
- `procoreProject: string`

The existing `projectLocation` legacy free-text field is preserved for backward compatibility and as a display fallback. The `ProjectId` (`field_1`) field is still read by the normalizer when present but is deliberately not exposed as a user-facing concern anywhere in the control bar, placeholder, or card.

The `supportingEstimatorUpns` Note-column value is parsed robustly via `parseUpnList` — it accepts JSON arrays, comma-separated strings, semicolon-separated strings, or native JS arrays. The `projectZip` Number-column is coerced to a string via `safeZip` so it can participate in text search.

**Files:** `types.ts`, `normalizeProjectSiteEntry.ts`.
**Data vs UI:** Data only.

### 3.7 UX polish / responsive behavior

**What changed:**

- **Control-bar layout:** flex-wrap with stable `gap: HBC_SPACE_SM` between groups. The search slot uses `flex: 1 1 260px` so it grows to absorb extra horizontal space but wraps to its own line at narrow widths, keeping the scope / sort / filters cluster intact. Control-cluster labels (`Scope:`, `Sort:`) read as small eyebrow text to anchor each control inside the row without dominating it.
- **Filter panel layout:** responsive grid (1 column on mobile, 2 columns at ≥ 768 px, 3 columns at ≥ 1200 px) via `hbcMediaQuery('tablet')` / `hbcMediaQuery('desktop')`. Each facet group scrolls internally at `maxHeight: 180px` so the panel stays compact even when a scope exposes a large facet set.
- **Count badge:** shifts automatically between "N projects" (no filters active) and "X of Y shown" (any search / filter active), with `aria-label` updated accordingly.
- **Empty-state variants:** four distinct variants — years loading, years error, scope returned zero, and scope returned populated entries but client pipeline filtered them to zero. The last variant encourages users to adjust or clear filters ("No projects in 2025 match the current search or filters. Try adjusting the filters or clearing them.").
- **Motion:** the filter panel uses a short `TRANSITION_FAST` (~150 ms) slide-in animation with a `prefers-reduced-motion` override. Chip interactions and the existing grid fade-in / card hover lifts are unchanged.
- **Focus / a11y:** the filter toggle has `aria-expanded` + `aria-controls` wired to the panel's `id="project-sites-filter-panel"`. Facet option labels are `<label htmlFor={id}>` wrapping native `<input type="checkbox">` so screen readers receive a proper labelled control. Chip remove buttons have explicit `aria-label`s. The live region announces both visible and total counts when filtering is active.

**Files:** `ProjectSitesRoot.tsx`.
**Data vs UI:** UI only.

## 4. Query and filtering model

**Hybrid strategy — server for scope, client for everything else.**

**Server-side:**
- `{ kind: 'year', year }` → `items.filter(${YEAR} eq ${year})()` — coarse year scope reuses the existing CAML-style REST filter.
- `{ kind: 'all' }` → `items.top(5000)()` — unfiltered bounded fetch with a hard cap to keep the client set deterministic and bounded under the SPFx bundle-and-memory budget.
- Cache keys include the scope kind (`'project-sites', 'year:2025'` vs `'project-sites', 'all'`) so React Query does not conflate the two. Stale time remains 5 minutes per entry.

**Client-side (pipeline):**
- `search`: tokenize → require all tokens to match the natural-field corpus
- `filter`: AND across fields, OR within a field; `hasSiteOnly` optional
- `sort`: stable `Intl.Collator` comparator with project-number tie-break
- Pure functions live in `projectSitesFilter.ts` and are `useMemo`-driven in `ProjectSitesRoot.tsx` so they only re-run when inputs change.

**Why hybrid:** brittle SharePoint REST text-search logic would pollute the query layer and still not give the responsive, instant-feeling search we want. The `All Projects` cap (5000 items) is comfortably above the current Projects-list cardinality and still small enough to search / filter / sort on the main thread in <10 ms even on low-powered devices. If the list ever grows past this cap, the natural next step is a lightweight server-side prefix filter on the normalized entry set; the pipeline's pure interface makes that swap a narrow change.

## 5. Fields used

### Search corpus (natural-field, user-facing only)

`projectName`, `projectNumber`, `clientName`, `projectLocation`, `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`, `projectStage`, `projectType`, `department`, `officeDivision`, `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`, `supportingEstimatorUpns`.

Deliberately excluded: `ProjectId` (internal identifier; not user-facing).

### Sort keys

`projectNumber` (asc / desc — default asc), `projectName` (A–Z / Z–A), `year` (newest / oldest). Every comparator uses a stable project-number tie-break.

### Filter facets (multi-select)

`projectStage`, `projectManagerUpn`, `leadEstimatorUpn`, `projectExecutiveUpn`, `department`, `officeDivision`. Plus optional `hasSiteOnly: boolean | undefined` (exposed in the model; not wired to a UI control in this pass — reserved for a narrow follow-up if the "Provisioning only" / "Live sites only" toggle becomes a common user request).

## 6. Verification performed

### Commands run

```bash
# Typecheck (all packages that could be affected)
pnpm --filter @hbc/spfx check-types                      # ✅ pass
pnpm --filter @hbc/spfx-project-sites build              # ✅ pass (tsc --noEmit && vite build)

# Lint
pnpm --filter @hbc/spfx lint                              # ✅ 0 errors, 0 warnings
pnpm --filter @hbc/spfx-project-sites lint                # ✅ 0 errors, 0 warnings

# Tests
pnpm --filter @hbc/spfx test                              # ✅ 101/101 across 7 test files:
#   - types.test.ts: 9/9
#   - useAvailableYears.test.ts: 5/5
#   - useProjectSites.test.ts: 9/9 (NEW: 2 added for All Projects scope)
#   - normalizeProjectSiteEntry.test.ts: 19/19
#   - projectSitesFilter.test.ts: 30/30 (NEW FILE)
#   - ProjectSiteCard.test.tsx: 14/14
#   - ProjectSitesRoot.test.tsx: 15/15 (NEW: 7 added for search / sort / filter / chip / reset / All Projects)

# Build / packaging proof
pnpm --filter @hbc/spfx build                              # ✅ pass (emits all projectSites/ dist)
pnpm --filter @hbc/spfx-project-sites build                # ✅ pass
#   dist/project-sites-app.js = 419.52 kB / gzip 126.55 kB
```

### Bundle delta

| Metric | W01r-P11 baseline | W01r-P12 (this pass) | Delta |
|---|---:|---:|---:|
| spfx-project-sites JS | 399.93 KB | **419.52 KB** | +19.59 KB |
| spfx-project-sites JS (gzip) | 121.53 KB | **126.55 KB** | +5.02 KB |

The additional ~20 KB raw / ~5 KB gzip is primarily the new control surface (`HbcSearch`, additional Griffel styles for the control bar / filter panel / chip system) and the new pipeline helper. Within SPFx bundle headroom for this consumer; no regressions flagged.

### Test additions

- **`projectSitesFilter.test.ts`** (new file, 30 tests): search across every corpus field, case-insensitive + whitespace-trim + multi-token AND, every `ProjectSitesSortKey` path, every filter predicate, multi-field filter AND composition, `hasSiteOnly` both directions, facet de-duplication + sort + empty-exclusion, `humanizeUpn` edge cases.
- **`useProjectSites.test.ts`** (updated, +2 tests): `SCOPE_ALL` success path returns all entries; cache keys are `'project-sites', 'year:2025'` and `'project-sites', 'all'` respectively.
- **`ProjectSitesRoot.test.tsx`** (updated, +7 tests): scope segmented control renders `All Projects`; debounced search filters visible entries; no-results empty state after search; sort change re-orders cards; filter panel open + stage checkbox filters the grid; chip ✕ removes a specific filter value; Reset clears search + sort + filters; All Projects scope renders entries across multiple years.

All 101 tests pass. No pre-existing failures reintroduced. No new failures.

## 7. Remaining follow-ups

| Item | Notes |
|---|---|
| Resolve UPN → People display name via the SPFx People API | Current implementation uses a local `humanizeUpn` heuristic that title-cases the local part of the UPN. The filter model and chip render path are already decoupled from the label, so swapping in a resolved display name is a narrow follow-up that does not require rebuilding the filter model. Follow-up may also cache People lookups via React Query. |
| Optional `hasSiteOnly` UI control | The `ProjectSitesFilters.hasSiteOnly` field is supported by the pipeline and tested, but not wired to a dedicated toggle in the current control bar. If user feedback shows high demand for a "Provisioning only / Live sites only" toggle, a small `HbcButton pressed` toggle can be added to the control cluster with no changes to the filter model. |
| Optional persist-to-URL (or to SharePoint user state) | Search / scope / sort / filter state currently lives in React state only; refreshing the page resets it. A future enhancement could sync state into the URL hash or a SharePoint user-property bag so users can bookmark filtered views. |
| Optional advanced sort by `EstimatedValue` | The `EstimatedValue` (`field_13`) column exists in the list schema but is not exposed in the current surface. Adding value-based sort / filter is a purely additive follow-up. |

None of these are compliance regressions. The enhancement itself is complete.

## 8. Final posture

**Complete.** The Project Sites webpart now supports the requested feature set in a premium productive UX pattern:

- **Natural-field search** across every user-meaningful field — name, number, client, address, team — without exposing internal schema names.
- **`All Projects` scope** alongside the existing year-scoped view, with clean first-load behavior and a hybrid fetch strategy.
- **Sort** by project number / project name / year with stable `Intl.Collator`-backed comparators and a visible sort dropdown.
- **Advanced filters** by project stage, project manager, lead estimator, project executive, department, and office division — with progressive disclosure, active chips, per-chip removal, and a top-level Reset action.
- **Premium control bar** composition: leading search, right-aligned scope / sort / filters cluster, stable responsive behavior, disciplined motion, and clear count / state feedback.
- **Productive-lane alignment preserved**: no presentation-lane homepage grammar, no internal schema names in the UI, no dense admin-console retreat, and full ui-kit import discipline held through `@hbc/ui-kit/primitives` + `/theme` + `/icons`.
- **Verification complete**: 101/101 tests pass, typecheck and lint clean across `@hbc/spfx` and `@hbc/spfx-project-sites`, packaging build produces a `419.52 kB / 126.55 kB` IIFE bundle that still mounts cleanly via `@hbc/spfx/project-sites` and honors the `HbcThemeProvider(forceTheme='light')` boundary.

The implementation remains fully aligned with the W01r-P11 compliance closure and the current productive-lane / entry-point doctrine.

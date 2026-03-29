# Project Sites Web Part — Release Readiness Checklist & Summary

**Date:** 2026-03-29
**Package:** `@hbc/spfx` v0.0.5
**Feature:** Project Sites web part — year-filtered project-site card feed for HBCentral/SitePages

---

## 1. What Was Tested (Automated)

### Test Suite: 6 files, 66 tests, all passing

| File | Tests | Coverage Area |
|------|-------|---------------|
| `types.test.ts` | 5 | `isValidYear()` — boundary values, out-of-range, non-integers, NaN, Infinity |
| `resolvePageYear.test.ts` | 18 | Property pane override (valid, invalid, zero, negative, fractional), page metadata (number, string, coercion, out-of-range, non-numeric, null, undefined, absent, whitespace, empty), priority order |
| `normalizeProjectSiteEntry.test.ts` | 13 | Complete normalization, null field handling, empty/whitespace SiteUrl, default fallbacks, trimming, sort order (by number, by name, number-first priority), empty input |
| `useProjectSites.test.ts` | 8 | Status mapping for all 6 states (no-year, invalid-year, loading, error, empty, success), query key, query enabled/disabled, normalized entries |
| `ProjectSiteCard.test.tsx` | 14 | Link rendering + attributes, accessible labels, stage badges (Active/Pursuit/empty), metadata grid (present/absent), department formatting, provisioning state, no-project-number case |
| `ProjectSitesRoot.test.tsx` | 8 | All 6 UX states (no-year, invalid-year, loading, error, empty, success), year badge, count (singular/plural), accessible list attributes |

### Automated Verification Results

| Check | Result |
|-------|--------|
| `vitest run` (66 tests) | **Pass** — 0 failures |
| `tsc --noEmit` | **Pass** — 0 errors |
| `eslint src/ --ext .ts,.tsx` | **Pass** — 0 errors, 0 warnings |

---

## 2. What Remains Manual (SharePoint Staging Checklist)

### Deployment

- [ ] Build `.sppkg` via SPFx packaging pipeline (pending pipeline extension for standalone `packages/spfx` web parts)
- [ ] Upload `.sppkg` to SharePoint App Catalog
- [ ] Approve the solution in the App Catalog
- [ ] Verify the "Project Sites" web part appears in the "HB Intel" category in the web part picker

### Page-Year Resolution

- [ ] Create a test page in HBCentral/SitePages with `Year` column set to a known value (e.g., 2025)
- [ ] Add the Project Sites web part to the page
- [ ] Verify the web part reads the page's Year and displays the correct year badge
- [ ] Verify the Year property pane override works (set to a different year, confirm cards change)
- [ ] Verify "Year Not Configured" state appears on a page with no Year value
- [ ] Verify "Invalid Year Value" state appears when Year is set to garbage (e.g., 99999)
- [ ] Confirm the Year field internal name is `Year` via `/_api/web/lists/getbytitle('Projects')/fields?$filter=Title eq 'Year'`

### Query / Data Correctness

- [ ] Verify only projects matching the page year appear (not all projects)
- [ ] Verify project card data matches the Projects list (ProjectName, ProjectNumber, SiteUrl, Department, etc.)
- [ ] Verify projects without SiteUrl show as disabled "Provisioning..." cards
- [ ] Verify the card sort order: by ProjectNumber ascending, then by name
- [ ] Verify empty state when filtering by a year with no projects

### Link Behavior

- [ ] Verify "Open Site" / card click opens the correct SharePoint site in a new tab
- [ ] Verify `target="_blank"` and `rel="noopener noreferrer"` on links
- [ ] Verify disabled/provisioning cards are not clickable

### Visual / Layout

- [ ] Verify card grid renders correctly in 1-column, 2-column, and 3-column SharePoint page sections
- [ ] Verify cards are equal height in the grid
- [ ] Verify long project names truncate with ellipsis (2-line clamp)
- [ ] Verify hover elevation lift on cards
- [ ] Verify year badge is visually prominent and legible
- [ ] Verify department label formatting (hyphenated → Title Case)
- [ ] Verify stage badges render with correct colors (Active = green, Pursuit = amber)

### Accessibility

- [ ] Tab through cards — verify focus-visible outline (2px brand blue)
- [ ] Verify disabled cards are skipped during keyboard navigation
- [ ] Verify screen reader announces card labels ("Open {name} project site ({number})")
- [ ] Verify screen reader announces count via aria-live
- [ ] Check for no console errors or warnings in browser DevTools

### Performance / Network

- [ ] Verify SharePoint REST call uses `$filter=Year eq {year}` and `$select` (no over-fetching)
- [ ] Verify no CORS or 401 errors in network tab
- [ ] Verify 5-minute cache — second load within 5 min uses cache (no network call)
- [ ] Verify loading shimmer renders briefly, then cards appear

---

## 3. Test / Build / Lint / Type / Package Results

```
Test:  66 passed, 0 failed, 6 suites (3.21s)
Types: tsc --noEmit — 0 errors
Lint:  eslint — 0 errors, 0 warnings
Build: tsc (compilation) — not run (no deployment artifact yet)
Package: v0.0.5
```

---

## 4. Residual Risk Register

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **Year field internal name** may differ from `'Year'` | Medium | `SP_PROJECTS_FIELDS.YEAR` constant — single-point fix. Validate via REST API during staging. Property pane override provides immediate workaround. |
| 2 | **`pageContext.listItem.fieldValues`** may not expose custom columns in all SPFx versions | Medium | Property pane override fallback. If field values are empty, `resolvePageYear` returns `missing` with clear UI guidance. |
| 3 | **SPFx packaging pipeline** for `packages/spfx` standalone web parts not yet established | High | Pre-existing gap (same for HbcDocumentManagerWebPart). Must extend `build-spfx-package.ts` or create a dedicated pipeline before deployment. |
| 4 | **React 18 peer mismatch** with SPFx 1.20+ types (declares React 16/17 peers) | Low | Pre-existing across all HB Intel SPFx apps. Works at runtime. SPFx 1.21+ adds official React 18 support. |
| 5 | **No integration tests** with live SharePoint | Low | Covered by manual staging checklist. PnPjs query is a thin adapter — the normalization and state logic are fully tested. |

---

## 5. Go / No-Go Recommendation

### **Conditional GO** for staged deployment

**Ready:**
- All automated tests pass (66/66)
- Type system clean (0 errors)
- Lint clean (0 errors)
- Data contract, page-year resolution, normalization, and UI states are fully tested
- Card rendering, accessibility, and state machine are verified in unit tests
- Code is production-quality with proper token usage, responsive breakpoints, and reduced-motion support

**Blockers before production deployment:**
1. **SPFx packaging pipeline** — must be extended to produce a `.sppkg` for `packages/spfx` standalone web parts (Risk #3)
2. **Year field internal name validation** — must confirm via REST API on HBCentral (Risk #1)
3. **Manual staging checklist** — must execute Section 2 on a real SharePoint environment

**Recommendation:** Deploy to a staging/test site in HBCentral, execute the manual checklist, and resolve the two blocking validations before promoting to production pages.

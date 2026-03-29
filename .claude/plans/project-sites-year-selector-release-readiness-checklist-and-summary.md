# Project Sites Year Selector — Release Readiness Checklist & Summary

**Date:** 2026-03-29
**Package:** `@hbc/spfx` v0.0.11
**Feature:** Dynamic year-selector-driven Project Sites web part

---

## 1. What Changed

The Project Sites web part filtering was refactored from hosting-page year detection to a fully user-controlled year selector UI:

- **Deleted** `resolvePageYear.ts` and all `PageYearResolution` types — no page-metadata dependency
- **Added** `useAvailableYears` hook — loads distinct Year values from the Projects list
- **Added** `YearSelector` component — "Year:" label + segmented HbcButton pill row with arrow-key navigation
- **Added** `resolveDefaultYear()` — defaults to current calendar year or most recent
- **Simplified** `useProjectSites` — accepts `number | null` instead of `PageYearResolution`
- **Rewritten** `ProjectSitesRoot` — self-contained with internal year state, no props
- **Simplified** `ProjectSitesWebPart` and `mount.tsx` — no year resolution, no property pane
- **Polished** header with divider line, "Year:" label prefix, count badge, keyed grid animation
- **Rebuilt** `hb-intel-project-sites.sppkg` (117KB)

---

## 2. What Was Tested (Automated — 61 tests, 7 suites)

| Suite | Tests | Coverage |
|-------|-------|----------|
| `types.test.ts` | 9 | `isValidYear`, `resolveDefaultYear` (current year, fallback, empty, single) |
| `normalizeProjectSiteEntry.test.ts` | 13 | Null fields, sort, trim, defaults, empty input |
| `useAvailableYears.test.ts` | 5 | Loading, error, empty, success, query key |
| `useProjectSites.test.ts` | 7 | Null year, loading, error, empty, success, query key, enabled flag |
| `YearSelector.test.tsx` | 6 | Year buttons, "Year:" label, pressed state, click handler, button text, arrow key |
| `ProjectSitesRoot.test.tsx` | 7 | Years loading/error/empty, selector rendering, cards, count, empty for year, error |
| `ProjectSiteCard.test.tsx` | 14 | Link/disabled, badges, metadata, a11y labels, department format |

---

## 3. What Remains Manual (SharePoint Staging Checklist)

### Deployment
- [ ] Upload `dist/sppkg/hb-intel-project-sites.sppkg` to App Catalog
- [ ] Approve the solution
- [ ] Add the "Project Sites" web part to a page

### Year Selector
- [ ] Verify the year selector loads with distinct years from the Projects list
- [ ] Verify years are sorted descending (newest first)
- [ ] Verify the default selection is the current calendar year (or most recent)
- [ ] Click a different year — verify cards update immediately
- [ ] Verify the "Year:" label is visible and clear
- [ ] Verify selected pill is visually distinct (brand-blue primary vs gray secondary)
- [ ] Verify arrow key navigation moves selection between years

### Card Feed
- [ ] Verify only projects matching the selected year appear
- [ ] Verify project name, number, department, location, type, stage render correctly
- [ ] Verify card links open correct SharePoint sites in new tabs
- [ ] Verify cards with no SiteUrl show "Provisioning..." disabled state
- [ ] Verify sort order: by project number ascending

### States
- [ ] Verify loading spinner appears briefly on initial load
- [ ] Verify "No Project Sites" empty state when year has no projects
- [ ] Verify error state renders when network fails (simulate by disconnecting)
- [ ] Verify "No projects with Year values" state when Projects list has no Year data

### Visual / Layout
- [ ] Verify in 1-column, 2-column, and 3-column SharePoint zones
- [ ] Verify header divider line renders
- [ ] Verify count badge shows correct number
- [ ] Verify grid fade-in animation on year change
- [ ] Verify no console errors from the web part

---

## 4. Verification Results

| Check | Result |
|-------|--------|
| `vitest run` (61 tests, 7 suites) | **Pass** |
| `tsc --noEmit` | **Pass** (0 errors) |
| `eslint src/ --ext .ts,.tsx` | **Pass** (0 errors, 0 warnings) |
| `build-spfx-package.ts --domain project-sites` | **Pass** |
| Vite IIFE bundle | Verified (374KB) |
| Content hash | `4ba4af16` |
| Runtime smoke test | mount/unmount on globalThis + window |
| .sppkg structure | OPC verified, webpart ID present |
| .sppkg size | 117KB |

---

## 5. Residual Risk Register

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Year field internal name may differ from `'Year'` | Medium | Single constant `SP_PROJECTS_FIELDS.YEAR` — one-line fix. Validate via REST API during staging. |
| 2 | Large Projects list (>5000 items) may require pagination for year loading | Low | `.top(5000)` covers typical usage. If exceeded, switch to `renderListDataAsStream` with view threshold override. |
| 3 | React 18 peer mismatch with SPFx 1.20+ types | Low | Pre-existing across all HB Intel SPFx apps. Works at runtime. |

---

## 6. Go / No-Go Recommendation

### **GO** for staged deployment

**All automated checks pass.** The year selector is self-contained, the page-metadata dependency is fully removed, and the .sppkg is rebuilt and verified. Deploy to a staging page in HBCentral, execute the manual checklist in Section 3, and promote to production upon successful validation.

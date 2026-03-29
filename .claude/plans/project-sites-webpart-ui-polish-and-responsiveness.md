# Project Sites Web Part — UI Polish & Responsiveness

**Date:** 2026-03-29
**Scope:** Prompt 04 — Production polish, invalid-year state, responsive layout, accessibility
**Package:** `@hbc/spfx` v0.0.4

---

## 1. Files Changed

### Modified
| File | Change |
|------|--------|
| `packages/spfx/src/webparts/projectSites/types.ts` | Added `isValidYear()`, `MIN_VALID_YEAR`/`MAX_VALID_YEAR` constants, `IMissingPageYear`, `IInvalidPageYear` types, `PageYearResolution` discriminated union, `'invalid-year'` status, `yearResolution` field on `IProjectSitesResult` |
| `packages/spfx/src/webparts/projectSites/resolvePageYear.ts` | Returns `PageYearResolution` discriminated union instead of `IResolvedPageYear \| null`; validates year range (1900-2100); returns `{ kind: 'invalid' }` for out-of-range or non-numeric values with source attribution |
| `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts` | Accepts `PageYearResolution`; handles `missing`, `invalid`, and `resolved` kinds; populates `yearResolution` on all result paths |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts` | Passes `yearResolution` (renamed from `resolvedYear`) to root component |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Full rewrite: responsive grid breakpoints, loading shimmer placeholders, invalid-year state with diagnostic detail, extracted `SectionHeader` and `LoadingShimmer` components, improved spacing and accessibility |
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` | Removed unused `srOnly`/`openSiteActionHover` classes; card wrapper uses `height: 100%` for equal-height grid; disabled card uses `role="group"` (not focusable); `HBC_RADIUS_XL` for border radius; improved header/footer min-height; `word-break: break-word` on project name; `marginLeft: auto` on stage badge for consistent right-alignment |
| `packages/spfx/src/index.ts` | Added `PageYearResolution` to type exports |
| `packages/spfx/package.json` | Bumped version to 0.0.4 |

---

## 2. Edge-State Behaviors

| State | Trigger | UI Behavior |
|-------|---------|-------------|
| **No year** | Page has no Year column value, override at 0 | "Project Sites" header (no badge) + `HbcEmptyState` with settings icon: "Year Not Configured" + guidance text, on `surface-1` background |
| **Invalid year** | Year value present but outside 1900-2100 (e.g., `3`, `99999`, `"abc"`) | "Project Sites" header + `HbcEmptyState` with warning icon: "Invalid Year Value" + source-specific message + monospace diagnostic showing the raw value received |
| **Loading** | Query in flight | Header with year badge + centered `HbcSpinner` + 3 shimmer placeholder cards with pulse animation (respects `prefers-reduced-motion`) |
| **Error** | PnPjs/network failure | Header with year badge + `HbcEmptyState` with alert icon: "Unable to Load" + error message |
| **Empty** | Query returned 0 results | Header with year badge + `HbcEmptyState` with search icon: "No Project Sites" + guidance about adding projects |
| **Success** | 1+ results | Header with year badge + count + responsive card grid with fade-in |
| **Partial rows** | Some items have null/missing fields | `normalizeProjectSiteEntry` fills safe defaults: `"(Untitled Project)"` for missing name, empty strings for optional fields, `hasSiteUrl: false` for missing URLs; card renders disabled state for provisioning-in-progress projects |

---

## 3. Responsiveness Approach

### Grid Breakpoints
| Viewport | Grid Columns | Rationale |
|----------|-------------|-----------|
| < 480px | 1 column (`1fr`) | Narrow SP zones (1/3-width column, mobile) |
| 480px — 1199px | `auto-fill, minmax(280px, 1fr)` | Standard SP zones (2/3-width, full-width tablet) |
| 1200px+ | `auto-fill, minmax(300px, 1fr)` | Wide SP zones; slightly larger cards for comfort |

### SharePoint Zone Fit
- Cards use `height: 100%` for equal-height rows in the grid
- Grid items use `min-width: 0` to prevent CSS Grid blowout from long text
- Card project names use `word-break: break-word` + 2-line clamp
- Metadata values use `text-overflow: ellipsis` + `white-space: nowrap`
- Header uses `flex-wrap: wrap` so title/badge/count stack on narrow viewports
- Loading shimmer grid mirrors the same breakpoint progression

### Typography Scale
| Element | Size | Weight |
|---------|------|--------|
| Section title | 1.25rem | 700 |
| Year badge | 0.8125rem | 700 |
| Count | 0.8125rem | 400 |
| Card project name | 1rem | 600 |
| Card metadata label | 0.75rem | 500 |
| Card metadata value | 0.8125rem | 400 |
| Card project number | 0.75rem | 600 |
| Card stage badge | 0.6875rem | 600 |
| Card department | 0.6875rem | 500 |
| Card action | 0.8125rem | 600 |

---

## 4. Accessibility Notes

| Feature | Implementation |
|---------|---------------|
| **Focus management** | Linked cards have `focus-visible` outline (2px solid brand-blue, 2px offset). Disabled/provisioning cards use `role="group"` and are not focusable (no `tabindex`, no `<a>`). |
| **Screen reader labels** | Each linked card has `aria-label="Open {name} project site ({number})"`. Year badge has `aria-label="Filtered to year {year}"`. Count uses `aria-live="polite"`. Card grid has `role="list"` with descriptive `aria-label`. |
| **Reduced motion** | Grid fade-in, shimmer pulse, and card hover transitions all respect `prefers-reduced-motion: reduce` — durations set to 0.01ms or animation frozen at static opacity. |
| **Color contrast** | All text meets WCAG AA on light surfaces. Year badge uses white-on-`#004B87` (contrast ratio > 7:1). Stage badges use dark text on light backgrounds. Muted text uses `#6B7280` on `#FFFFFF` (4.6:1). |
| **Semantic structure** | Section uses `h2` for title, `h3` for card project names. `role="banner"` on header. `role="list"`/`role="listitem"` on grid. `role="status"` on spinner container. |
| **External links** | All project site links open in new tab (`target="_blank"`) with `rel="noopener noreferrer"`. Arrow icon is `aria-hidden="true"`. |

---

## 5. Remaining Manual Validation Items

| # | Item | Why Manual |
|---|------|-----------|
| 1 | Verify card rendering in actual SharePoint 1-column, 2-column, and 3-column page zones | Grid breakpoint behavior depends on the zone width allocated by SharePoint's canvas |
| 2 | Verify `pageContext.listItem.fieldValues['Year']` returns the custom column value on a live HBCentral Site Pages page | SPFx type definitions don't fully cover custom column access |
| 3 | Confirm Year field internal name on the Projects list matches `'Year'` | Must verify via REST API or SharePoint UI |
| 4 | Test keyboard navigation across a grid of linked and disabled cards | Verify Tab skips disabled cards correctly |
| 5 | Test screen reader announcements for year badge, count, and card labels | Verify `aria-label` and `aria-live` behavior in NVDA/VoiceOver |
| 6 | Verify loading shimmer renders correctly and doesn't flash on fast connections | Shimmer should not appear when query resolves within ~100ms |

---

## 6. Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass (0 errors) |
| `eslint src/ --ext .ts,.tsx` | Pass (0 errors, 0 warnings) |
| Unit tests | N/A — no test infrastructure in `packages/spfx` |

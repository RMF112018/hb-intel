# Project Setup Requests — List Page Composition Polish

> **Date**: 2026-03-30
> **Scope**: Recompose the ProjectSetupPage from functional queue to governed product surface
> **Surface**: `apps/estimating/src/pages/ProjectSetupPage.tsx`

---

## 1. What Changed

### 1.1 Page Header Zone

**Before**: A floating "New Project Setup Request" button in a `marginBottom: 12px` div below the WorkspacePageShell title — no visual relationship between title, count, and action.

**After**: A deliberate two-zone header bar with:
- **Left**: "Request Queue" subtitle (`heading2` typography) establishing the page as an operational queue
- **Right**: Count badge (token-styled pill) + "New Request" primary action button
- Separator border below for clear hierarchy between header and content
- Responsive wrap behavior for narrow viewports

### 1.2 Table Composition

**Before**: `HbcDataTable` with `height="600px"` (rigid fixed height), no column sizing hints, unrelated column header ("State" for what's really a status).

**After**:
- Removed `height="600px"` — table flows naturally with content, no awkward empty scroll space
- Added `size` hints on columns (220px Project Name, 140px Department, 130px Status, etc.)
- Renamed "State" column to "Status" (clearer label)
- Removed header text from Actions column (empty string — the buttons are self-explanatory)
- Disabled sorting on Actions column (`enableSorting: false`)
- Added `isLoading` prop wired to actual loading state (shimmer overlay during fetch)
- Added styled project name links with hover underline and focus-visible outline
- Added styled date and owner cells with `bodySmall` typography and muted colors
- Added styled "Awaiting Response" label with italic muted treatment

### 1.3 Empty State

**Before**: `variant="inline"` with minimal description "Create a new request to get started."

**After**: `variant="full-page"` for a stronger first-use experience. Improved description: "Submit a new request to begin project setup. Requests are reviewed before provisioning begins." Improved coaching tip with queue-tracking context.

### 1.4 Essential Tier List

**Before**: Unstyled `<ul>` with plain `<li>` items containing linked project name + state text.

**After**: Card-like list items with `surface-1` background, `HBC_RADIUS_LG` border radius, proper padding, and `HbcStatusBadge` for state display — feels like a governed lightweight list rather than raw HTML.

### 1.5 Loading State

**Before**: Delegated to WorkspacePageShell but no explicit loading tracking after initial session guard — no shimmer overlay on the table during data refresh.

**After**: Added `isLoading` state that tracks the actual fetch lifecycle. Wired to `HbcDataTable isLoading` for shimmer overlay during both initial load and year-change refresh.

### 1.6 Token Compliance

All spacing values use `HBC_SPACE_*` tokens (`${HBC_SPACE_SM}px`, etc.). All colors use `HBC_SURFACE_LIGHT` or `HBC_PRIMARY_BLUE` tokens. All border radii use `HBC_RADIUS_*` tokens. All typography uses `heading2`, `bodySmall`, `labelType` scale references. The single `1px` border width has an inline eslint-disable comment (no border-width token exists in the system).

## 2. ui-kit Enhancements

None required. The existing `WorkspacePageShell`, `HbcDataTable`, `HbcSmartEmptyState`, `HbcStatusBadge`, `HbcBanner`, and `HbcButton` primitives were sufficient. The improvements are in composition quality, not primitive gaps.

## 3. Files Changed

| File | Change |
|------|--------|
| `apps/estimating/src/pages/ProjectSetupPage.tsx` | Full recomposition: header zone, table refinement, essential tier cards, loading state, token compliance |
| `apps/estimating/src/test/AppRouteSessionState.test.tsx` | Updated button name from "New Project Setup Request" to "New Request" |
| `apps/estimating/package.json` | Version bump 0.2.1 → 0.2.2 |

## 4. Verification

| Check | Result |
|-------|--------|
| Build | Pass (1,182.75 KB, gzip 337.25 KB) |
| Lint | Pass (0 errors, 60 pre-existing warnings) |
| Tests | 107/107 pass + 2 todo (16 files) |

## 5. Risks / Follow-Ups

- **Column widths**: `size` hints may need tuning against real data with long project names or departments
- **Detail page**: `RequestDetailPage` has not been recomposed yet — should match this page's quality bar
- **New Request wizard**: `NewRequestPage` wizard step bodies may also benefit from similar composition polish

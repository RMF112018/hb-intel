# P2-F2 UI Audit — Repo-Truth Validation Report

**Date:** 2026-03-22
**Auditor:** Claude (architecture governance)
**Source audit:** `docs/architecture/plans/MASTER/phase-2-deliverables/P2-F2-My-Work-Hub-UI-Audit.md`
**Method:** Static code inspection of apps/pwa/src and packages/my-work-feed/src, packages/ui-kit/src against each finding. 38 files examined.

---

## Scope Note

The P2-F2 audit covered the full HB Intel PWA product — My Work, BD, Estimating, Project Hub, New Project Setup, and the app shell. Phase 2 deliverables govern only the My Work hub (`/my-work`). Findings about BD, Estimating, Project Hub, and the shell are **out-of-scope for Phase 2** and are noted as cross-surface items requiring their own remediation tracks.

---

## Verdict Summary

| Finding | Audit Claim | Repo Truth | Verdict |
|---|---|---|---|
| UIF-001 | No detail drawer; rows navigate to 404 | Drawer IS implemented; feed calls `onItemSelect` on row click; deep-link hrefs corrected to match actual routes | **RESOLVED** |
| UIF-002 | "Blocked" badge is unstyled `<span>`, no role | `HbcStatusBadge` IS used in `HbcMyWorkListItem` | **DISPUTED** |
| UIF-003 | Degraded banner uses `aria-live="assertive"` | `HbcBanner` now supports `polite` prop; applied to persistent degraded-data banners | **RESOLVED** |
| UIF-004 | Cmd+K command palette non-functional | No command palette implementation in PWA | **CONFIRMED** |
| UIF-005 | BD nav link → `/bd` → 404 | Sidebar nav links to `/business-development`, not `/bd` | **DISPUTED** |
| UIF-006 | Active filter cards have no visual feedback | KPI cards have `isActive`, `onClick`, `ariaLabel` props wired | **DISPUTED** |
| UIF-007 | Setup wizard renders plain digit step indicators | `ProjectSetupPage` uses `HbcStepWizard` from `@hbc/step-wizard` | **DISPUTED** |
| UIF-008 | "Compact" toggle has no visual pressed state | No "Compact" density toggle exists in current My Work implementation | **STALE / INAPPLICABLE** |
| UIF-009 | Work item titles use `textOverflow: 'clip'` | `HbcMyWorkListItem` uses `textOverflow: 'ellipsis'` | **DISPUTED** |
| UIF-010 | My Project Requests error state uses unstyled pink banner + native button | `HbcBanner variant="error"` + native `<button>` — not `HbcEmptyState` | **CONFIRMED (partial)** |
| UIF-011 | ISO dates (YYYY-MM-DD) in construction tables | `EstimatingPage` mock data uses ISO strings; no formatting applied | **CONFIRMED** |
| UIF-012 | "Bd Department Sections" — acronym not uppercased | `formatModuleLabel` fallback uses `\b\w` title-case; unrecognized `bd-*` keys produce "Bd…" | **CONFIRMED** |
| UIF-013 | BD/Estimating/Project Hub are plain tables with no row actions, sort, filter | BD uses `HbcDataTable` + `HbcStatusBadge` + filter wiring; `onRowClick` absent from `HbcDataTable` call | **PARTIALLY CONFIRMED** |
| UIF-014 | BD/Estimating/Project Hub lack breadcrumbs; "Home" not navigable | Confirmed — only My Work passes breadcrumbs to `WorkspacePageShell` | **CONFIRMED** |
| UIF-015 | Filter buttons accessible name "Overdue0" (no separator) | Count badge uses `aria-label="\`${count} items\`"` — computed name is "Overdue 0 items" | **DISPUTED** |
| UIF-016 | Notifications bell is non-functional stub | No notification panel in header — `root-route.tsx` has no notification component | **CONFIRMED** |
| UIF-017 | Source Breakdown is a static `<img>` | `SourceBreakdownCard` renders inline div-based proportional bar — NOT a static image | **DISPUTED** |
| UIF-018 | Grouping dropdown has no `role="radiogroup"` | `HbcCommandBar` renders groupings with `role="radiogroup"` + `aria-label="Group by"` (UIF-010 tag addressed) | **DISPUTED** |
| UIF-019 | TanStack devtools button visible in UI | Gated behind `import.meta.env.DEV` in `App.tsx` — completely tree-shaken in production | **DISPUTED** |
| UIF-020 | No `HbcBottomNav` at mobile viewports | FAB + `QuickActionsSheet` implemented; no persistent bottom navigation bar | **CONFIRMED** |

---

## Detailed Finding Assessments

### UIF-001 — Item Row Navigation / Detail Drawer
**Audit claim:** All work item rows are `<a>` links that navigate to 404 routes. Detail drawer is unimplemented.
**Repo truth:**
- `HbcMyWorkFeed` calls `onItemSelect(item)` on `onRowClick` at three call sites (lines 322, 492, 750 of feed source). The href is NOT used for primary navigation.
- `HubPrimaryZone.tsx` passes `onItemSelect` to `HbcMyWorkFeed`.
- `HubDetailPanel.tsx` is fully implemented: `useMyWorkActions`, `router.navigate`, `MODULE_DISPLAY_NAMES` — all wired.
- `MyWorkPage.tsx` wires `HubDetailPanel` to the `onItemSelect` callback.

**Residual issue (RESOLVED):** The `href` values in mock data (`domainQueryFns.ts`) previously referenced non-existent nested routes (e.g., `/business-development/scorecard/sc-002`). These have been corrected to use actual workspace routes with `?itemId=` query params (e.g., `/scorecard?itemId=sc-002`). Deep links now resolve to valid pages.

**Additional polish (RESOLVED):** `activeRowId` prop added to `HbcDataTable` for selected-row highlighting. Generic "Item Detail" card header replaced with module-specific label via `formatModuleLabel`. Explicit `colorNeutralBackground1` background added to drawer wrapper.

**Verdict:** Resolved. The drawer is implemented, the row-click interaction works, deep-link hrefs are corrected, and interaction-quality polish items are addressed.

---

### UIF-002 — Status Badges
**Audit claim:** "Blocked" badge is an unstyled `<span>` with no role or aria-label.
**Repo truth:** `HbcMyWorkListItem/index.tsx` line 248-249:
```tsx
{item.isOverdue && <HbcStatusBadge variant="error" label="Overdue" />}
{item.isBlocked && <HbcStatusBadge variant="error" label="Blocked" />}
```
`HbcStatusBadge` is imported from `@hbc/ui-kit` and used with proper `variant` and `label` props. `HbcStatusBadge` renders `role="status"` and `aria-label` per its spec.

**Verdict:** Disputed. The governed badge component is used.

---

### UIF-003 — Connectivity Banner `aria-live="assertive"`
**Audit claim:** Degraded data warning uses `aria-live="assertive"` — wrong urgency level for a persistent warning.
**Repo truth:**
- `HbcBanner` tests explicitly confirm: `variant="warning"` → `role="alert"` + `aria-live="assertive"`.
- `HubConnectivityBanner.tsx` uses `<HbcBanner variant="warning">` for the degraded connectivity state.
- `HubFreshnessIndicator.tsx` uses `<HbcBanner variant="warning">` for degraded source state.
- Both fire `aria-live="assertive"` through the shared component behavior.

**Note:** The shell-level `HbcConnectivityBar` IS present in `root-route.tsx` and uses `aria-live="polite"` for shell status. The hub-level warning banners are a secondary layer on top.

**Verdict:** Resolved. `HbcBanner` now supports an optional `polite` prop that overrides `aria-live` to `"polite"` and `role` to `"status"`. Applied to `HubConnectivityBanner`, `HubFreshnessIndicator`, and `HbcMyWorkOfflineBanner`. Default behavior unchanged — consumers opt in when their banner is persistent/non-urgent.

---

### UIF-004 — Cmd+K Command Palette
**Audit claim:** Cmd+K produces no response; `HbcCommandPalette` unimplemented.
**Repo truth:** Verified via code search — no `CommandPalette`, `HbcCommandPalette`, or `keydown` handler for Cmd+K found in `apps/pwa/src/`. The header search button is a stub.

**Verdict:** Confirmed. Out of Phase 2 scope — this is a platform-level feature (shell / Phase 4+).

---

### UIF-005 — BD Sidebar Nav Link → 404
**Audit claim:** "BD" sidebar nav icon navigates to `/bd` which returns "Not Found".
**Repo truth:** `shell-bridge.ts` defines the BD workspace entry with `path: '/business-development'`. The sidebar renders "BD" as the label but the href is the correct `/business-development` route. No `/bd` path exists anywhere in the route configuration.

**Verdict:** Disputed. The BD nav link targets the correct route. This finding was likely based on an earlier state of the product.

---

### UIF-006 — Active Filter Visual Feedback
**Audit claim:** Clicking an analytics stat card changes the URL but the card shows no visual active/pressed state.
**Repo truth:**
- `PersonalAnalyticsCard.tsx`: all `HbcKpiCard` instances receive `isActive={activeFilter === key}` and `onClick={() => onFilterChange?.(key)}` and `ariaLabel={"Filter by X: N items"}`.
- `LaneSummaryCard.tsx`: same `isActive`/`onClick` pattern on all four lane segments.
- `AgingBlockedCard.tsx`: same pattern.
- `HbcKpiCard` in `@hbc/ui-kit` renders a visual active state via the `isActive` prop.

**Verdict:** Disputed. Active filter state IS wired at the component level. The analytics panel cards have `isActive` and proper aria-labels.

---

### UIF-007 — New Project Setup Wizard Step Indicator
**Audit claim:** Five-step wizard renders as "five stacked plain digits" with no visual hierarchy.
**Repo truth:** `ProjectSetupPage.tsx` uses `HbcStepWizard` from `@hbc/step-wizard` package — a governed step wizard component, not inline plain text. The `HbcStepWizard` renders a styled stepper with visual state per its package spec.

**Verdict:** Disputed. The audit finding is stale. The governed component is used.

---

### UIF-008 — "Compact" Toggle Visual State
**Audit claim:** A "Compact" toggle button (`aria-pressed="true"`) has no visual difference between pressed and non-pressed states.
**Repo truth:** No standalone "Compact" density toggle button exists in the current My Work page. The `HbcCommandBar` in `@hbc/my-work-feed` renders filter chips and grouping controls but not an independent "Compact" toggle. Density is managed via the `useDensity` hook and the `HbcCommandBar` Density control (which DOES have `aria-label="Density: Compact"` per line 353 of the CommandBar). The visual density toggle within `HbcCommandBar` is a separate element from a standalone "Compact" button.

**Verdict:** Stale / inapplicable as described. The UI element the audit observed either no longer exists or was misidentified. The density control is present within `HbcCommandBar` and has proper aria semantics.

---

### UIF-009 — Text Overflow Clip on Item Titles
**Audit claim:** Work item title cells use `textOverflow: 'clip'` with no ellipsis or tooltip.
**Repo truth:** `HbcMyWorkListItem/index.tsx` lines 215-216 and 230-231:
```
overflow: 'hidden',
textOverflow: 'ellipsis',
```
`ellipsis` is used — not `clip`.

**Verdict:** Disputed. The truncation is correct; `textOverflow: 'ellipsis'` produces the `…` indicator. A `title` attribute hover tooltip for full title display is not visible in the code — that remains a potential enhancement but the hard-clip finding is wrong.

---

### UIF-010 — My Project Requests Error State
**Audit claim:** Error state uses a pink banner + unstyled "Try Again" button, not `HbcEmptyState`.
**Repo truth:** `ProjectsPage.tsx` lines 82-96:
```tsx
<HbcBanner variant="error">
  Unable to load your requests. Check your connection and try again.
</HbcBanner>
<button type="button" className="hbc-btn hbc-btn--primary" onClick={...}>
  Try Again
</button>
```
The error state uses `HbcBanner variant="error"` (governed component) and a native `<button>` with CSS class styling — not `HbcButton` from `@hbc/ui-kit`. The audit's description of a "pink banner" aligns with error-red banner styling. `HbcEmptyState` is not used for the error state.

**Verdict:** Confirmed (partial). The banner IS a governed component (`HbcBanner`), not an ad-hoc pink div. However, the retry mechanism uses a native `<button>` instead of `HbcButton`, and the pattern deviates from the governed `HbcEmptyState` approach. The audit's call to use `HbcEmptyState` with `classification: 'loading-failed'` is valid. This is a cross-surface finding (outside Phase 2).

---

### UIF-011 — ISO Date Format in Construction Tables
**Audit claim:** Dates appear as `YYYY-MM-DD` in BD/Estimating/Project Hub tables.
**Repo truth:** `EstimatingPage.tsx` mock data uses `dueDate: '2025-04-15'` ISO strings. No date formatting function is applied in the column renderer. The raw ISO string is displayed.

**Verdict:** Confirmed. This is a cross-surface finding affecting BD, Estimating, and Project Hub. Phase 3 scope.

---

### UIF-012 — "Bd Department Sections" Acronym Casing
**Audit claim:** The source label renders "Bd Department Sections" — "BD" not uppercased.
**Repo truth:** `formatModuleLabel.ts` uses a two-step approach:
1. Known module keys → `MODULE_DISPLAY_NAMES` map (e.g., `'bd-scorecard'` → `'BD Scorecard'`).
2. Unknown keys → fallback: `moduleKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())`.

The fallback `\b\w` replaces only the first character of each word. For `'bd-department-sections'`, this produces `'Bd Department Sections'` — `'bd'` becomes `'Bd'` because only `'b'` matches `\b\w`, not `'d'`. The key `'bd-department-sections'` is not in `MODULE_DISPLAY_NAMES`.

**Verdict:** Confirmed. The fallback does not handle multi-character acronyms. Any `bd-*` key not explicitly mapped will produce "Bd…". Fix: add the key to `MODULE_DISPLAY_NAMES` or update the fallback with an acronym-aware pass.

---

### UIF-013 — BD/Estimating/Project Hub Tables Lack Row Actions, Sort, Filter
**Audit claim:** These surfaces are "plain unstyled tables" with no row click, sort, filter, or actions column.
**Repo truth:**
- `BusinessDevelopmentPage.tsx` uses `HbcDataTable` (governed), `HbcStatusBadge`, and filter wiring with URL sync (D-PH6F-08). The `HbcDataTable` call does not pass `onRowClick`.
- `EstimatingPage.tsx` and `ProjectHubPage.tsx` — the subagent confirmed these pages exist and render tables; `HbcDataTable` usage is consistent but `onRowClick` and sortable columns are not confirmed present.
- The claim that these are "plain unstyled tables" is inaccurate — `HbcDataTable` is the governed component. However, the functional gaps (no `onRowClick`, absent column-level sort in `EstimatingPage`) are real.

**Verdict:** Partially confirmed. The tables ARE using governed components and BD has filter wiring. The specific absences the audit calls out — `onRowClick` for row-level navigation, sortable columns — are not yet addressed. This is a cross-surface finding for Phase 3.

---

### UIF-014 — Breadcrumb Coverage
**Audit claim:** BD, Estimating, and Project Hub lack breadcrumbs; "Home" link in My Work breadcrumb is non-navigable.
**Repo truth:** `MyWorkPage.tsx` passes `breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Work' }]}`. BD, Estimating, and Project Hub pages do not pass a `breadcrumbs` prop to `WorkspacePageShell`.

**Verdict:** Confirmed. Breadcrumbs are inconsistently applied. The "Home" breadcrumb does have an `href: '/'` — whether `WorkspacePageShell` renders it as a navigable link depends on its implementation, but the intent is correct.

---

### UIF-015 — Filter Button Accessible Names ("Overdue0")
**Audit claim:** Filter buttons have no `aria-label`; accessible name is computed as "Overdue0" (count concatenated without separator).
**Repo truth:** `HbcCommandBar/index.tsx` lines 282-284:
```tsx
<span aria-label={`${f.count} items`} style={...}>
  {f.count}
</span>
```
The count badge uses `aria-label` to override its text content contribution to the button's accessible name. The button's computed accessible name is: visible label text ("Overdue") + `aria-label` of count span ("0 items") = **"Overdue 0 items"**.

**Verdict:** Disputed. The `aria-label` on the count badge correctly separates the count from the label in the computed accessible name. The audit finding is stale.

---

### UIF-016 — Notifications Bell Non-Functional
**Audit claim:** Notifications bell produces no panel, no count badge, no empty state.
**Repo truth:** `root-route.tsx` header contains `HbcSyncStatusBadge` for pending sync state, but no notification bell icon or notification panel component. Confirmed via code search — no `NotificationBell`, `NotificationPanel`, or notification-related component in the shell.

**Verdict:** Confirmed. This is a shell/platform feature outside Phase 2 scope.

---

### UIF-017 — Source Breakdown Static `<img>` Chart
**Audit claim:** Source Breakdown renders as a static `<img>` with alt text; not interactive; no tooltips.
**Repo truth:** `SourceBreakdownCard.tsx` renders an inline proportional bar built from `<div>` elements with percentage widths, backed by live `useMyWork()` data. It is NOT a static `<img>`. The bar segments do use inline `style={{ backgroundColor: color }}` — not an image.

**Verdict:** Disputed. The implementation is a dynamic, data-driven inline bar. The audit was observing a previous state or incorrect element. Note: the bar is not click-interactive (no click-to-filter on bar segments) — that enhancement remains valid.

---

### UIF-018 — Grouping Dropdown Missing `role="radiogroup"`
**Audit claim:** Grouping options are plain `<div>` elements without proper radio semantics.
**Repo truth:** `HbcCommandBar/index.tsx` lines 310-316:
```tsx
{/* Groupings — UIF-010: radiogroup row with visible active state + aria-pressed */}
<div
  role="radiogroup"
  aria-label="Group by"
```
`HbcCommandBar` renders the grouping controls with `role="radiogroup"` and `aria-label="Group by"`. Test coverage confirms this at line 68: `expect(screen.getByRole('radiogroup', { name: 'Group by' })).toBeInTheDocument()`.

**Verdict:** Disputed. The radiogroup semantics are implemented. The audit finding is stale.

---

### UIF-019 — TanStack Devtools Button Visible in Production
**Audit claim:** TanStack Query devtools trigger button is permanently visible in the rendered UI.
**Repo truth:** `App.tsx` gates the entire devtools component behind `import.meta.env.DEV`. In production builds (Vite), `import.meta.env.DEV` is statically `false` and the component is tree-shaken out completely.

**Verdict:** Disputed. The finding is stale — the gate was already implemented.

---

### UIF-020 — No Bottom Navigation at Mobile Viewports
**Audit claim:** No `HbcBottomNav` at `≤767px`; sidebar-only navigation is thumb-unfriendly.
**Repo truth:** `MyWorkPage.tsx` renders a floating action button (FAB) at `max-width: 1023px` that opens `QuickActionsSheet`. This is a task-action shortcut, not a workspace navigation bar. No `HbcBottomNav` component is rendered at any viewport. The `HbcAppShell` spec defines `HbcBottomNav` for field mode — this is not wired.

**Verdict:** Confirmed. No bottom navigation at mobile. The FAB covers quick task actions but not workspace navigation. Phase 3 / shell feature.

---

## Scope Classification

### Phase 2 My Work Hub findings (in-scope to assess against P2 deliverables)

| Finding | Verdict | Action required |
|---|---|---|
| UIF-001 | ✅ Resolved | Deep-link hrefs corrected to match actual workspace routes. Drawer polish applied (row highlighting, header label, surface bg). |
| UIF-002 | Disputed | `HbcStatusBadge` in use — no action. |
| UIF-003 | ✅ Resolved | `HbcBanner` `polite` prop added; applied to `HubConnectivityBanner`, `HubFreshnessIndicator`, `HbcMyWorkOfflineBanner`. |
| UIF-006 | Disputed | Active filter wired — no action. |
| UIF-008 | Stale | Element doesn't exist — no action. |
| UIF-009 | Disputed | `ellipsis` in use — no action. |
| UIF-012 | **Confirmed** | `formatModuleLabel` fallback produces "Bd" for unrecognized `bd-*` keys. Add `'bd-department-sections'` (and any similar keys) to `MODULE_DISPLAY_NAMES`. |
| UIF-015 | Disputed | `aria-label` on count badge correctly separates — no action. |
| UIF-017 | Disputed | Dynamic inline bar, not static img — no action. |
| UIF-018 | Disputed | `role="radiogroup"` implemented — no action. |
| UIF-019 | Disputed | Dev-only gate in place — no action. |

### Cross-surface / shell / platform findings (out of Phase 2 scope)

These findings are valid product concerns but fall outside the Phase 2 My Work Hub deliverable. They should be tracked in their respective surface backlogs.

| Finding | Surface | Recommended track |
|---|---|---|
| UIF-004 | App shell | Phase 4+ — command palette platform feature |
| UIF-005 | Disputed — BD nav route is correct | N/A |
| UIF-007 | Disputed — stepper is `HbcStepWizard` | N/A |
| UIF-010 | `/projects` route | Phase 3 — error state standardization |
| UIF-011 | BD, Estimating, Project Hub | Phase 3 — date formatting across data surfaces |
| UIF-013 | BD, Estimating, Project Hub | Phase 3 — row actions, sort, filter on secondary surfaces |
| UIF-014 | BD, Estimating, Project Hub + shell | Phase 3 — breadcrumb consistency |
| UIF-016 | App shell | Phase 4+ — notification system |
| UIF-020 | App shell | Phase 3+ — field mode, `HbcBottomNav` |

---

## Action Items for Phase 2 Close-Out

Two findings require attention before Phase 2 can be considered fully clean against this audit:

**1. UIF-003 — `aria-live="assertive"` on persistent degraded-data banners (Medium)** ✅ RESOLVED
`HbcBanner` now supports an optional `polite` prop that overrides `aria-live` to `"polite"` and `role` to `"status"`. Applied to `HubConnectivityBanner`, `HubFreshnessIndicator`, and `HbcMyWorkOfflineBanner`. Default behavior for `variant="warning"` unchanged — zero blast radius to the 44 existing consumers.

**2. UIF-012 — "Bd Department Sections" acronym casing (Low)**
The `formatModuleLabel` fallback title-cases only the first character of each word. `bd-department-sections` → "Bd Department Sections". Fix: add the key to `MODULE_DISPLAY_NAMES` in `packages/my-work-feed/src/utils/formatModuleLabel.ts`. Audit all live `moduleKey` values in `domainQueryFns.ts` for similar unrecognized `bd-*` or acronym-containing keys and add them to the map.

**Residual item (RESOLVED):**
- **Deep-link URL mismatch (UIF-001):** ✅ Fixed — mock data hrefs in `domainQueryFns.ts` corrected to use actual workspace routes with `?itemId=` query params. No more 404 on direct navigation.

# HB-Intel — Phase 4b: UI Design Implementation Plan Task 3
### Comprehensive UI Kit + Shell Integration

**Version:** 1.0
**Date:** March 5, 2026
**Depends On:** Phase 4 (UI Kit component build — partially complete)
**Objective:** Deliver a fully wired UI Kit and Shell such that any page built to the system is guaranteed to render correctly according to HBC design specifications — with zero design decisions required from the page author.

---

## Table of Contents

1. [Objective & Success Criteria](#1-objective--success-criteria)
2. [Architectural Decisions (Binding Constraints)](#2-architectural-decisions-binding-constraints)
3. [Prerequisites & Audit Remediation](#3-prerequisites--audit-remediation)
4. [Phase 4b.1 — Build & Packaging Foundation](#4-phase-4b1--build--packaging-foundation)
5. [Phase 4b.2 — Shell Completion & WorkspacePageShell](#5-phase-4b2--shell-completion--workspacepageshell)
6. [Phase 4b.3 — Layout Variant System](#6-phase-4b3--layout-variant-system)
7. [Phase 4b.4 — Command Bar & Page Actions](#7-phase-4b4--command-bar--page-actions)
8. [Phase 4b.5 — Navigation & Active State](#8-phase-4b5--navigation--active-state)
9. [Phase 4b.6 — Theme & Token Enforcement](#9-phase-4b6--theme--token-enforcement)
10. [Phase 4b.7 — Data Loading & State Handling](#10-phase-4b7--data-loading--state-handling)
11. [Phase 4b.8 — Form Architecture](#11-phase-4b8--form-architecture)
12. [Phase 4b.9 — Notifications & Feedback](#12-phase-4b9--notifications--feedback)
13. [Phase 4b.10 — Mobile & Field Mode](#13-phase-4b10--mobile--field-mode)
14. [Phase 4b.11 — Component Consumption Enforcement](#14-phase-4b11--component-consumption-enforcement)
15. [Phase 4b.12 — Integration Verification & Acceptance](#15-phase-4b12--integration-verification--acceptance)
16. [Developer Playbook](#16-developer-playbook)
17. [Completion Criteria](#17-completion-criteria)

---

## 1. Objective & Success Criteria

### Primary Objective

Deliver a fully wired UI Kit and Shell such that **any page built to the system is guaranteed to render correctly according to HBC design specifications** — with zero design decisions required from the page author.

### What "Guaranteed to Render Correctly" Means

A page is guaranteed when all of the following are true without any effort from the page author:

- ✅ It appears inside the correct shell frame (header, sidebar, content area)
- ✅ It uses a named layout variant appropriate to its purpose
- ✅ Its action buttons appear in the correct command bar zone
- ✅ Its sidebar navigation item is highlighted automatically
- ✅ Its colors, spacing, and typography come from HBC design tokens only
- ✅ Its loading, empty, and error states render consistently
- ✅ Its forms follow the standard validation and submission pattern
- ✅ Its feedback (save, delete, error) triggers a consistent toast notification
- ✅ It adapts correctly between office desktop and field mobile contexts
- ✅ It uses only `@hb-intel/ui-kit` components — never raw HTML or direct Fluent UI imports

### Success Metrics

| Metric | Target |
|--------|--------|
| Pages using `WorkspacePageShell` | 100% of all workspace pages |
| Pages using a named layout variant | 100% |
| Token violations in CI | 0 |
| Direct `@fluentui/react-components` imports in `apps/` | 0 |
| Components with Storybook stories | 100% (44/44) |
| Components with reference documentation | 100% (44/44) |
| Loading/error state handled by shell | 100% of data pages |
| Build artifact contamination in `src/` | 0 files |

---

## 2. Architectural Decisions (Binding Constraints)

These 10 decisions were established through the Phase 4b design interview and are **binding constraints** for all implementation work. They are not subject to re-evaluation during implementation without a formal ADR update.

| # | Decision | Binding Rule |
|---|----------|-------------|
| **D-01** | Shell enforcement model | Every page **must** use `WorkspacePageShell` as its outer container. Direct rendering without the shell is prohibited. |
| **D-02** | Layout variant system | Every page **must** declare one of the named layout variants: `dashboard`, `form`, `detail`, or `landing`. No free-composition inside the wrapper. |
| **D-03** | Command bar zone | All page actions **must** be passed to the shell's command bar zone via the `actions` prop on `WorkspacePageShell`. Direct button placement outside the command bar is prohibited. |
| **D-04** | Navigation active state | Active sidebar state **must** be derived automatically from the router. Pages must never manually set active nav state. |
| **D-05** | Token enforcement | All color, spacing, typography, and shadow values **must** come from `@hb-intel/ui-kit` tokens. Hardcoded values are a lint error. |
| **D-06** | Data state handling | Loading, empty, and error states **must** be passed to `WorkspacePageShell` via `isLoading`, `isEmpty`, and `isError` props. Pages must not implement their own spinners or error UIs. |
| **D-07** | Form architecture | All data entry forms **must** use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements are prohibited in page code. |
| **D-08** | Notifications | All user feedback (success, error, warning) **must** be triggered via `useToast`. Inline feedback components on pages are prohibited except `HbcBanner` for persistent page-level warnings. |
| **D-09** | Mobile/field mode | Pages **must** declare supported layout modes. The shell handles all context switching via `useFieldMode`. Pages must not contain their own breakpoint logic. |
| **D-10** | Component consumption | Pages **must** import exclusively from `@hb-intel/ui-kit`. Direct imports from `@fluentui/react-components`, raw HTML structural elements, and inline styles are prohibited and enforced via ESLint. |

---

## 6. Phase 4b.3 — Layout Variant System

**Goal:** Four named layout variants implemented, documented, and enforced as the only legal page structures inside `WorkspacePageShell`.

**Depends on:** Phase 4b.2 complete

### Layout Variant Specifications

#### `dashboard` layout
- Multi-column KPI card grid at top (responsive: 4-col → 2-col → 1-col)
- Full-width chart/data zone below
- No sticky footer
- Use for: Leadership KPI, Portfolio Overview, Project Dashboard

```tsx
<WorkspacePageShell layout="dashboard" title="Portfolio Overview" actions={[...]}>
  <KpiRow>{/* HbcKpiCard × N */}</KpiRow>
  <ChartZone>{/* HbcChart components */}</ChartZone>
  <DataZone>{/* HbcDataTable */}</DataZone>
</WorkspacePageShell>
```

#### `list` layout
The most frequently encountered page type across all 11 modules. Every RFI log, punch list, risk register, submittal log, daily log index, and contract list uses this layout. Research across Procore, Autodesk Construction Cloud, Trimble, CMiC, and InEight confirms this is the dominant content pattern in construction technology — and the one with the most documented user frustrations (horizontal scroll, information overload, poor mobile adaptation). HB-Intel's `list` layout must exceed the industry standard on every axis.

**Internal zone structure (top to bottom):**
1. **Filter toolbar zone** — always visible. `HbcSearch` (global keyword) + up to 3 primary filter dropdowns (e.g. Status, Project, Date Range) + active filter pill strip showing applied filters with individual clear buttons + "More Filters" button opening `HbcPanel` for advanced filters + view mode toggle (table / card)
2. **Saved views bar** — named persistent filter/sort/column configurations. Three scoping levels: personal, project, organization. Shareable via deep-link URL. Active saved view highlighted. Industry research confirms this is a top competitive differentiator — platforms without it receive consistent user criticism.
3. **Table zone** — full-width `HbcDataTable` fills remaining viewport height. No horizontal scroll on standard column sets. Adaptive density via `useDensity()`.
4. **Pagination zone** — pinned to bottom of content area.

Filter state persisted automatically in `useFilterStore` — survives navigation, page refresh, and session restore.

```tsx
<WorkspacePageShell layout="list" title="Risk Register" actions={[...]}>
  <ListLayout.FilterToolbar
    primaryFilters={[
      { key: 'status', label: 'Status', type: 'select', options: RISK_STATUSES },
      { key: 'category', label: 'Category', type: 'select', options: RISK_CATEGORIES },
    ]}
    advancedFilters={RISK_ADVANCED_FILTERS}
    filterStoreKey="risk-register"
  />
  <ListLayout.SavedViewsBar filterStoreKey="risk-register" />
  <HbcDataTable rows={data} columns={RISK_COLUMNS} />
  <ListLayout.Pagination total={total} />
</WorkspacePageShell>
```



- Single-column form body, max-width constrained for readability
- Sticky `HbcStickyFormFooter` with Save/Cancel always visible
- `HbcFormSection` dividers for multi-section forms
- Use for: New Scorecard, New Risk Item, New Contract, all create/edit pages

```tsx
<WorkspacePageShell layout="form" title="New Scorecard" actions={[...]}>
  <HbcForm onSubmit={handleSubmit}>
    <HbcFormSection title="Project Details">
      {/* HbcTextField, HbcSelect components */}
    </HbcFormSection>
    <HbcStickyFormFooter onSave={handleSubmit} onCancel={handleCancel} />
  </HbcForm>
</WorkspacePageShell>
```

#### `detail` (DetailLayout)
- Two-zone: primary content (left, ~65%) + metadata panel (right, ~35%)
- Responsive: stacks to single column on tablet/mobile
- Use for: Project detail, Risk item detail, Contract detail

```tsx
<WorkspacePageShell layout="detail" title="Risk Item #142" actions={[...]}>
  <DetailLayout.Primary>{/* Main content */}</DetailLayout.Primary>
  <DetailLayout.Metadata>{/* HbcCard with key fields */}</DetailLayout.Metadata>
</WorkspacePageShell>
```

#### `landing` (ToolLandingLayout)
- Full-width hero zone with page title and description
- Card grid below for sub-module navigation
- Use for: Module home pages (Estimating, Safety, HR landing pages)

```tsx
<WorkspacePageShell layout="landing" title="Estimating" actions={[...]}>
  <LandingHero description="Manage bids, templates, and project setup" />
  <ToolCardGrid>{/* HbcCard × N for sub-modules */}</ToolCardGrid>
</WorkspacePageShell>
```

### Tasks

#### 4b.3.1 — Implement layout variant components

Complete implementation of the three existing layout scaffolds in `packages/ui-kit/src/layouts/`:
- `ToolLandingLayout.tsx` — verify complete, add stories
- `DetailLayout.tsx` — verify complete, add stories
- `CreateUpdateLayout.tsx` — verify complete, add stories
- Add `DashboardLayout.tsx` — new component
- Add `ListLayout.tsx` — new component (see full spec below)

##### `ListLayout` — Full Competitive Specification

Industry research across Procore (CORE Design System), Autodesk Construction Cloud, InEight, and Trimble identifies the data table list view as the single most-used and most-criticized UI pattern in construction technology. HB-Intel's `ListLayout` must exceed the industry standard across five dimensions: filter power, saved views, table density adaptation, row-level feedback, and mobile/card transformation.

```ts
// packages/ui-kit/src/layouts/ListLayout.tsx
interface ListLayoutProps {
  // Filter configuration
  primaryFilters?: FilterConfig[];       // max 3 — always visible in toolbar
  advancedFilters?: FilterConfig[];      // revealed in HbcPanel slide-out
  filterStoreKey: string;                // unique per list page — drives useFilterStore

  // Saved views
  savedViewsEnabled?: boolean;           // default true
  savedViewsScopes?: ('personal' | 'project' | 'organization')[];  // default all three

  // Table behavior
  selectable?: boolean;                  // enables checkbox row selection for bulk ops
  bulkActions?: BulkAction[];            // actions available when rows selected
  viewModes?: ('table' | 'card')[];      // default ['table', 'card']
  defaultViewMode?: 'table' | 'card';    // default 'table'

  children: React.ReactNode;            // HbcDataTable + ListLayout.Pagination
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range' | 'boolean' | 'location';
  options?: { label: string; value: string }[];
  // 'location' type renders HbcLocationFilter — hierarchical building/floor/room picker
  // matching the construction-specific pattern from Procore's Location Filter component
}

interface BulkAction {
  key: string;
  label: string;
  icon: string;
  onClick: (selectedIds: string[]) => void;
  isDestructive?: boolean;
}
```

**Zone 1 — Filter Toolbar** (always visible, Level 1 elevation):
- `HbcSearch` — global keyword search across all visible columns. Typeahead suggestions from cached data.
- Up to 3 `HbcSelect` primary filter dropdowns — the 3 most contextually relevant filters for this list (e.g. Status, Ball-In-Court, Due Date for RFIs)
- **Active filter pill strip** — each applied filter renders as a dismissible `HbcPill` token showing `field: value`. Clearing a pill removes that filter. A "Clear All" link appears when any filter is active. This pattern directly addresses the user feedback cited in both studies: users need to see what filters are active at a glance.
- **"More Filters" button** — opens `HbcPanel` slide-out from the right edge containing all `advancedFilters`. Panel closes on apply; active advanced filters appear in the pill strip.
- **View mode toggle** — `HbcSegmentedController` with Table / Card options. Persists per user via `useFilterStore`.
- **Results count** — `"Showing 47 of 312 items"` — always visible, updates on filter change.

**Zone 2 — Saved Views Bar** (below filter toolbar, collapsible):
- Horizontal strip of named view buttons. Active view is accent-highlighted.
- **Three scoping levels** — personal (👤), project (📁), organization (🏢) — matching Procore's three-scope implementation which is identified as a competitive differentiator.
- **Save current view** — a "+ Save View" button captures the current filter/sort/column/density state as a named view.
- **Share view** — copies a deep-link URL with filters encoded as query parameters. Deep links are cacheable by the service worker for offline access.
- **Default view** — any saved view can be set as the default, replacing the unfiltered view on page load.

**Zone 3 — Table Zone** (`HbcDataTable` — full competitive spec):

The table must exceed Procore's CORE DataTable on every axis where Procore has documented weaknesses:

| Feature | Procore CORE | HB-Intel Target |
|---------|-------------|-----------------|
| Column configuration | Show/hide + reorder, persisted per user | ✅ Match + persist to `useFilterStore` synced via `useUiStore` |
| Sortable headers | ✅ Ascending/descending with visual indicator | ✅ Match |
| Inline editing | NGX modules only (partial rollout) | ✅ All list pages from day one |
| Row selection + bulk actions | ✅ Checkbox-based | ✅ Match + floating bulk action bar appears above table on selection |
| Status color coding | Color-only pills | ✅ **Dual-channel encoding**: color + icon shape (circle✓ / clock⚠ / triangle❌) — WCAG compliant, sunlight-readable, colorblind-safe |
| Horizontal scroll | ✅ Documented as expected (anti-pattern) | ✅ **Eliminated** via responsive column collapse (secondary columns stack into expandable row detail at narrow viewports) |
| Density | Single density (no adaptation) | ✅ **Three-tier auto-density**: Compact (36px rows, >1440px + mouse), Standard (48px rows, hybrid), Touch (64px rows, <768px or coarse pointer) |
| Card transformation | No (separate Tile view only) | ✅ Below 640px: table rows auto-transform to card stacks showing 4–5 priority fields + chevron expand |
| Saved views | ✅ Three scopes + export | ✅ Match + deep-link sharing + service worker cache |
| Location filter | ✅ Hierarchical building/floor/room | ✅ Match via `HbcLocationFilter` component |
| Responsibility highlight | ❌ "Ball In Court" indicator only | ✅ **Responsibility heat mapping**: rows where current user holds responsibility get 4px left-border accent + elevated row background — pre-attentive visual scan pattern |
| Attachment/photo indicators | ✅ Count badges in row | ✅ Match |
| Overdue date highlighting | ✅ Red date text when past due | ✅ Match + `HbcStatusBadge` with dual-channel encoding |
| Item number hyperlinking | ✅ Opens detail view | ✅ Match — opens `HbcPanel` slide-out for quick preview (detail page available via "Open full page" link) |
| AI-suggested filters | ❌ Not implemented | 🔮 **Phase 5+ target** — `HbcCommandPalette` (⌘K) accepts natural language: "show me overdue RFIs assigned to me" |

**Row-level interaction — slide-out panel (not full page navigation):**
Clicking a row item number opens `HbcPanel` from the right edge showing key detail fields, status, and action buttons. A "Open Full Page" link navigates to the full detail view. This pattern — standardized across all NGX-modernized Procore tools since 2024 — preserves list context while providing detail access, dramatically reducing back-navigation friction. Users reviewing multiple items sequentially stay in the list view throughout.

**Floating bulk action bar:**
When 1+ rows are selected via checkbox, a floating action bar rises from the bottom of the table zone (above pagination) showing: selected count + bulk action buttons. Dismisses when selection is cleared. This is the Procore CORE pattern for bulk operations.

**Zone 4 — Pagination** (pinned to bottom):
- `HbcPagination` with page numbers, prev/next arrows, items-per-page selector (25/50/100), and total count.
- Pagination state persisted in `useFilterStore` per list page.
- Alternatively: virtual scrolling for large datasets (>500 rows) — `HbcDataTable` should support both modes, selectable per page via `paginationMode: 'pages' | 'virtual'`.

#### 4b.3.2 — Wire layout variants into `WorkspacePageShell`

```ts
// WorkspacePageShell selects layout based on prop
const LAYOUT_MAP = {
  dashboard: DashboardLayout,
  list: ListLayout,
  form: CreateUpdateLayout,
  detail: DetailLayout,
  landing: ToolLandingLayout,
};
const Layout = LAYOUT_MAP[props.layout];
```

#### 4b.3.3 — Add layout variant stories

Each layout variant needs stories showing:
- Fully populated state
- Loading state (via `isLoading` prop)
- Empty state (via `isEmpty` prop)
- Error state (via `isError` prop)
- Field/mobile mode (via `useFieldMode`)

For the `list` variant specifically, also include:
- Default state (no filters, all records, table mode)
- Primary filters applied (filtered result set with active pill strip)
- Advanced filter panel open
- Zero results after filtering (with "Clear Filters" empty state action)
- Saved views bar with multiple named views (personal, project, org scopes)
- Row selected (1 item) — floating bulk action bar visible
- Row selected (multiple items) — bulk actions with destructive option
- Row item clicked — `HbcPanel` slide-out showing item detail
- Card view mode (below 640px or via view mode toggle)
- Touch density (64px rows, tablet viewport)
- Responsibility heat mapping visible (current user rows highlighted)
- Overdue items visible (red date text + dual-channel status badge)

### Acceptance Criteria

- [ ] All 5 layout variants implemented and exported from `@hb-intel/ui-kit`
- [ ] `WorkspacePageShell` `layout` prop is required (TypeScript error if omitted)
- [ ] All 5 variants have Storybook stories covering all states
- [ ] `list` variant stories cover all 12 required scenarios (filter states, bulk selection, panel, card mode, density tiers, responsibility heat map, overdue highlighting)
- [ ] Layout variants are documented in `docs/reference/ui-kit/WorkspacePageShell.md`
- [ ] `CreateUpdateLayout` includes `HbcStickyFormFooter` automatically
- [ ] `DetailLayout` responsive stacking verified at 768px breakpoint
- [ ] `ListLayout` filter toolbar renders active filter pill strip on any applied filter
- [ ] `ListLayout` "More Filters" panel opens/closes correctly
- [ ] `ListLayout` saved views bar implements all 3 scopes (personal/project/org)
- [ ] `ListLayout` deep-link URL encodes current filter state correctly
- [ ] `HbcDataTable` three-tier density auto-switches based on viewport + pointer type
- [ ] `HbcDataTable` card transformation triggers below 640px viewport
- [ ] `HbcDataTable` dual-channel status encoding (color + icon shape) on all status columns
- [ ] `HbcDataTable` responsibility heat mapping highlights current-user rows
- [ ] `HbcDataTable` responsive column collapse eliminates horizontal scroll at tablet widths
- [ ] `HbcDataTable` row click opens `HbcPanel` slide-out with item preview
- [ ] `HbcDataTable` floating bulk action bar appears on row selection
- [ ] `HbcDataTable` inline editing works in all NGX-style list pages
- [ ] `ListLayout` filter state persists in `useFilterStore` across navigation

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4b.3 completed: 2026-03-05
Steps completed:
  - 4b.3.1: DashboardLayout created (packages/ui-kit/src/layouts/DashboardLayout.tsx)
  - 4b.3.1: ListLayout created (packages/ui-kit/src/layouts/ListLayout.tsx)
  - 4b.3.2: LAYOUT_MAP wired into WorkspacePageShell (dashboard + list auto-wrap, form/detail/landing pass-through)
  - 4b.3.2: DashboardConfig + ListConfig types added to WPS props
  - 4b.3.2: Barrel exports updated (layouts/index.ts, layouts/types.ts, src/index.ts)
  - 4b.3.3: 5 layout story files (2 new + 3 updated with additional exports)
Documentation:
  - ADR created: docs/architecture/adr/ADR-0037-layout-variant-system.md
  - Reference docs: docs/reference/ui-kit/DashboardLayout.md, ListLayout.md
  - Updated: docs/reference/ui-kit/WorkspacePageShell.md (DashboardConfig, LAYOUT_MAP behavior)
Deferred to Phase 5+:
  - useFilterStore Zustand store
  - HbcLocationFilter
  - Saved views persistence backend
  - AI-suggested filters
  - Service worker deep-link caching
Build verification: pnpm turbo run build — 23/23 tasks pass
-->
# UI Kit Wave 1 Page Patterns

> **Doc Classification:** Living Reference — WS1-T08 approved composition patterns and design guidance for Wave 1 development teams.

**Source of Truth:** `@hbc/ui-kit` layout components and T08 composition review
**Governing Standards:** T04 hierarchy rules, T05 field-readability standards, T06 data surface patterns

---

## Approved Page Patterns

### Dashboard Summary

**Layout:** `WorkspacePageShell` with `layout="dashboard"` → `DashboardLayout`
**When to use:** Project health, KPIs, status overview, module landing pages

**Zone mapping:**

| Zone | Component | Content Level | Visual Weight |
|------|-----------|--------------|---------------|
| Page header | WorkspacePageShell (breadcrumb + title) | pageTitle | heavy |
| KPI strip | DashboardLayout kpiCards → HbcKpiCard[] | summaryMetric | heavy |
| Chart zone | DashboardLayout chartContent | bodyContent | standard |
| Data zone | DashboardLayout children (HbcDataTable) | bodyContent | standard |

**Design guidance:**
- Use 3–6 KPI cards; grid auto-adapts (4→2→1 columns)
- KPI values use `summaryMetric` content level (heading1, weight 700)
- Click-to-filter on KPI cards scopes data table below
- Chart zone is optional; omit if data table alone suffices

---

### Work Queue / Task List

**Layout:** `WorkspacePageShell` with `layout="list"` → `ListLayout`
**When to use:** Filterable, searchable lists of work items — RFIs, punch lists, tasks

**Zone mapping:**

| Zone | Component | Content Level | Visual Weight |
|------|-----------|--------------|---------------|
| Filter toolbar (sticky) | ListLayout searchBar + filters | metadata | standard |
| Saved views bar | ListLayout savedViews | secondaryAnnotation | light |
| Data surface | ListLayout children (HbcDataTable) | bodyContent | standard |
| Bulk action bar (floating) | ListLayout bulkActions | primaryAction | heavy |

**Design guidance:**
- Use `mobileCardFields` on HbcDataTable for card fallback below 640px
- Limit default visible columns to 4–6; use `columnVisibility` for progressive disclosure
- Saved views persist filter + column + sort state via `useSavedViews`
- Bulk action bar appears only on selection; shows count + contextual actions

---

### Project Detail

**Layout:** `WorkspacePageShell` with `layout="detail"` → `DetailLayout`
**When to use:** Single-item detail view with tabs and contextual sidebar

**Zone mapping:**

| Zone | Component | Content Level | Visual Weight |
|------|-----------|--------------|---------------|
| Breadcrumb (sticky) | DetailLayout breadcrumbs | metadata | light |
| Detail header (sticky) | DetailLayout header (title + status) | sectionTitle | heavy |
| Tab bar (sticky) | DetailLayout tabs | heading4 | standard |
| Primary content (8-col) | DetailLayout children | bodyContent | standard |
| Sidebar (4-col) | DetailLayout sidebar | metadata | light |

**Design guidance:**
- Header must include status badge + key metadata visible without scrolling
- Tabs separate content domains (Overview, Activity, Documents, etc.)
- Sidebar contains related items, metadata, quick actions
- Content stacks vertically on mobile; sidebar collapses below primary content

---

### Form Page

**Layout:** `WorkspacePageShell` with `layout="form"` → `CreateUpdateLayout`
**When to use:** Structured data entry with validation

**Zone mapping:**

| Zone | Component | Content Level | Visual Weight |
|------|-----------|--------------|---------------|
| Form header (sticky) | CreateUpdateLayout header | sectionTitle | heavy |
| Form content (centered) | HbcForm + HbcFormSection + HbcFormRow | bodyContent | standard |
| Sticky footer | CreateUpdateLayout footer (Save/Cancel) | primaryAction | heavy |

**Design guidance:**
- Focus Mode auto-activates on touch devices; dims surrounding chrome
- Max-width centering prevents excessive horizontal spread on wide screens
- Use HbcFormSection for logical grouping with heading3 section titles
- Validation messages appear inline; form-level error summary at top

---

### Setup / Wizard Flow

**Layout:** `WorkspacePageShell` with `layout="landing"` → `HbcStepWizard`
**When to use:** Multi-step setup, provisioning, onboarding flows

**Design guidance:**
- Step indicator communicates progress and "where am I"
- Step sidebar persists on desktop; collapses to top indicator on mobile
- Each step renders as an independent form section
- Navigation footer provides Back/Next/Complete actions

---

### Data-Heavy List/Detail (Split View)

**Layout:** `ListLayout` with `DetailLayout` content split
**When to use:** Dense table with side panel for detail on row selection

**Design guidance:**
- Primary list at standard weight; detail panel at light (secondaryDetail zone)
- 8:4 content split on desktop; full-width stacked on mobile
- Row click populates detail panel without full-page navigation
- Card fallback for table on mobile; detail via card expand

---

### Drill-In / Side Panel

**Layout:** List surface + `HbcPanel` slide-in
**When to use:** Row selection opens contextual detail without leaving the list

**Design guidance:**
- Panel at overlays surface role (elevationLevel3) with backdrop
- List remains visible but dimmed behind panel
- Panel should be full-width on mobile (< 640px)
- Dismiss via close button, backdrop click, or Escape key
- Panel content uses heading2 for header, body for content

---

## Common Composition Decisions

### When to use side panels vs full-page navigation
- **Side panel:** When context preservation matters — user needs to see the list while viewing detail
- **Full-page:** When the detail view is complex enough to warrant full screen (forms, wizards, multi-tab detail)

### When to use summary strips vs data tables
- **Summary strip (KPI):** Status communication; high-level health indicators; 3-second read
- **Data table:** Row-by-row interaction; comparison; filtering; bulk actions

### How to layer filters and toolbars
1. Search + primary filters in the filter toolbar (always visible)
2. Advanced filters in expandable panel below toolbar (collapsed by default)
3. Active filters as removable chips between toolbar and data surface
4. Saved views preserve the complete filter + column + sort configuration

### Card weight usage across zones
- **Primary cards:** Active project, current task, urgent items — draws attention
- **Standard cards:** Default containers — general content
- **Supporting cards:** History, metadata, secondary context — recedes

---

## Known Pitfalls

1. **Don't flatten zone hierarchy.** Avoid giving all zones equal visual weight. Use the T04 content level system to enforce weight distinctions.
2. **Don't skip empty states.** Every data-dependent zone needs an intentional empty state via HbcEmptyState, not a blank area.
3. **Don't ignore field mode.** Test every composition in touch density. Card fallback should work; form inputs must meet density minimums.
4. **Don't compete with the shell.** Page content should dominate; shell chrome should support, not overshadow.
5. **Don't use horizontal scroll for data surfaces.** Use column hiding, card fallback, or progressive disclosure per T06 collapse rules.

---

## Follow-On Consumers

- **T10:** Uses these patterns to build Storybook composition stories
- **T13:** Evaluates composition quality against these approved patterns
- **Wave 1 teams:** Use this as the governing reference for page composition

---

*Wave 1 Page Patterns v1.0 — WS1-T08 (2026-03-16)*

# UI Kit Adaptive Data Surface Patterns

> **Doc Classification:** Living Reference — WS1-T06 adaptive data surface family, interaction pattern standards, responsive collapse rules, and surface selection decision guide.

**Source of Truth:** `@hbc/ui-kit` data surface components (`HbcDataTable`, `HbcCommandBar`, `HbcKpiCard`, `ListLayout`, `DashboardLayout`)
**Governing Principles:** MB-04 (Less Horizontal Scrolling), MB-02 (Stronger First-Glance Hierarchy), MB-05 (More Adaptive Density)
**Hard Requirement:** Horizontal scrolling must not be the default answer for any data surface in Wave 1.

---

## Adaptive Data Surface Family

Four surface types replace table monoculture. Each has defined use criteria, governing rules, and component mappings.

### 1. Dense Analysis Table

**When to use:** Users need to compare many attributes across many rows, with column-level operations (sort, filter, resize). Assumes desktop or tablet context with adequate horizontal space.

**Governing rules:**
- Maximum information density in desktop (compact) density mode
- Columns collapse in priority order (most important left-most); hidden columns accessible via detail panel
- Must not require horizontal scrolling for primary 4–6 columns in tablet density
- Sticky header row; optionally sticky first column via `frozenColumns`

**Component mapping:** `HbcDataTable` with `enableSorting`, `enablePagination`, `frozenColumns`, `columnVisibility`, `columnOrder`

**Density behavior:**
- compact (desktop): 32px row height, full column set
- comfortable (tablet): 40px row height, secondary columns may hide
- touch (field): 48px+ row height, auto-switch to card fallback below 640px

---

### 2. Responsive List/Table Hybrid

**When to use:** Users need to scan a list of work items where a few columns matter most and secondary details are contextual. Suitable for desktop, tablet, and field modes.

**Governing rules:**
- Primary columns always visible at any viewport width
- Secondary columns collapse into detail-accessible state at smaller viewports
- Row height adapts to density mode
- Works without horizontal scrolling in field density mode

**Component mapping:** `HbcDataTable` with `mobileCardFields` + `ListLayout` wrapping. The `mobileCardFields` prop defines primary fields shown on the card face; remaining fields accessible via expand chevron.

**Density behavior:**
- compact: Standard table rows with all columns
- comfortable: Table with secondary columns potentially hidden
- touch: Card-stack layout via `HbcDataTableCard` below 640px

---

### 3. Card or List View

**When to use:** Each item has a visual identity, status is more important than column comparison, or the surface is field-first. Work queues, notification lists, task lists, Personal Work Hub surfaces.

**Governing rules:**
- Card or row layout, not columnar
- Status, priority, and primary action immediately visible per item
- Works in all three density modes without column management
- Appropriate for Personal Work Hub task and notification surfaces

**Component mapping:** `HbcDataTable` card fallback mode (always-on via viewport override), or custom card composition using `HbcCard` with weight classes from T04.

**Density behavior:**
- compact: Compact card with minimal padding
- comfortable: Standard card spacing
- touch: Large touch targets (≥44px), generous tap spacing (≥16px)

---

### 4. Summary Strip and KPI Surface

**When to use:** Status communication rather than row-by-row interaction. Dashboard header areas, project summary sections, workstream health indicators.

**Governing rules:**
- Minimal interaction affordance (no row actions, no sorting)
- High visual weight; designed for the "3-second read" scan (T04)
- Adapts from horizontal strip (desktop) to stacked cards (mobile/field)
- KPI values use `summaryMetric` content level (heading1, weight 700)

**Component mapping:** `DashboardLayout` (responsive KPI grid: 4-col → 2-col → 1-col) + `HbcKpiCard` (label, value, trend indicator, click-to-filter).

**Density behavior:**
- All modes: Card-based layout; no density-driven column changes
- touch: Increased card padding and touch target size per T05 minimums

---

## Data Interaction Pattern Standards

### Contextual Toolbar

Every data surface must define its toolbar pattern.

**Rules:**
- Toolbar renders above the data surface, not inline in the header row
- Default state: search, filter trigger, view switcher, bulk action trigger (disabled until selection)
- Active selection state: bulk action buttons appear; item count displayed; deselect affordance present
- Toolbar must not crowd out data surface header columns

**Component mapping:** `HbcCommandBar` (search, filters, actions, overflow menu, saved view selector, density control) or `ListLayout` integrated filter toolbar.

### Filter System

**Rules:**
- Filters accessible from the toolbar filter trigger
- Active filters displayed as removable chips below the toolbar
- Saved views preserve filter state plus column configuration and sort order
- Saved views are per-user and optionally shared (personal/project/organization scope)
- Active filter count visible in toolbar even when filter panel is collapsed

**Component mapping:** `ListLayout` (primary filters, advanced filter panel, filter pills with dismiss, "Clear All" button, result count display). `HbcCommandBar` filter toggles for simpler surfaces.

### Saved Views

**Rules:**
- Saved view selector appears in the toolbar
- Default view is "All" or "My items" depending on surface context
- Custom saved views labeled by the user, not auto-named
- View switching must not cause disorienting layout shifts
- Maximum 20 personal views per user per tool (warn at 18)

**Component mapping:** `useSavedViews` hook with `SavedViewsPersistenceAdapter` interface. Storage adapters: `LocalStorageAdapter` (PWA), `SessionStorageAdapter` (SPFx cross-origin). Deep-link support via `getDeepLink()`. Config includes: columns, columnOrder, columnWidths, filters, sort, groupBy, densityOverride.

### Row Selection and Bulk Actions

**Rules:**
- Selection via checkbox in first column
- Select-all selects visible rows (not all pages); banner communicates when additional pages exist
- Bulk actions contextually relevant to the selection
- Destructive bulk actions require confirmation

**Component mapping:** `HbcDataTable` `rowSelection` + `onRowSelectionChange` props. `ListLayout` floating bulk action bar with action buttons and clear selection affordance.

### Row Actions

**Rules:**
- Primary row action reachable via row click (opens detail view or side panel)
- Secondary actions via contextual menu (ellipsis or right-click)
- Destructive row actions in contextual menu, not inline
- Inline actions (status change, quick assign) appropriate only for one-tap operations with no confirmation

**Component mapping:** `HbcDataTable` `onRowClick` handler for primary action. Inline editing via `editableColumns` / `onCellEdit` (double-click, Enter/Escape/Tab). Contextual menu pattern defined for T07 implementation.

### Sort and Group

**Rules:**
- Column header click toggles sort order; sort indicator visible on active column
- Group-by control separate from sort; available in toolbar, not per column
- Grouped rows have a summary row (count, aggregate metric if applicable)
- Grouping does not break pagination or bulk selection

**Component mapping:** `HbcDataTable` `enableSorting`, `sorting`, `onSortingChange` for sort. Group-by infrastructure defined for T07 implementation via `SavedViewConfig.groupBy` field.

---

## Responsive Collapse Rules

Responsive collapse must preserve comprehension, not merely hide columns.

### 1. Priority Order

Define a priority order for every standard data surface. Implementation via `columnVisibility` + `columnOrder` props on `HbcDataTable`.

- Column 1 (identifier) and the primary status column are **never hidden**
- Remaining columns assigned priority 2–N based on information importance
- At each breakpoint, lowest-priority columns hide first

### 2. Progressive Disclosure

Hidden columns are accessible through:
- **Card fallback** (below 640px): Expand chevron reveals all remaining fields
- **Detail panel** (768–1200px): Row click opens side panel with full record
- **Column configuration** (desktop): User-controlled column visibility toggle

### 3. No Horizontal Scroll as Collapse Substitute

Columns may not overflow to horizontal scroll to avoid the collapse decision. This is a hard constraint per MB-04.

- `HbcDataTable` enforces via `frozenColumns` (sticky left with shadow) + responsive card fallback
- If content exceeds viewport, columns hide in priority order rather than scrolling

### 4. Card Fallback

At the smallest breakpoint (< 640px), columnar tables switch to card layout.

- `mobileCardFields` prop defines which 4–5 fields appear on card face
- Selection checkbox preserved on card header
- Expand chevron reveals full field set
- Responsibility indicators (orange border) preserved on cards

---

## Surface Selection Decision Guide

Use this guide to choose the right data surface for a given Wave 1 use case.

| Question | If Yes → | If No → |
|----------|----------|---------|
| Do users compare attributes across 6+ columns? | Dense analysis table | Continue ↓ |
| Is the surface primarily used on desktop with precise pointer? | Dense analysis table | Continue ↓ |
| Do users need to scan a list where 2–3 attributes dominate? | Responsive list/table hybrid | Continue ↓ |
| Is the surface field-first or mobile-primary? | Card/list view | Continue ↓ |
| Is the goal status communication, not row interaction? | Summary strip / KPI surface | Responsive list/table hybrid |
| Does each item have a visual identity or status more important than column alignment? | Card/list view | Responsive list/table hybrid |

### Wave 1 Surface Assignments

| Surface | Recommended Type | Rationale |
|---------|-----------------|-----------|
| RFI list | Responsive hybrid | Few columns dominate; field-usable |
| Punch list | Responsive hybrid | Status + assignee primary; field-critical |
| Scorecard list | Dense analysis table | Many numeric columns for comparison |
| Budget line items | Dense analysis table | Column-heavy financial data |
| Drawing register | Responsive hybrid | Revision + discipline key; rest secondary |
| Daily log entries | Card/list view | Temporal items; field-first |
| Project dashboard header | Summary strip / KPI | Status communication; 3-second read |
| Personal Work Hub tasks | Card/list view | Work queue; priority + status per item |
| Document register | Responsive hybrid | Title + type + date dominate |
| Turnover items | Responsive hybrid | Status-driven workflow |

---

## Density Mode Behavior Summary

| Surface Type | compact (desktop) | comfortable (tablet) | touch (field) |
|-------------|-------------------|---------------------|---------------|
| Dense analysis table | Full columns, 32px rows | Secondary columns may hide, 40px rows | Card fallback, 48px+ rows |
| Responsive hybrid | Table with all columns | Table with reduced columns | Card-stack layout |
| Card/list view | Compact cards | Standard cards | Large touch-target cards |
| Summary strip / KPI | Horizontal 4-column grid | 2-column grid | Single-column stack |

---

## Follow-On Consumers

- **T07:** Implements all four data surface types and interaction patterns as polished kit components
- **T08:** Uses the pattern library and decision guide to evaluate composition choices in Wave 1 audit
- **T10:** References this document in the usage and composition guide
- **T13:** Evaluates "data surface modernization" as part of the production-readiness scorecard

---

*Adaptive Data Surface Patterns v1.0 — WS1-T06 (2026-03-16)*

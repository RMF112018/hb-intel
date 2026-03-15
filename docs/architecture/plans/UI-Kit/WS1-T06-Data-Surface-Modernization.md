# WS1-T06 — Data-Surface Modernization

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for data surface modernization. Defines the family of adaptive data surfaces, standardizes data interaction patterns, and produces the pattern library that governs all Wave 1 tabular and list surfaces.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase C (after T03, T04, T05 complete; may proceed concurrently with T07)
**Depends On:** T02 (mold-breaker anti-horizontal-scroll and data surface principles); T03 (visual language baseline); T04 (hierarchy rules for data zones); T05 (density modes for table row behavior)
**Unlocks:** T07 component polish (table and list surface implementation); T08 composition audit (data surface composition evaluation)

---

## Objective

Define a family of adaptive data surfaces for `@hbc/ui-kit` that replaces table monoculture and default horizontal-scroll dependence with a principled pattern library. Standardize contextual toolbars, filters, saved views, row actions, and bulk operations. Exit with `UI-Kit-Adaptive-Data-Surface-Patterns.md` as the governing reference for all Wave 1 data-heavy surfaces.

---

## Why This Task Exists

The construction-tech category is table-dominant — virtually every work management surface defaults to a dense multi-column table. Users tolerate this because they are accustomed to it, not because it is the best choice. The market studies confirm that horizontal scrolling, column overwhelm, and fragile overflow are recurring criticism points.

HB Intel has an opportunity to be the first platform in the category to make deliberate data surface choices: using tables where they are genuinely right, card views where context matters more than column alignment, and list/table hybrids where neither extreme serves the content well. T06 makes this a kit-level commitment rather than a per-page decision.

---

## Scope

T06 covers:

1. Defining the adaptive data surface family (types, when to use each, responsive behavior)
2. Standardizing the data interaction pattern library (toolbars, filters, saved views, selection, bulk actions, row actions, sort/group)
3. Defining responsive collapse rules that preserve comprehension
4. Producing `UI-Kit-Adaptive-Data-Surface-Patterns.md`

T06 does not cover:

- Implementing data surface components (that is T07)
- Defining business-logic-specific column sets for Project Hub, Estimating, etc. (those are feature-level decisions)
- Backend pagination or data fetching patterns

---

## Adaptive Data Surface Family

Define four surface types with clear usage criteria:

### Dense analysis table

**When to use:** When users need to compare many attributes across many rows, with column-level operations (sort, filter by column, resize). Assumes desktop or tablet context with adequate horizontal space.

**Governing rules:**
- Maximum information density in desktop density mode
- Responsive behavior: columns collapse in priority order (most important left-most); hidden columns accessible via overflow or detail panel
- Must not require horizontal scrolling for the primary 4–6 columns in tablet density
- Sticky header row; optionally sticky first column for identifier columns

### Responsive list/table hybrid

**When to use:** When users need to scan a list of work items where a few columns matter most and secondary details are contextual. Suitable for desktop, tablet, and field modes.

**Governing rules:**
- Primary columns always visible at any viewport width
- Secondary columns collapse into a detail-accessible state at smaller viewports
- Row height adapts to density mode
- Works without horizontal scrolling in field density mode

### Card or list view

**When to use:** When each item has a visual identity, status is more important than column comparison, or the surface is field-first. Work queues, notification lists, task lists.

**Governing rules:**
- Card or row layout, not columnar
- Status, priority, and primary action are immediately visible per item
- Works in all three density modes without column management
- Appropriate for Personal Work Hub task and notification surfaces

### Summary strip and KPI surface

**When to use:** When the goal is status communication rather than row-by-row interaction. Dashboard header areas, project summary sections, workstream health indicators.

**Governing rules:**
- Minimal interaction affordance (no row actions, no sorting)
- High visual weight; designed for the "3-second read" scan
- Adapts from horizontal strip (desktop) to stacked cards (mobile/field)

---

## Data Interaction Pattern Standards

### Contextual toolbar

Every data surface must define its toolbar pattern:

- Toolbar renders above the data surface (not inline in the header row)
- Default state: search, filter trigger, view switcher, bulk action trigger (disabled until selection)
- Active selection state: bulk action buttons appear; item count displayed; deselect affordance present
- Toolbar must not crowd out data surface header columns

### Filter system

- Filters are accessible from the toolbar filter trigger
- Active filters are displayed as removable chips below the toolbar
- Saved views preserve filter state plus column configuration and sort order
- Saved views are per-user and optionally shared
- Active filter count is visible in the toolbar even when the filter panel is collapsed

### Saved views

- Saved view selector appears in the toolbar
- Default view is "All" or "My items" depending on surface context
- Custom saved views are labeled by the user, not auto-named
- View switching must not cause disorienting layout shifts

### Row selection and bulk actions

- Selection via checkbox in first column
- Select-all selects visible rows (not all pages); banner communicates when additional pages exist
- Bulk actions are contextually relevant to the selection (no generic "export all" for work items)
- Destructive bulk actions require confirmation

### Row actions

- Primary row action is reachable via row click (opens detail view or side panel)
- Secondary actions via contextual menu (ellipsis or right-click)
- Destructive row actions are in the contextual menu, not inline
- Inline actions (status change, quick assign) are appropriate only when the action is a one-tap operation with no confirmation needed

### Sort and group

- Column header click toggles sort order; sort indicator is visible on active column
- Group-by control is separate from sort; available in toolbar, not per column
- Grouped rows have a summary row (count, aggregate metric if applicable)
- Grouping does not break pagination or bulk selection

---

## Responsive Collapse Rules

Responsive collapse must preserve comprehension, not merely hide columns:

1. **Priority order:** Define a priority order for every standard data surface. Column 1 (identifier) and the primary status column are never hidden.
2. **Progressive disclosure:** At each breakpoint, the least-important columns hide in priority order. Hidden columns are accessible via a "more details" disclosure or a detail side panel.
3. **No horizontal scroll as collapse substitute:** Columns may not overflow to horizontal scroll to avoid the collapse decision.
4. **Card fallback:** At the smallest breakpoint, columnar tables must switch to a card or list layout, not compress into unusable horizontal scroll territory.

---

## Mandatory Output

### `UI-Kit-Adaptive-Data-Surface-Patterns.md`

Location: `docs/reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md`

Must include:
- Adaptive data surface family: four types with when-to-use criteria and governing rules
- Data interaction pattern standards for toolbar, filters, saved views, selection, bulk actions, row actions, and sort/group
- Responsive collapse rules with priority-order model and card fallback requirement
- Decision guide: how to choose between surface types for a given Wave 1 use case

---

## Governing Constraints

- **T02 mold-breaker anti-horizontal-scroll principle.** Horizontal scrolling must not be the default answer for any data surface in Wave 1. Every surface type must have a defined responsive behavior that avoids it.
- **T04 hierarchy rules govern data zone treatment.** Data surfaces within a page composition must be correctly positioned in the zone hierarchy (primary content, secondary detail, activity/history) and must not visually compete with the page header or command area.
- **T05 density modes govern row height and touch behavior.** All four surface types must have defined density-mode behavior.

---

## Acceptance Criteria

- [ ] Four adaptive data surface types are defined with when-to-use criteria and governing rules
- [ ] All seven data interaction patterns are standardized (toolbar, filters, saved views, selection, bulk actions, row actions, sort/group)
- [ ] Responsive collapse rules define priority order, progressive disclosure, and card fallback
- [ ] No data surface type relies on horizontal scrolling as its default behavior
- [ ] `UI-Kit-Adaptive-Data-Surface-Patterns.md` exists at the required location and is complete
- [ ] Reference document added to `current-state-map.md §2` as "Reference"
- [ ] T07 authors confirm the pattern library is implementable in component form
- [ ] T08 authors confirm the decision guide is sufficient to evaluate composition choices

---

## Known Risks and Pitfalls

**Risk T06-R1: Pattern library too prescriptive for feature variation.** Wave 1 features have legitimately different data surface needs. The pattern library must be a toolkit, not a rigid template. Define defaults and constraints; allow justified variation within them.

**Risk T06-R2: Saved views requiring backend coordination.** The pattern library defines the UI model for saved views. Backend persistence of saved view state is a Wave 1 feature-level concern, not a T06 concern. Flag this as a Wave 1 implementation dependency but do not block T06 on it.

**Risk T06-R3: Card fallback layout undefined.** The card fallback for responsive collapse must be designed, not just named. If T06 only says "fall back to cards" without specifying what the card layout contains, T07 will have to invent it.

---

## Follow-On Consumers

- **T07:** Implements all four data surface types and interaction pattern standards as kit components
- **T08:** Uses the pattern library and decision guide to evaluate composition choices in the Wave 1 composition audit
- **T10:** References `UI-Kit-Adaptive-Data-Surface-Patterns.md` in the usage and composition guide
- **T13:** Evaluates "data surface modernization" as part of the production-readiness scorecard

---

*End of WS1-T06 — Data-Surface Modernization v1.0 (2026-03-15)*

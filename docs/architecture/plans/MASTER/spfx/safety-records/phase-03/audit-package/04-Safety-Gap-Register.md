# 04 — Safety Gap Register

## G-01 — Workspace masthead and nav are underdesigned
- **Type:** structural blocker
- **Current seam:** `apps/safety/src/router/root-route.tsx`, `packages/shell/src/HeaderBar/index.tsx`
- **Problem:** raw button strip, weak tab affordance, no active-state authority, no compact/overflow model
- **Impact:** first impression is generic and low-authority
- **Priority:** critical

## G-02 — Pages misuse `WorkspacePageShell`
- **Type:** structural blocker
- **Current seam:** all route pages + `packages/ui-kit/src/WorkspacePageShell/index.tsx`
- **Problem:** `layout` prop is set, but `dashboardConfig`, `listConfig`, and state props are usually omitted
- **Impact:** shell capabilities are mostly bypassed
- **Priority:** critical

## G-03 — State ambiguity across route surfaces
- **Type:** structural blocker
- **Current seam:** Upload / Periods / Inspections / Review / Detail pages
- **Problem:** `data = []` fallbacks erase the difference between loading, empty, filtered-empty, and error
- **Impact:** brittle-feeling UX and direct checklist failure
- **Priority:** critical

## G-04 — Composition is too sparse and timid
- **Type:** flagship blocker
- **Current seam:** most pages, especially `UploadPage.tsx`
- **Problem:** large blank canvas, narrow form rail, minimal section architecture
- **Impact:** product does not look serious enough
- **Priority:** critical

## G-05 — Repeated raw tables with no premium grid strategy
- **Type:** structural blocker
- **Current seam:** ReportingPeriodDashboardPage, ProjectWeekDetailPage, InspectionsPage, InspectionDetailPage, ReviewQueuePage
- **Problem:** unstyled HTML tables, no responsive adaptation, no scan hierarchy
- **Impact:** poor readability and weak compact-state behavior
- **Priority:** critical

## G-06 — No Safety-specific primitive family
- **Type:** structural blocker
- **Current seam:** page layer broadly
- **Problem:** no reusable stat card, finding row, review row, or inspection header family
- **Impact:** every page feels improvised
- **Priority:** high

## G-07 — Responsive behavior is implicit instead of defined
- **Type:** structural blocker
- **Current seam:** page layout logic + shell css
- **Problem:** fixed 4-column stat grids, raw tables, no breakpoint contract
- **Impact:** high risk of tablet/phone stress
- **Priority:** critical

## G-08 — Upload workflow is functionally complete but visually weak
- **Type:** refinement + redesign
- **Current seam:** `apps/safety/src/pages/UploadPage.tsx`
- **Problem:** hidden native file input, sparse feedback, no workflow summary object
- **Impact:** first-use confidence is low
- **Priority:** high

## G-09 — Review queue has the best workflow value but poor visual execution
- **Type:** redesign
- **Current seam:** `apps/safety/src/pages/ReviewQueuePage.tsx`
- **Problem:** dense raw table, weak action grouping, no status hierarchy
- **Impact:** highest-value operational view underperforms
- **Priority:** high

## G-10 — Inspection detail underutilizes rich parsed evidence
- **Type:** redesign
- **Current seam:** `apps/safety/src/pages/InspectionDetailPage.tsx`
- **Problem:** plain findings list + plain section table
- **Impact:** rich domain model is not translated into rich operator utility
- **Priority:** high

## G-11 — Incidents route is exposed before it is credible
- **Type:** scope honesty / IA problem
- **Current seam:** router + shell nav + `IncidentsPage.tsx`
- **Problem:** primary navigation includes a future-release placeholder
- **Impact:** weakens perceived completeness
- **Priority:** medium-high

## G-12 — Styling governance is too ad hoc
- **Type:** maintainability blocker
- **Current seam:** inline styles across route pages
- **Problem:** low reuse, high drift, weak future-proofing
- **Impact:** hard to reach flagship polish sustainably
- **Priority:** high

## G-13 — Accessibility proof is insufficient
- **Type:** proof blocker
- **Current seam:** route pages, nav, action clusters, tables
- **Problem:** no deliberate focus/keyboard/touch proof in evidence
- **Impact:** hard-stop risk under scorecard
- **Priority:** high

## G-14 — Hosted/package closure evidence is insufficient
- **Type:** closure blocker
- **Current seam:** validation/test pipeline
- **Problem:** minimal smoke coverage; no package artifact available in session
- **Impact:** cannot claim flagship closure
- **Priority:** critical

# 04 — Safety Gap Register

## G-01 — Theme-mode posture is uncontrolled
- **Severity:** Critical
- **Seam:** `apps/safety/src/App.tsx`, `WorkspacePageShell` mode support, platform theme wiring
- **Problem:** The app inherits `HbcThemeProvider` but pages do not constrain `supportedModes`. The visible dark/field outcome appears to be a platform inheritance problem, not merely page CSS.
- **Why this matters:** If this surface should be office/light-only, that rule must be explicit.
- **Required closure:** Decide whether Safety supports field mode at all. Enforce the decision in code.

## G-02 — Navigation is a raw button strip
- **Severity:** Critical
- **Seam:** `apps/safety/src/router/root-route.tsx`
- **Problem:** The shell receives a custom `toolPickerSlot` that renders plain buttons with no real active-route semantics or product-grade treatment.
- **Why this matters:** This is one of the first things the user sees, and it immediately lowers perceived quality.
- **Required closure:** Replace with a governed navigation primitive tied to current route state.

## G-03 — `WorkspacePageShell` is used only partially
- **Severity:** Critical
- **Seam:** all page files + `docs/reference/ui-kit/WorkspacePageShell.md`
- **Problem:** Pages bypass actions, listConfig, dashboardConfig, and state-prop contract.
- **Why this matters:** The Safety app is forfeiting the repo’s intended page system.
- **Required closure:** Bring page implementations into full WPS contract compliance.

## G-04 — Dashboard page is not actually a dashboard
- **Severity:** High
- **Seam:** `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx`
- **Problem:** No KPI layer, no chart zone, raw table only.
- **Why this matters:** The flagship “period dashboard” view currently underdelivers the most.
- **Required closure:** Build KPI/status/drill-in composition.

## G-05 — List pages bypass list layout system
- **Severity:** High
- **Seam:** `ReviewQueuePage.tsx`, `InspectionsPage.tsx`, `ListLayout.tsx`
- **Problem:** No `listConfig`, no filter toolbar ownership, no pills, no saved views, no bulk-action model, raw tables instead.
- **Why this matters:** The UI kit already contains the bones of a better list product.
- **Required closure:** Rebuild queue and inspections on top of `ListLayout` properly.

## G-06 — Detail pages use fragile fixed grids and raw content
- **Severity:** High
- **Seam:** `InspectionDetailPage.tsx`, `ProjectWeekDetailPage.tsx`
- **Problem:** `gridTemplateColumns: 'repeat(4, 1fr)'` and raw tables with no app-level responsive behavior.
- **Why this matters:** These pages will degrade poorly under constrained widths.
- **Required closure:** Introduce responsive stat cards and better structured detail sections.

## G-07 — State model is ambiguous
- **Severity:** Critical
- **Seam:** most page files
- **Problem:** Default empty arrays + manual empty rows make loading look identical to no-data.
- **Why this matters:** This erodes trust and makes the app feel blank/unreliable.
- **Required closure:** Distinguish loading, no-results, empty-first-run, and error states explicitly.

## G-08 — Upload workflow is too thin
- **Severity:** High
- **Seam:** `UploadPage.tsx`
- **Problem:** Hidden file input + text + submit button is not a flagship ingestion surface.
- **Why this matters:** Upload is the primary workflow.
- **Required closure:** Add guided ingestion UX, stronger preflight messaging, and better result handoff.

## G-09 — Review queue is shallow
- **Severity:** High
- **Seam:** `ReviewQueuePage.tsx`
- **Problem:** Rich ingestion state machine is flattened into a sparse table.
- **Why this matters:** Review-required paths deserve diagnostic clarity.
- **Required closure:** Add preview, context, and richer state chips/actions.

## G-10 — Inspections list is underpowered
- **Severity:** Medium
- **Seam:** `InspectionsPage.tsx`
- **Problem:** Basic filters and raw table only.
- **Why this matters:** Users need stronger inspection scanning and drill-in cues.
- **Required closure:** Add status chips, richer row treatment, better filtering, and responsive patterns.

## G-11 — Incidents is a release credibility blocker
- **Severity:** Critical
- **Seam:** `IncidentsPage.tsx`, route/nav config
- **Problem:** Active navigation points to a future-wave placeholder.
- **Why this matters:** Flagship products cannot ship dead-end tabs.
- **Required closure:** Implement MVP or remove from active nav.

## G-12 — Validation is too weak
- **Severity:** High
- **Seam:** `e2e/webparts/safety.spec.ts`, `apps/safety/src/test/router.test.ts`
- **Problem:** Tests prove almost nothing about flagship quality.
- **Why this matters:** Closure evidence is insufficient.
- **Required closure:** Add route, state, navigation, and viewport-proof tests.

## G-13 — Local primitive discipline is weak
- **Severity:** Medium
- **Seam:** multiple page files
- **Problem:** Repeated inline styles, repeated raw tables, repeated manual stat layouts.
- **Why this matters:** Maintainability and consistency both suffer.
- **Required closure:** Create Safety-local workspace primitives where appropriate.

## G-14 — Host/runtime overlays need explicit review
- **Severity:** Medium
- **Seam:** hosted runtime result
- **Problem:** The screenshots show a fixed lower-right action surface that visually collides with the Safety workspace; ownership is not proven from the Safety app alone.
- **Why this matters:** Even app-adjacent overlays affect the hosted product result.
- **Required closure:** Perform host DOM/runtime inspection and either integrate around it or suppress conflict.

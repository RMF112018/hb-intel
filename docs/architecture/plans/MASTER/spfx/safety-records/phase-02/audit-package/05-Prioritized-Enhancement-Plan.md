# 05 — Prioritized Enhancement Plan

## E-01 — Lock the theme/mode posture for Safety
- **Closes:** G-01
- **Implementation direction:** Decide whether Safety is office-only. If yes, enforce that through `supportedModes` and/or a route-level/shell-level office-only posture. Do not let field/dark mode arrive by inheritance if it is not product-appropriate.
- **Impact:** Immediate correction of the most obvious visual mismatch.
- **Cross-layer implications:** app root, theme provider expectations, page shell usage.
- **When:** Now.
- **Type:** Structural decision + implementation.

## E-02 — Replace the raw header nav with a real route-aware workspace navigation surface
- **Closes:** G-02
- **Implementation direction:** Rebuild the `toolPickerSlot` path in `root-route.tsx` so the user gets:
  - active route indication,
  - larger targets,
  - better spacing,
  - premium styling,
  - keyboard-safe navigation.
- **Impact:** High; improves first impression and overall coherence.
- **Cross-layer implications:** shell header, route state, responsive header behavior.
- **When:** Now.
- **Type:** Structural redesign.

## E-03 — Bring every page into real `WorkspacePageShell` compliance
- **Closes:** G-03, G-07
- **Implementation direction:** For each page, use WPS as intended:
  - page actions via `actions` / `overflowActions`,
  - loading via `isLoading`,
  - empty via `isEmpty`,
  - error via `isError`,
  - supported mode rules where relevant.
- **Impact:** Very high; fixes multiple categories at once.
- **Cross-layer implications:** page files, shared page-state model, possible helper hooks.
- **When:** Now.
- **Type:** Structural redesign.

## E-04 — Rebuild Reporting Period Dashboard into a real command surface
- **Closes:** G-04
- **Implementation direction:** Use `dashboardConfig` and create a first-view structure with KPI summary, trend/status section, and a better project-week workspace.
- **Impact:** High; upgrades the most visible management surface.
- **Cross-layer implications:** page composition, possible derived metrics hook.
- **When:** Now.
- **Type:** Structural redesign.

## E-05 — Rebuild Review Queue and Inspections on the governed list-page model
- **Closes:** G-05, G-09, G-10
- **Implementation direction:** Supply `listConfig`, filter definitions, active filters, result counts, and richer row rendering. Replace raw table handling with responsive list/data components.
- **Impact:** Very high; materially improves two core workflows.
- **Cross-layer implications:** page logic, list primitives, possibly Safety-local row components.
- **When:** Now.
- **Type:** Structural redesign.

## E-06 — Rebuild detail pages with responsive stat cards and better content hierarchy
- **Closes:** G-06
- **Implementation direction:** Replace fixed 4-column stat grids and raw sections with responsive detail primitives and stronger metadata framing.
- **Impact:** Medium-high; important for drill-in credibility.
- **Cross-layer implications:** detail pages, responsive primitives, metadata components.
- **When:** Now.
- **Type:** Structural redesign.

## E-07 — Productize Upload as a guided ingestion workflow
- **Closes:** G-08
- **Implementation direction:** Build a better upload zone, stronger guidance, preflight state, and a clearer post-submit handoff to review/inspection outcomes.
- **Impact:** High; this is the primary user journey.
- **Cross-layer implications:** upload page, possible new upload components, mutation-state handling.
- **When:** Now.
- **Type:** Structural redesign.

## E-08 — Resolve Incidents decisively
- **Closes:** G-11
- **Implementation direction:** Either:
  - implement a credible MVP incidents surface, or
  - remove it from active navigation and routes used in production posture.
- **Impact:** High because it removes a hard-stop credibility failure.
- **Cross-layer implications:** route config, nav config, scope/feature flags.
- **When:** Now.
- **Type:** Structural redesign or scope cut.

## E-09 — Raise validation from smoke coverage to flagship closure coverage
- **Closes:** G-12
- **Implementation direction:** Add tests and manual proof requirements covering:
  - route-aware nav state,
  - loading/empty/error state correctness,
  - responsive behavior,
  - hosted screenshots,
  - and no-placeholder release criteria.
- **Impact:** High for closure confidence.
- **Cross-layer implications:** Playwright, screenshots, acceptance docs.
- **When:** After first implementation pass begins.
- **Type:** Refinement.

## E-10 — Extract Safety-local page primitives
- **Closes:** G-13
- **Implementation direction:** Create small reusable components for:
  - summary stat groups,
  - queue row states,
  - inspection row cards,
  - period status cards,
  - upload state blocks.
- **Impact:** Medium; improves maintainability and consistency.
- **Cross-layer implications:** local component structure, styling governance.
- **When:** Now, alongside page rewrites.
- **Type:** Refinement with architecture cleanup.

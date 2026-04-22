# 05 — Prioritized Enhancement Plan

## E-01 — Rebuild the Safety workspace masthead and route navigation
- **Closes:** G-01, G-07, G-11
- **Implementation direction:** replace the raw tool-picker buttons with a true workspace masthead + premium tab system that supports active state, overflow rules, compact mode, and honest module availability
- **Impact:** major first-screen uplift; removes “generic module” feel fast
- **Cross-layer implications:** router, shell slot, nav semantics, responsive behavior
- **When:** now
- **Work type:** structural redesign

## E-02 — Make `WorkspacePageShell` real instead of nominal
- **Closes:** G-02, G-03
- **Implementation direction:** every route must explicitly drive shell state props and, where relevant, real `listConfig` / `dashboardConfig`
- **Impact:** major UX credibility improvement; resolves ambiguity between loading and empty
- **Cross-layer implications:** page hooks, state modeling, layout behavior
- **When:** now
- **Work type:** structural redesign

## E-03 — Introduce a Safety-specific UI primitive family
- **Closes:** G-05, G-06, G-12
- **Implementation direction:** create shared route-level primitives for stats, findings, review actions, data rows, filters, and empty panels
- **Impact:** strong styling cohesion and maintainability improvement
- **Cross-layer implications:** new local UI layer under `apps/safety/src/components/` or equivalent
- **When:** now
- **Work type:** structural redesign

## E-04 — Recompose the Upload page into a true first-use workflow surface
- **Closes:** G-04, G-08
- **Implementation direction:** transform the page from form rail into:
  - intro/value strip
  - reporting period selection panel
  - upload zone
  - validation/result summary card
  - next-step guidance
- **Impact:** fastest visible quality jump
- **Cross-layer implications:** upload state rendering, success/warning/error treatment
- **When:** now
- **Work type:** redesign

## E-05 — Replace raw tables with a responsive Safety data-surface system
- **Closes:** G-05, G-07, G-09, G-10
- **Implementation direction:** use authored data surfaces that can behave as:
  - wide table/grid on desktop
  - stacked cards / grouped rows on compact widths
  - scroll-area only when truly necessary
- **Impact:** major flagship-score lift in composition and breakpoint quality
- **Cross-layer implications:** all list/detail pages
- **When:** now
- **Work type:** structural redesign

## E-06 — Upgrade inspection detail into a richer operational review surface
- **Closes:** G-10, G-13
- **Implementation direction:** present findings and section scores as structured severity-aware components with better scan order, metadata, and keyboard reachability
- **Impact:** high utility gain
- **Cross-layer implications:** detail page + findings component family
- **When:** now
- **Work type:** redesign

## E-07 — Resolve the Incidents exposure problem
- **Closes:** G-11
- **Implementation direction:** either:
  1. hide the tab until implemented, or
  2. recast it as an intentionally gated roadmap surface with clear “not in Release 1” semantics and no false promise
- **Impact:** improves product honesty
- **Cross-layer implications:** router, shell config, information architecture
- **When:** now
- **Work type:** refinement

## E-08 — Add explicit breakpoint and compact-state contracts
- **Closes:** G-07, G-13, G-14
- **Implementation direction:** define and implement wide / medium / compact / handheld / short-height behaviors
- **Impact:** major doctrine compliance improvement
- **Cross-layer implications:** shell nav, stat cards, data surfaces, detail pages
- **When:** now
- **Work type:** structural redesign

## E-09 — Expand proof and hosted validation
- **Closes:** G-13, G-14
- **Implementation direction:** add route-state testing, responsive screenshots, hosted evidence, and package verification
- **Impact:** required for credible closure
- **Cross-layer implications:** Playwright, packaging, evidence docs
- **When:** immediately after Wave 1 visual/structural work
- **Work type:** closure hardening

## E-10 — Add restrained premium motion and affordance polish
- **Closes:** G-01, G-04, G-05
- **Implementation direction:** use `motion` only where it improves:
  - tab transitions
  - upload success/review warnings
  - row expansion or detail reveal
  - focus/hover/press quality
- **Impact:** moderate but important premium lift
- **Cross-layer implications:** component primitives
- **When:** after structural surface rebuild
- **Work type:** refinement

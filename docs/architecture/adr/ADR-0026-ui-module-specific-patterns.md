# ADR-0026: UI Module-Specific Patterns

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.13
**References:** PH4.13-UI-Design-Plan.md §13.1–13.8, Blueprint §1d

## Context

Phase 4.12 completed the interaction pattern library. Phase 4.13 must connect existing ui-kit components to 8 construction management modules (Scorecards, RFIs, Punch List, Drawings, Budget, Daily Log, Turnover, Documents). Several modules need unique visual patterns not covered by existing components.

## Decision

### 1. Module configs as data objects, not React components
Column definitions, KPI arrays, and tab arrays are exported as typed TypeScript objects from `ui-kit/module-configs/`. Page-level composition happens in `apps/pwa`. This keeps ui-kit data-agnostic and avoids coupling module business logic to the design system.

### 2. pdfjs-dist as lazy-loaded peer dependency
HbcDrawingViewer wraps pdfjs-dist via dynamic `import()`. This defers ~500KB from the initial bundle. The worker is loaded from CDN. `pdfjs-dist` is declared as a peer dependency so consumers control the version.

### 3. Frozen columns via sticky positioning
HbcDataTable gains a `frozenColumns?: string[]` prop. Implementation uses `position: sticky` with cumulative `left` offsets. This is compatible with the existing row-height virtualizer approach (which uses `<tr>` spacers, not cell-level positioning). A shadow border on the last frozen column provides visual separation.

### 4. HbcDrawingViewer 3-layer stack
Bottom: `<canvas>` for PDF rendering. Middle: `<svg>` overlay for markup annotations. Top: invisible `<div>` for pointer event capture. Both SVG and canvas share the same CSS transform matrix so markups align pixel-perfectly during zoom/pan.

### 5. HbcCalendarGrid is standalone
Daily Log uses a calendar-centric landing layout structurally different from table-based landings. HbcCalendarGrid is a standalone component that wraps in a simple page shell, not ToolLandingLayout.

### 6. HbcApprovalStepper reused across modules
Scorecards (approval chain sidebar) and Turnover (signature stepper) both need a vertical stepper. A single HbcApprovalStepper component serves both, parameterized by `steps[]` and `orientation`.

## Consequences

- 5 new components added to ui-kit (HbcScoreBar, HbcApprovalStepper, HbcPhotoGrid, HbcCalendarGrid, HbcDrawingViewer)
- 1 new peer dependency (pdfjs-dist, optional)
- 8 module config files provide consistent column/KPI/tab presets
- Zero breaking changes to existing components
- All new props are optional

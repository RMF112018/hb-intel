# ADR-0021: UI Overlay & Surface System

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.8
**Reference:** PH4.8-UI-Design-Plan.md §8, Blueprint §1d

## Context

Phase 4.7 delivered data visualization. The design system needed:
1. A unified elevation system matching the V2.1 dual-shadow specification
2. Centralized z-index management (previously scattered across 12+ files with inconsistent ranges 9998–10101)
3. Surface overlay components (modal, tearsheet, popover, card) with consistent patterns

## Decision

### V2.1 Dual-Shadow Elevation

Adopted a 4-level dual-shadow scale (Level 0–3). Each non-zero level uses two `box-shadow` values for more natural depth perception compared to the previous single-shadow 5-level system.

**Backward compatibility:** Deprecated aliases map old names to new levels. Critically, `elevationRest` maps to Level 1 (not Level 0/`none`) because HbcDataTable and ToolLandingLayout rely on `elevationRest` for visible card shadows.

Field Mode variants increase shadow opacity by ~50% for outdoor/high-glare visibility.

### Centralized Z-Index

Created `Z_INDEX` constant object with typed layer names. All components now import from a single source. Layers follow a logical stacking order: content (0) < sidebar (100) < header (200) < popover (1000) < panel (1100) < modal (1200) < command palette (1250) < toast (1300).

SPFx and connectivity bar retain high values (10000, 10001) for host environment compatibility.

### Shared Focus Trap Hook

Extracted `useFocusTrap` from HbcPanel into a shared hook for reuse across HbcModal, HbcTearsheet, and HbcPanel. This eliminates code duplication and ensures consistent focus management behavior.

## Consequences

- All z-index values are now traceable to a single source file
- New overlay components (modal, tearsheet, popover, card) follow consistent patterns
- Existing components using deprecated elevation names continue to work without changes
- Focus trap behavior is consistent across all modal-like overlays
- Field Mode shadow variants are available for all elevation levels

## Alternatives Considered

1. **CSS custom properties for z-index:** Rejected because Griffel's static extraction doesn't support CSS variables in `zIndex`.
2. **Separate z-index per component:** Rejected — the scattered approach was the problem being solved.
3. **Keep 5-level elevation:** Rejected — V2.1 spec mandates dual-shadow 4-level system.

/**
 * HB Intel Design System — Elevation system
 * Blueprint §1d — 5-level shadow system for depth hierarchy
 */

/** Level 0 — rest state: flat cards, table rows */
export const elevationRest = '0 1px 2px rgba(0, 0, 0, 0.08)' as const;

/** Level 1 — hover state: interactive cards, hovered rows */
export const elevationHover = '0 2px 8px rgba(0, 0, 0, 0.12)' as const;

/** Level 2 — raised: command bars, sticky headers, floating action buttons */
export const elevationRaised = '0 4px 16px rgba(0, 0, 0, 0.14)' as const;

/** Level 3 — overlay: dropdowns, popovers, tooltips */
export const elevationOverlay = '0 8px 24px rgba(0, 0, 0, 0.18)' as const;

/** Level 4 — dialog: modals, full-screen panels */
export const elevationDialog = '0 16px 48px rgba(0, 0, 0, 0.22)' as const;

/** Complete elevation scale for theme integration */
export const hbcElevation = {
  rest: elevationRest,
  hover: elevationHover,
  raised: elevationRaised,
  overlay: elevationOverlay,
  dialog: elevationDialog,
} as const;

/**
 * HB Intel Design System — V2.1 Dual-Shadow Elevation System
 * PH4.8 §Step 1 | Blueprint §1d
 *
 * 4-level dual-shadow scale: each level uses two box-shadows for natural depth.
 * Field Mode variants increase opacity by ~50% for visibility in dark environments.
 */

// ---------------------------------------------------------------------------
// V2.1 Elevation Levels (dual-shadow)
// ---------------------------------------------------------------------------

/** Level 0 — rest: no shadow (flat surface) */
export const elevationLevel0 = 'none' as const;

/** Level 1 — card: subtle depth for cards, table containers */
export const elevationLevel1 =
  '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)' as const;

/** Level 2 — raised: popovers, dropdowns, floating elements */
export const elevationLevel2 =
  '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)' as const;

/** Level 3 — overlay: side panels, drawers, dropdowns */
export const elevationLevel3 =
  '0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.08)' as const;

/** Level 4 — blocking: modal dialogs, confirmation overlays, tearsheets (V2.1.2 — WS1-T04) */
export const elevationLevel4 =
  '0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 12px rgba(0, 0, 0, 0.10)' as const;

/** Semantic aliases */
export const elevationCard = elevationLevel1;
export const elevationModal = elevationLevel3;
/** Semantic alias — blocking overlays that demand exclusive attention (V2.1.2) */
export const elevationBlocking = elevationLevel4;

// ---------------------------------------------------------------------------
// Field Mode Variants (opacity +50%)
// ---------------------------------------------------------------------------

/** Field Mode Level 0 — still none */
export const elevationFieldLevel0 = 'none' as const;

/** Field Mode Level 1 — card with increased opacity */
export const elevationFieldLevel1 =
  '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.09)' as const;

/** Field Mode Level 2 — raised with increased opacity */
export const elevationFieldLevel2 =
  '0 4px 6px rgba(0, 0, 0, 0.11), 0 2px 4px rgba(0, 0, 0, 0.09)' as const;

/** Field Mode Level 3 — overlay with increased opacity */
export const elevationFieldLevel3 =
  '0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.12)' as const;

/** Field Mode Level 4 — blocking with increased opacity (V2.1.2 — WS1-T04) */
export const elevationFieldLevel4 =
  '0 16px 32px rgba(0, 0, 0, 0.18), 0 8px 12px rgba(0, 0, 0, 0.15)' as const;

/** Complete Field Mode elevation scale */
export const hbcElevationField = {
  level0: elevationFieldLevel0,
  level1: elevationFieldLevel1,
  level2: elevationFieldLevel2,
  level3: elevationFieldLevel3,
  level4: elevationFieldLevel4,
} as const;

// ---------------------------------------------------------------------------
// Deprecated Aliases (backward-compatible mapping to V2.1)
// ---------------------------------------------------------------------------
// elevationRest had a visible shadow used by HbcDataTable and ToolLandingLayout,
// so it maps to Level 1 (card) rather than Level 0 (none).

/** @deprecated Use `elevationLevel1` — maps to card shadow for backward compatibility */
export const elevationRest = elevationLevel1;

/** @deprecated Use `elevationLevel1` */
export const elevationHover = elevationLevel1;

/** @deprecated Use `elevationLevel2` */
export const elevationRaised = elevationLevel2;

/** @deprecated Use `elevationLevel2` */
export const elevationOverlay = elevationLevel2;

/** @deprecated Use `elevationLevel3` */
export const elevationDialog = elevationLevel3;

/** Complete elevation scale for theme integration */
export const hbcElevation = {
  rest: elevationRest,
  hover: elevationHover,
  raised: elevationRaised,
  overlay: elevationOverlay,
  dialog: elevationDialog,
  // V2.1 levels
  level0: elevationLevel0,
  level1: elevationLevel1,
  level2: elevationLevel2,
  level3: elevationLevel3,
  // V2.1.2 levels (WS1-T04)
  level4: elevationLevel4,
  blocking: elevationBlocking,
} as const;

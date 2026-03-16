/**
 * density.ts — Density tier detection, persistence & field-readability standards
 * PH4.16 §Step 6 | Blueprint §1d | WS1-T05
 *
 * Provides automatic density detection based on input device,
 * localStorage persistence for user overrides, and typed reference
 * constants for per-tier tokens and field-readability requirements.
 */

/** Available density tiers for UI spacing and sizing */
export type DensityTier = 'compact' | 'comfortable' | 'touch';

/** Row height (px) per density tier */
export const DENSITY_BREAKPOINTS: Record<DensityTier, number> = {
  compact: 32,
  comfortable: 40,
  touch: 56,
} as const;

const DENSITY_STORAGE_KEY = 'hbc-density-override';

/**
 * Detect the appropriate density tier from the device's input capabilities.
 * - `pointer: coarse` (touch) → 'touch'
 * - `pointer: fine` (mouse) → 'compact'
 * - Fallback → 'comfortable'
 */
export function detectDensityTier(): DensityTier {
  if (typeof window === 'undefined') return 'comfortable';

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isFine = window.matchMedia('(pointer: fine)').matches;

  if (isCoarse && !isFine) return 'touch';
  if (isFine) return 'compact';
  return 'comfortable';
}

/** Persist a user-selected density override to localStorage. */
export function persistDensityOverride(tier: DensityTier): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DENSITY_STORAGE_KEY, tier);
}

/** Retrieve a previously persisted density override, or null if none set. */
export function getDensityOverride(): DensityTier | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(DENSITY_STORAGE_KEY);
  if (stored === 'compact' || stored === 'comfortable' || stored === 'touch') {
    return stored;
  }
  return null;
}

/** Clear any persisted density override (revert to auto-detection). */
export function clearDensityOverride(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DENSITY_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Density mode labels (V2.1.3 — WS1-T05)
// ---------------------------------------------------------------------------

/** T05 mode label mapping for documentation clarity */
export type DensityModeLabel = 'desktop' | 'tablet' | 'field';

/** Maps DensityTier to its T05 mode label */
export const DENSITY_MODE_LABELS: Record<DensityTier, DensityModeLabel> = {
  compact: 'desktop',
  comfortable: 'tablet',
  touch: 'field',
} as const;

// ---------------------------------------------------------------------------
// Per-tier density tokens (V2.1.3 — WS1-T05)
// ---------------------------------------------------------------------------

export interface DensityTokenSet {
  /** Row height minimum in px */
  rowHeightMin: number;
  /** Touch target minimum in px (width and height) */
  touchTargetMin: number;
  /** Body text font size floor in px */
  bodyTextMinPx: number;
  /** Label text font size floor in px */
  labelTextMinPx: number;
  /** Status/badge text font size floor in px */
  statusTextMinPx: number;
  /** Minimum spacing between adjacent interactive targets in px */
  tapSpacingMin: number;
  /** WCAG text contrast ratio requirement */
  textContrastMin: number;
  /** WCAG interactive element contrast ratio requirement */
  interactiveContrastMin: number;
  /** Usage guidance for implementers */
  usage: string;
}

/**
 * Per-tier token overrides for density-aware components.
 * compact = desktop, comfortable = tablet, touch = field-first.
 */
export const HBC_DENSITY_TOKENS: Record<DensityTier, DensityTokenSet> = {
  compact: {
    rowHeightMin: 32,
    touchTargetMin: 24,
    bodyTextMinPx: 13,
    labelTextMinPx: 11,
    statusTextMinPx: 11,
    tapSpacingMin: 8,
    textContrastMin: 4.5,
    interactiveContrastMin: 3,
    usage: 'Desktop density: pointer-optimized. Full information density for sustained office use.',
  },
  comfortable: {
    rowHeightMin: 40,
    touchTargetMin: 36,
    bodyTextMinPx: 14,
    labelTextMinPx: 12,
    statusTextMinPx: 12,
    tapSpacingMin: 12,
    textContrastMin: 4.5,
    interactiveContrastMin: 3,
    usage: 'Tablet density: hybrid input. Modest spacing increase; information density preserved.',
  },
  touch: {
    rowHeightMin: 48,
    touchTargetMin: 44,
    bodyTextMinPx: 15,
    labelTextMinPx: 13,
    statusTextMinPx: 12,
    tapSpacingMin: 16,
    textContrastMin: 7,
    interactiveContrastMin: 4.5,
    usage: 'Field-first touch density: gloved hands, bright sunlight, one-handed use. Maximum readability.',
  },
} as const;

// ---------------------------------------------------------------------------
// Field-readability constraint categories (V2.1.3 — WS1-T05)
// ---------------------------------------------------------------------------

export type FieldReadabilityCategory =
  | 'touchTargetSize'
  | 'bodyTextMin'
  | 'labelTextMin'
  | 'statusBadgeTextMin'
  | 'textContrastRatio'
  | 'interactiveElementContrast'
  | 'tapSpacing'
  | 'rowHeightMin';

export interface FieldReadabilityConstraint {
  /** Human-readable constraint name */
  label: string;
  /** Standard density value */
  standard: string;
  /** Field density minimum */
  fieldMinimum: string;
  /** Numeric standard value for programmatic checks */
  standardValue: number;
  /** Numeric field minimum value for programmatic checks */
  fieldValue: number;
  /** Unit of measurement */
  unit: 'px' | 'ratio';
  /** WCAG reference when applicable */
  wcagRef?: string;
}

/**
 * Measurable field-readability minimums — hard requirements, not guidelines.
 * T07 must meet these per component; T08 validates compositions against them.
 */
export const HBC_FIELD_READABILITY: Record<FieldReadabilityCategory, FieldReadabilityConstraint> = {
  touchTargetSize: {
    label: 'Touch target size',
    standard: '≥24×24px (pointer-optimized)',
    fieldMinimum: '≥44×44px (WCAG 2.5.5 AAA), aim 48×48px',
    standardValue: 24,
    fieldValue: 44,
    unit: 'px',
    wcagRef: 'WCAG 2.5.5 (AAA), WCAG 2.5.8',
  },
  bodyTextMin: {
    label: 'Body text minimum',
    standard: '13px',
    fieldMinimum: '15px',
    standardValue: 13,
    fieldValue: 15,
    unit: 'px',
  },
  labelTextMin: {
    label: 'Label text minimum',
    standard: '11px',
    fieldMinimum: '13px',
    standardValue: 11,
    fieldValue: 13,
    unit: 'px',
  },
  statusBadgeTextMin: {
    label: 'Status/badge text minimum',
    standard: '11px',
    fieldMinimum: '12px',
    standardValue: 11,
    fieldValue: 12,
    unit: 'px',
  },
  textContrastRatio: {
    label: 'Text contrast ratio',
    standard: '4.5:1 (WCAG AA)',
    fieldMinimum: '7:1 (WCAG AAA) for outdoor conditions',
    standardValue: 4.5,
    fieldValue: 7,
    unit: 'ratio',
    wcagRef: 'WCAG 1.4.3 (AA), WCAG 1.4.6 (AAA)',
  },
  interactiveElementContrast: {
    label: 'Interactive element contrast',
    standard: '3:1 against background',
    fieldMinimum: '4.5:1 for outdoor legibility',
    standardValue: 3,
    fieldValue: 4.5,
    unit: 'ratio',
    wcagRef: 'WCAG 1.4.11',
  },
  tapSpacing: {
    label: 'Tap spacing between adjacent targets',
    standard: '8px',
    fieldMinimum: '16px minimum',
    standardValue: 8,
    fieldValue: 16,
    unit: 'px',
  },
  rowHeightMin: {
    label: 'Row height in tables/lists',
    standard: 'Standard compact (32px)',
    fieldMinimum: '48px minimum per row in field mode',
    standardValue: 32,
    fieldValue: 48,
    unit: 'px',
  },
} as const;

// ---------------------------------------------------------------------------
// Field interaction assumptions (V2.1.3 — WS1-T05)
// ---------------------------------------------------------------------------

export interface FieldInteractionAssumption {
  /** Assumption title */
  label: string;
  /** Detailed description */
  description: string;
  /** Design implication for component authors */
  designImplication: string;
}

/**
 * Field use conditions that components must be designed and tested against.
 * These are architectural commitments, not aspirational guidelines.
 */
export const HBC_FIELD_INTERACTION_ASSUMPTIONS: readonly FieldInteractionAssumption[] = [
  {
    label: 'Gloved touch',
    description: 'Assume imprecise tap radius of ≥10px. Targets must tolerate touches that miss center by 10px without triggering adjacent actions.',
    designImplication: 'Touch targets ≥44px with ≥16px tap spacing. No precision gestures required for primary flows.',
  },
  {
    label: 'Bright sunlight',
    description: 'Assume ambient light washes out contrast by 30–40%. Field contrast minimums account for this degradation.',
    designImplication: 'Text contrast ≥7:1, interactive element contrast ≥4.5:1. Status colors must remain distinguishable at reduced contrast.',
  },
  {
    label: 'One-handed use',
    description: 'Common flows must be completable one-handed. Primary actions must be reachable without two-hand grip.',
    designImplication: 'Primary actions positioned in bottom-half reachable zone. No mandatory two-finger gestures.',
  },
  {
    label: 'Motion and vibration',
    description: 'Assume user is in a moving vehicle or on unstable footing. Micro-interactions must not require precision gestures.',
    designImplication: 'No drag-to-reorder as sole interaction. Swipe thresholds generous. Scroll targets large.',
  },
  {
    label: 'Intermittent focus',
    description: 'Field workers are interrupted frequently. State must be preserved clearly — the interface must communicate "where am I" unambiguously after a context switch.',
    designImplication: 'Persistent visual state indicators. No auto-dismiss that loses user context. Clear breadcrumbs and page titles.',
  },
] as const;

// ---------------------------------------------------------------------------
// Density application model (V2.1.3 — WS1-T05)
// ---------------------------------------------------------------------------

export interface DensityApplicationModel {
  /** System-level detection approach */
  systemDetection: string;
  /** User-controlled toggle pattern */
  userToggle: string;
  /** Component API pattern */
  componentApi: string;
  /** Persistence model */
  persistence: string;
}

/**
 * Documents how density modes are applied across the kit.
 * This is the architectural contract for density integration.
 */
export const HBC_DENSITY_APPLICATION_MODEL: DensityApplicationModel = {
  systemDetection: 'detectDensityTier() uses pointer:coarse/fine media queries. useDensity() auto-detects and reacts to pointer changes. Field mode auto-defaults to comfortable tier.',
  userToggle: 'Density preference settable via useDensity().setOverride(tier). App shell should expose a one-tap toggle accessible from any page.',
  componentApi: 'Components inherit density via useDensity() hook or accept an explicit density prop. DensityProvider context planned for T07 to enable subtree-level density overrides without per-instance props.',
  persistence: 'persistDensityOverride() saves to localStorage under key "hbc-density-override". Persists across sessions per browser. Per-tool overrides use "hbc-density-{toolId}" key pattern (see useAdaptiveDensity).',
} as const;

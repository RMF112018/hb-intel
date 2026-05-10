export const PCC_CARD_FOOTPRINTS = [
  'hero',
  'wide',
  'standard',
  'compact',
  'tall',
  'full',
  'rail',
  'detail',
] as const;

export type PccCardFootprint = (typeof PCC_CARD_FOOTPRINTS)[number];

export const PCC_RESPONSIVE_MODES = [
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
  'standardLaptop',
  'largeLaptop',
  'desktop',
  'ultrawide',
] as const;

export type PccResponsiveMode = (typeof PCC_RESPONSIVE_MODES)[number];

export const PCC_RESPONSIVE_COLUMNS: Record<PccResponsiveMode, number> = {
  phone: 1,
  tabletPortrait: 2,
  tabletLandscape: 6,
  smallLaptop: 8,
  standardLaptop: 10,
  largeLaptop: 12,
  desktop: 12,
  ultrawide: 12,
};

export const FOOTPRINT_COLUMN_SPANS: Record<PccResponsiveMode, Record<PccCardFootprint, number>> = {
  ultrawide: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  desktop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  largeLaptop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  standardLaptop: {
    hero: 6,
    wide: 5,
    standard: 3,
    compact: 2,
    tall: 3,
    full: 10,
    rail: 3,
    detail: 7,
  },
  smallLaptop: { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 8, rail: 2, detail: 6 },
  tabletLandscape: {
    hero: 4,
    wide: 3,
    standard: 2,
    compact: 2,
    tall: 2,
    full: 6,
    rail: 2,
    detail: 4,
  },
  tabletPortrait: {
    hero: 2,
    wide: 2,
    standard: 1,
    compact: 1,
    tall: 1,
    full: 2,
    rail: 1,
    detail: 2,
  },
  phone: { hero: 1, wide: 1, standard: 1, compact: 1, tall: 1, full: 1, rail: 1, detail: 1 },
};

/**
 * Minimum protected spans by mode/footprint. The resolved span for a card is
 * `max(FOOTPRINT_COLUMN_SPANS, FOOTPRINT_MIN_COLUMN_SPANS)` so key cards do
 * not collapse into unusable narrow columns on constrained hosts.
 */
export const FOOTPRINT_MIN_COLUMN_SPANS: Record<
  PccResponsiveMode,
  Record<PccCardFootprint, number>
> = {
  ultrawide: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  desktop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  largeLaptop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  standardLaptop: {
    hero: 6,
    wide: 5,
    standard: 3,
    compact: 2,
    tall: 3,
    full: 10,
    rail: 3,
    detail: 7,
  },
  smallLaptop: { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 8, rail: 2, detail: 6 },
  tabletLandscape: {
    hero: 4,
    wide: 3,
    standard: 2,
    compact: 2,
    tall: 2,
    full: 6,
    rail: 2,
    detail: 4,
  },
  // `tabletPortrait.standard: 2` is preserved as a protected floor (base
  // span at this mode is 1) so existing surfaces don't collapse to a
  // single column on tablet-portrait. Wave-b3 spec 05 says "match the
  // same values above"; the deviation is intentional and limited to
  // this cell — see Prompt 03 closeout.
  tabletPortrait: {
    hero: 2,
    wide: 2,
    standard: 2,
    compact: 1,
    tall: 1,
    full: 2,
    rail: 1,
    detail: 2,
  },
  phone: { hero: 1, wide: 1, standard: 1, compact: 1, tall: 1, full: 1, rail: 1, detail: 1 },
};

export const FOOTPRINT_MIN_INLINE_SIZE_PX: Record<
  PccResponsiveMode,
  Record<PccCardFootprint, number>
> = {
  ultrawide: {
    hero: 320,
    wide: 280,
    standard: 240,
    compact: 200,
    tall: 220,
    full: 320,
    rail: 220,
    detail: 320,
  },
  desktop: {
    hero: 320,
    wide: 280,
    standard: 240,
    compact: 200,
    tall: 220,
    full: 320,
    rail: 220,
    detail: 320,
  },
  largeLaptop: {
    hero: 320,
    wide: 280,
    standard: 240,
    compact: 200,
    tall: 220,
    full: 320,
    rail: 220,
    detail: 320,
  },
  standardLaptop: {
    hero: 300,
    wide: 260,
    standard: 220,
    compact: 190,
    tall: 210,
    full: 300,
    rail: 200,
    detail: 300,
  },
  smallLaptop: {
    hero: 300,
    wide: 260,
    standard: 220,
    compact: 190,
    tall: 210,
    full: 300,
    rail: 190,
    detail: 280,
  },
  tabletLandscape: {
    hero: 260,
    wide: 230,
    standard: 210,
    compact: 180,
    tall: 190,
    full: 260,
    rail: 180,
    detail: 240,
  },
  tabletPortrait: {
    hero: 220,
    wide: 200,
    standard: 200,
    compact: 168,
    tall: 168,
    full: 220,
    rail: 168,
    detail: 220,
  },
  phone: {
    hero: 0,
    wide: 0,
    standard: 0,
    compact: 0,
    tall: 0,
    full: 0,
    rail: 0,
    detail: 0,
  },
};

export const PCC_BENTO_GRID_ROW_UNIT_PX = 8;
export const PCC_BENTO_GRID_GAP_PX = 16;

/**
 * Upper-inclusive width thresholds (px) per mode, excluding `ultrawide` which
 * has no upper bound. Mirrors the deterministic resolver contract in
 * `wave-b1/docs/04_BREAKPOINT_POLICY_SPECIFICATION.md`.
 */
export const PCC_RESPONSIVE_THRESHOLDS_PX: Record<
  Exclude<PccResponsiveMode, 'ultrawide'>,
  number
> = {
  phone: 479,
  tabletPortrait: 768,
  tabletLandscape: 1024,
  smallLaptop: 1180,
  standardLaptop: 1440,
  largeLaptop: 1599,
  desktop: 1919,
};

export function resolveResponsiveMode(inlineSizePx: number): PccResponsiveMode {
  if (inlineSizePx < 480) return 'phone';
  if (inlineSizePx <= 768) return 'tabletPortrait';
  if (inlineSizePx <= 1024) return 'tabletLandscape';
  if (inlineSizePx <= 1180) return 'smallLaptop';
  if (inlineSizePx <= 1440) return 'standardLaptop';
  if (inlineSizePx <= 1599) return 'largeLaptop';
  if (inlineSizePx <= 1919) return 'desktop';
  return 'ultrawide';
}

export function resolveFootprintColumnSpan(
  mode: PccResponsiveMode,
  footprint: PccCardFootprint,
): number {
  return Math.max(
    FOOTPRINT_COLUMN_SPANS[mode][footprint],
    FOOTPRINT_MIN_COLUMN_SPANS[mode][footprint],
  );
}

export type PccCardSpanOverrides = Partial<Record<PccResponsiveMode, number>>;

export type PccCardSpanSource = 'footprint' | 'override';

export interface PccResolvedCardColumnSpan {
  readonly columnSpan: number;
  readonly source: PccCardSpanSource;
  readonly overrideMode?: PccResponsiveMode;
}

/**
 * Resolves a card's column span from (a) its footprint default + minimum and
 * (b) an optional per-mode override.
 *
 * An explicit override for the active mode wins over both
 * `FOOTPRINT_COLUMN_SPANS` and `FOOTPRINT_MIN_COLUMN_SPANS`. This is required
 * so Phase 06 layouts can intentionally place a card narrower than its
 * footprint's global minimum (e.g. a `hero` footprint sized to 3 columns
 * inside a 12-column row). Overrides are integer-truncated and clamped to
 * `[1, columns]`; non-finite values fall back to the footprint span.
 */
export function resolveDashboardCardColumnSpan(
  mode: PccResponsiveMode,
  footprint: PccCardFootprint,
  columns: number,
  spanOverrides?: PccCardSpanOverrides,
): PccResolvedCardColumnSpan {
  const footprintSpan = resolveFootprintColumnSpan(mode, footprint);
  const override = spanOverrides?.[mode];

  if (typeof override !== 'number' || !Number.isFinite(override)) {
    return { columnSpan: footprintSpan, source: 'footprint' };
  }

  const integerOverride = Math.trunc(override);
  const clampedOverride = Math.min(Math.max(integerOverride, 1), columns);

  return {
    columnSpan: clampedOverride,
    source: 'override',
    overrideMode: mode,
  };
}

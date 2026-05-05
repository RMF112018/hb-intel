export const PCC_CARD_FOOTPRINTS = ['hero', 'wide', 'standard', 'compact', 'tall', 'full'] as const;

export type PccCardFootprint = (typeof PCC_CARD_FOOTPRINTS)[number];

export const PCC_RESPONSIVE_MODES = [
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'standardDesktop',
  'wideDesktop',
] as const;

export type PccResponsiveMode = (typeof PCC_RESPONSIVE_MODES)[number];

export const PCC_RESPONSIVE_COLUMNS: Record<PccResponsiveMode, number> = {
  phone: 1,
  tabletPortrait: 2,
  tabletLandscape: 6,
  standardDesktop: 8,
  wideDesktop: 12,
};

export const FOOTPRINT_COLUMN_SPANS: Record<PccResponsiveMode, Record<PccCardFootprint, number>> = {
  wideDesktop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12 },
  standardDesktop: { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 8 },
  tabletLandscape: { hero: 4, wide: 3, standard: 2, compact: 2, tall: 2, full: 6 },
  tabletPortrait: { hero: 2, wide: 2, standard: 1, compact: 1, tall: 1, full: 2 },
  phone: { hero: 1, wide: 1, standard: 1, compact: 1, tall: 1, full: 1 },
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
  wideDesktop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12 },
  standardDesktop: { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 8 },
  tabletLandscape: { hero: 4, wide: 3, standard: 2, compact: 2, tall: 2, full: 6 },
  tabletPortrait: { hero: 2, wide: 2, standard: 2, compact: 1, tall: 1, full: 2 },
  phone: { hero: 1, wide: 1, standard: 1, compact: 1, tall: 1, full: 1 },
};

export const FOOTPRINT_MIN_INLINE_SIZE_PX: Record<
  PccResponsiveMode,
  Record<PccCardFootprint, number>
> = {
  wideDesktop: { hero: 320, wide: 280, standard: 240, compact: 200, tall: 220, full: 320 },
  standardDesktop: { hero: 300, wide: 260, standard: 220, compact: 190, tall: 210, full: 300 },
  tabletLandscape: { hero: 260, wide: 230, standard: 210, compact: 180, tall: 190, full: 260 },
  tabletPortrait: { hero: 220, wide: 200, standard: 200, compact: 168, tall: 168, full: 220 },
  phone: { hero: 0, wide: 0, standard: 0, compact: 0, tall: 0, full: 0 },
};

export const PCC_BENTO_GRID_ROW_UNIT_PX = 8;
export const PCC_BENTO_GRID_GAP_PX = 16;

export const PCC_RESPONSIVE_THRESHOLDS_PX: Record<
  Exclude<PccResponsiveMode, 'wideDesktop'>,
  number
> = {
  phone: 480,
  tabletPortrait: 720,
  tabletLandscape: 1024,
  standardDesktop: 1280,
};

export function resolveResponsiveMode(inlineSizePx: number): PccResponsiveMode {
  if (inlineSizePx < PCC_RESPONSIVE_THRESHOLDS_PX.phone) return 'phone';
  if (inlineSizePx < PCC_RESPONSIVE_THRESHOLDS_PX.tabletPortrait) return 'tabletPortrait';
  if (inlineSizePx < PCC_RESPONSIVE_THRESHOLDS_PX.tabletLandscape) return 'tabletLandscape';
  if (inlineSizePx < PCC_RESPONSIVE_THRESHOLDS_PX.standardDesktop) return 'standardDesktop';
  return 'wideDesktop';
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

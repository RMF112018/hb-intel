export const PCC_CARD_FOOTPRINTS = [
  'hero',
  'wide',
  'standard',
  'compact',
  'tall',
  'full',
] as const;

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

export const FOOTPRINT_COLUMN_SPANS: Record<
  PccResponsiveMode,
  Record<PccCardFootprint, number>
> = {
  wideDesktop: { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12 },
  standardDesktop: { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 8 },
  tabletLandscape: { hero: 4, wide: 3, standard: 2, compact: 2, tall: 2, full: 6 },
  tabletPortrait: { hero: 2, wide: 2, standard: 1, compact: 1, tall: 1, full: 2 },
  phone: { hero: 1, wide: 1, standard: 1, compact: 1, tall: 1, full: 1 },
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

import type { MyWorkResponsiveMode } from './useMyWorkContainerBreakpoint.js';

/**
 * Column counts per responsive mode for the My Work bento grid.
 * Aligned to the B03 dev plan and PCC's layout doctrine (1 / 2 / 6 / 8 / 10 / 12 / 12 / 12).
 */
export const MY_WORK_RESPONSIVE_COLUMNS: Readonly<Record<MyWorkResponsiveMode, number>> =
  Object.freeze({
    phone: 1,
    tabletPortrait: 2,
    tabletLandscape: 6,
    smallLaptop: 8,
    standardLaptop: 10,
    largeLaptop: 12,
    desktop: 12,
    ultrawide: 12,
  });

export const MY_WORK_CARD_FOOTPRINTS = ['full', 'wide', 'standard', 'compact'] as const;
export type MyWorkCardFootprint = (typeof MY_WORK_CARD_FOOTPRINTS)[number];

const FOOTPRINT_COLUMN_SPANS: Readonly<
  Record<MyWorkCardFootprint, Readonly<Record<MyWorkResponsiveMode, number>>>
> = Object.freeze({
  full: {
    phone: 1,
    tabletPortrait: 2,
    tabletLandscape: 6,
    smallLaptop: 8,
    standardLaptop: 10,
    largeLaptop: 12,
    desktop: 12,
    ultrawide: 12,
  },
  wide: {
    phone: 1,
    tabletPortrait: 2,
    tabletLandscape: 6,
    smallLaptop: 6,
    standardLaptop: 7,
    largeLaptop: 8,
    desktop: 8,
    ultrawide: 8,
  },
  standard: {
    phone: 1,
    tabletPortrait: 2,
    tabletLandscape: 3,
    smallLaptop: 4,
    standardLaptop: 4,
    largeLaptop: 4,
    desktop: 4,
    ultrawide: 4,
  },
  compact: {
    phone: 1,
    tabletPortrait: 2,
    tabletLandscape: 3,
    smallLaptop: 3,
    standardLaptop: 3,
    largeLaptop: 3,
    desktop: 3,
    ultrawide: 3,
  },
});

export type MyWorkCardSpanOverrides = Partial<Record<MyWorkResponsiveMode, number>>;

export type MyWorkCardSpanSource = 'footprint' | 'override';

export interface MyWorkResolvedCardColumnSpan {
  readonly columnSpan: number;
  readonly source: MyWorkCardSpanSource;
  readonly overrideMode?: MyWorkResponsiveMode;
}

function clampToColumns(span: number, columns: number): number {
  const upper = Math.max(columns, 1);
  return Math.min(Math.max(span, 1), upper);
}

/** Look up the footprint's per-mode span and clamp it to `[1, columns]`. */
export function resolveMyWorkFootprintColumnSpan(
  mode: MyWorkResponsiveMode,
  footprint: MyWorkCardFootprint,
): number {
  const raw = FOOTPRINT_COLUMN_SPANS[footprint][mode];
  return clampToColumns(raw, MY_WORK_RESPONSIVE_COLUMNS[mode]);
}

/**
 * Resolve a card's column span for the given mode, honoring an optional
 * per-mode override. Non-finite or missing overrides fall back to the
 * footprint table. Finite overrides are truncated to integer and clamped
 * to `[1, columns]`.
 */
export function resolveMyWorkCardColumnSpan(
  mode: MyWorkResponsiveMode,
  footprint: MyWorkCardFootprint,
  columns: number,
  overrides?: MyWorkCardSpanOverrides,
): MyWorkResolvedCardColumnSpan {
  const footprintSpan = clampToColumns(FOOTPRINT_COLUMN_SPANS[footprint][mode], columns);
  const override = overrides?.[mode];
  if (typeof override !== 'number' || !Number.isFinite(override)) {
    return { columnSpan: footprintSpan, source: 'footprint' };
  }
  const integer = Math.trunc(override);
  return {
    columnSpan: clampToColumns(integer, columns),
    source: 'override',
    overrideMode: mode,
  };
}

import { describe, expect, it } from 'vitest';
import {
  MY_WORK_RESPONSIVE_COLUMNS,
  MY_WORK_CARD_FOOTPRINTS,
  resolveMyWorkCardColumnSpan,
  resolveMyWorkFootprintColumnSpan,
  type MyWorkCardFootprint,
} from './myWorkFootprints.js';
import { MY_WORK_RESPONSIVE_MODES } from './useMyWorkContainerBreakpoint.js';

describe('MY_WORK_RESPONSIVE_COLUMNS', () => {
  it('matches the prompt-locked column ladder for all 8 modes', () => {
    expect(MY_WORK_RESPONSIVE_COLUMNS).toEqual({
      phone: 1,
      tabletPortrait: 2,
      tabletLandscape: 6,
      smallLaptop: 8,
      standardLaptop: 10,
      largeLaptop: 12,
      desktop: 12,
      ultrawide: 12,
    });
  });
});

describe('resolveMyWorkFootprintColumnSpan', () => {
  it('returns a span within [1, columns] for every (mode, footprint) pair', () => {
    for (const mode of MY_WORK_RESPONSIVE_MODES) {
      const columns = MY_WORK_RESPONSIVE_COLUMNS[mode];
      for (const footprint of MY_WORK_CARD_FOOTPRINTS) {
        const span = resolveMyWorkFootprintColumnSpan(mode, footprint);
        expect(span).toBeGreaterThanOrEqual(1);
        expect(span).toBeLessThanOrEqual(columns);
        expect(Number.isInteger(span)).toBe(true);
      }
    }
  });

  it('returns the expected B03 choreography for the home ready and non-ready cases', () => {
    // Home ready: Work Summary 4 + Adobe wide 8 = 12 on desktop.
    expect(resolveMyWorkFootprintColumnSpan('desktop', 'standard')).toBe(4);
    expect(resolveMyWorkFootprintColumnSpan('desktop', 'wide')).toBe(8);
    // Home non-ready: 3 + 6 + 3 spans on desktop = 12.
    expect(resolveMyWorkFootprintColumnSpan('desktop', 'compact')).toBe(3);
    // Phone stacks to a single column for every footprint.
    for (const footprint of MY_WORK_CARD_FOOTPRINTS) {
      expect(resolveMyWorkFootprintColumnSpan('phone', footprint)).toBe(1);
    }
    // standardLaptop wide is 7 columns.
    expect(resolveMyWorkFootprintColumnSpan('standardLaptop', 'wide')).toBe(7);
  });
});

describe('resolveMyWorkCardColumnSpan — override semantics', () => {
  const footprint: MyWorkCardFootprint = 'standard';

  it('returns footprint source when no override is provided', () => {
    expect(resolveMyWorkCardColumnSpan('desktop', footprint, 12)).toEqual({
      columnSpan: 4,
      source: 'footprint',
    });
  });

  it('returns footprint source when override is undefined for the queried mode', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { phone: 1 }),
    ).toEqual({ columnSpan: 4, source: 'footprint' });
  });

  it('returns the override (integer truncate, clamped) for finite values', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: 6 }),
    ).toEqual({ columnSpan: 6, source: 'override', overrideMode: 'desktop' });
  });

  it('truncates fractional overrides toward zero', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: 3.9 }),
    ).toEqual({ columnSpan: 3, source: 'override', overrideMode: 'desktop' });
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: 5.999 }),
    ).toEqual({ columnSpan: 5, source: 'override', overrideMode: 'desktop' });
  });

  it('clamps oversized overrides to the column count', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: 999 }),
    ).toEqual({ columnSpan: 12, source: 'override', overrideMode: 'desktop' });
  });

  it('clamps negative or zero overrides to a minimum of 1', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: -5 }),
    ).toEqual({ columnSpan: 1, source: 'override', overrideMode: 'desktop' });
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: 0 }),
    ).toEqual({ columnSpan: 1, source: 'override', overrideMode: 'desktop' });
  });

  it('falls back to the footprint when override is NaN or non-finite', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: Number.NaN }),
    ).toEqual({ columnSpan: 4, source: 'footprint' });
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: Number.POSITIVE_INFINITY }),
    ).toEqual({ columnSpan: 4, source: 'footprint' });
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { desktop: Number.NEGATIVE_INFINITY }),
    ).toEqual({ columnSpan: 4, source: 'footprint' });
  });

  it('ignores overrides keyed to a different mode', () => {
    expect(
      resolveMyWorkCardColumnSpan('desktop', footprint, 12, { phone: 6, tabletPortrait: 6 }),
    ).toEqual({ columnSpan: 4, source: 'footprint' });
  });

  it('clamps even when the footprint table value would exceed the passed-in columns', () => {
    // Pretend the grid was instantiated with fewer columns than the table allows.
    expect(resolveMyWorkCardColumnSpan('desktop', 'wide', 4)).toEqual({
      columnSpan: 4,
      source: 'footprint',
    });
  });
});

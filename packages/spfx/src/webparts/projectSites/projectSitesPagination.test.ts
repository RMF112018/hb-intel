import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGE_SIZE_BY_MODE,
  buildPageWindow,
  buildPaginationResetSignature,
  filtersSignature,
  pageSizeForMode,
  paginate,
} from './projectSitesPagination.js';

describe('paginate', () => {
  it('returns the requested page slice with truthful range', () => {
    const items = Array.from({ length: 50 }, (_, i) => i + 1);
    const result = paginate(items, 2, 10);

    expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(5);
    expect(result.totalItems).toBe(50);
    expect(result.range).toEqual([11, 20]);
  });

  it('clamps a stale page index beyond totalPages back to the last page', () => {
    // Search shrunk the result set from 50 to 7; the page index of 5
    // (valid before the search) must clamp to 1 (the only page now).
    const items = Array.from({ length: 7 }, (_, i) => i + 1);
    const result = paginate(items, 5, 10);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(7);
    expect(result.range).toEqual([1, 7]);
  });

  it('clamps a sub-1 page index up to 1', () => {
    const items = [1, 2, 3];
    const result = paginate(items, 0, 10);
    expect(result.page).toBe(1);
  });

  it('returns a coherent empty result when the input is empty', () => {
    const result = paginate<number>([], 1, 10);
    expect(result.items).toEqual([]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(0);
    expect(result.range).toEqual([0, 0]);
  });

  it('handles a final partial page correctly', () => {
    const items = Array.from({ length: 23 }, (_, i) => i + 1);
    const result = paginate(items, 3, 10);

    expect(result.items).toEqual([21, 22, 23]);
    expect(result.range).toEqual([21, 23]);
    expect(result.totalPages).toBe(3);
  });

  it('coerces non-positive page sizes to a safe minimum of 1', () => {
    const items = [1, 2, 3];
    const result = paginate(items, 1, 0);
    expect(result.totalPages).toBe(3);
    expect(result.items).toEqual([1]);
  });
});

describe('pageSizeForMode', () => {
  it('returns layout-aware page sizes', () => {
    expect(pageSizeForMode('wide')).toBe(24);
    expect(pageSizeForMode('medium')).toBe(18);
    expect(pageSizeForMode('compact')).toBe(12);
  });

  it('exposes a stable lookup table for consumers that need the full map', () => {
    expect(DEFAULT_PAGE_SIZE_BY_MODE).toMatchObject({
      wide: 24,
      medium: 18,
      compact: 12,
    });
  });
});

describe('filtersSignature', () => {
  it('produces the same signature regardless of array order (sort-stable)', () => {
    const a = filtersSignature({
      stages: ['Active', 'Bidding'],
      projectManagerUpns: [],
      leadEstimatorUpns: [],
      projectExecutiveUpns: [],
      departments: [],
      officeDivisions: [],
      sourceClassifications: [],
      hasSiteOnly: undefined,
    });
    const b = filtersSignature({
      stages: ['Bidding', 'Active'],
      projectManagerUpns: [],
      leadEstimatorUpns: [],
      projectExecutiveUpns: [],
      departments: [],
      officeDivisions: [],
      sourceClassifications: [],
      hasSiteOnly: undefined,
    });
    expect(a).toBe(b);
  });

  it('encodes hasSiteOnly tri-state distinctly', () => {
    const base = {
      stages: [],
      projectManagerUpns: [],
      leadEstimatorUpns: [],
      projectExecutiveUpns: [],
      departments: [],
      officeDivisions: [],
      sourceClassifications: [],
    };
    const undef = filtersSignature({ ...base, hasSiteOnly: undefined });
    const yes = filtersSignature({ ...base, hasSiteOnly: true });
    const no = filtersSignature({ ...base, hasSiteOnly: false });
    expect(new Set([undef, yes, no]).size).toBe(3);
  });
});

describe('buildPaginationResetSignature', () => {
  it('changes when any pipeline input changes', () => {
    const base = {
      entriesIdentity: {} as unknown,
      searchTerm: '',
      sortKey: 'number-asc',
      filtersSignature: 'a',
      scopeKey: 'all',
    };
    const original = buildPaginationResetSignature(base);
    expect(buildPaginationResetSignature({ ...base, searchTerm: 'foo' })).not.toBe(original);
    expect(buildPaginationResetSignature({ ...base, sortKey: 'name-asc' })).not.toBe(original);
    expect(buildPaginationResetSignature({ ...base, filtersSignature: 'b' })).not.toBe(original);
    expect(buildPaginationResetSignature({ ...base, scopeKey: 'year:2025' })).not.toBe(original);
  });
});

describe('buildPageWindow', () => {
  it('returns a single-page window when totalPages <= 1', () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
    expect(buildPageWindow(1, 0)).toEqual([1]);
  });

  it('returns the full sequence when totalPages fits within maxButtons', () => {
    expect(buildPageWindow(3, 5, 7)).toEqual([1, 2, 3, 4, 5]);
  });

  it('inserts ellipses around the current page in long sequences', () => {
    const window = buildPageWindow(10, 20, 7);
    expect(window[0]).toBe(1);
    expect(window[window.length - 1]).toBe(20);
    expect(window).toContain('…');
    expect(window).toContain(10);
  });

  it('omits the leading ellipsis when current page is near the start', () => {
    const window = buildPageWindow(2, 20, 7);
    expect(window[0]).toBe(1);
    expect(window[1]).not.toBe('…');
    expect(window[window.length - 1]).toBe(20);
  });

  it('omits the trailing ellipsis when current page is near the end', () => {
    const window = buildPageWindow(19, 20, 7);
    expect(window[0]).toBe(1);
    expect(window[window.length - 1]).toBe(20);
    expect(window[window.length - 2]).not.toBe('…');
  });
});

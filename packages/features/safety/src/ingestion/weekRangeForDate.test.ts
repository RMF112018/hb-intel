import { describe, expect, it } from 'vitest';
import { isDateInRange, weekRangeForDate } from './weekRangeForDate.js';

describe('weekRangeForDate', () => {
  it('returns Monday..Sunday for a Wednesday', () => {
    const r = weekRangeForDate('2026-04-22'); // Wednesday
    expect(r.weekStartDate).toBe('2026-04-20');
    expect(r.weekEndDate).toBe('2026-04-26');
  });

  it('handles a Sunday as the last day of the week', () => {
    const r = weekRangeForDate('2026-04-26'); // Sunday
    expect(r.weekStartDate).toBe('2026-04-20');
    expect(r.weekEndDate).toBe('2026-04-26');
  });

  it('handles a Monday as the first day of the week', () => {
    const r = weekRangeForDate('2026-04-20'); // Monday
    expect(r.weekStartDate).toBe('2026-04-20');
    expect(r.weekEndDate).toBe('2026-04-26');
  });
});

describe('isDateInRange', () => {
  const range = { weekStartDate: '2026-04-20', weekEndDate: '2026-04-26' };
  it('accepts dates within the range', () => {
    expect(isDateInRange('2026-04-20', range)).toBe(true);
    expect(isDateInRange('2026-04-23', range)).toBe(true);
    expect(isDateInRange('2026-04-26', range)).toBe(true);
  });
  it('rejects dates outside the range', () => {
    expect(isDateInRange('2026-04-19', range)).toBe(false);
    expect(isDateInRange('2026-04-27', range)).toBe(false);
  });
});

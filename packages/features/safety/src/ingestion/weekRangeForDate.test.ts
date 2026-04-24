import { describe, expect, it } from 'vitest';
import { isDateInRange, weekRangeForDate } from './weekRangeForDate.js';

describe('weekRangeForDate', () => {
  it('returns Monday..Friday for a Wednesday', () => {
    const r = weekRangeForDate('2026-04-22'); // Wednesday
    expect(r.weekStartDate).toBe('2026-04-20');
    expect(r.weekEndDate).toBe('2026-04-24');
  });

  it('handles a Sunday as belonging to the prior Monday-Friday week', () => {
    const r = weekRangeForDate('2026-04-26'); // Sunday
    expect(r.weekStartDate).toBe('2026-04-20');
    expect(r.weekEndDate).toBe('2026-04-24');
  });

  it('handles a Monday as the first day of the week', () => {
    const r = weekRangeForDate('2026-04-20'); // Monday
    expect(r.weekStartDate).toBe('2026-04-20');
    expect(r.weekEndDate).toBe('2026-04-24');
  });
});

describe('isDateInRange', () => {
  const range = { weekStartDate: '2026-04-20', weekEndDate: '2026-04-24' };
  it('accepts dates within the range', () => {
    expect(isDateInRange('2026-04-20', range)).toBe(true);
    expect(isDateInRange('2026-04-23', range)).toBe(true);
    expect(isDateInRange('2026-04-24', range)).toBe(true);
  });
  it('rejects dates outside the range', () => {
    expect(isDateInRange('2026-04-19', range)).toBe(false);
    expect(isDateInRange('2026-04-25', range)).toBe(false);
  });
});

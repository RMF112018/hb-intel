import { describe, expect, it } from 'vitest';
import { humaniseAge } from './humaniseAge.js';

const NOW = new Date('2026-04-14T15:00:00Z');

describe('humaniseAge', () => {
  it('returns em-dash for undefined / invalid input', () => {
    expect(humaniseAge(undefined, NOW)).toBe('—');
    expect(humaniseAge('not a date', NOW)).toBe('—');
  });

  it('returns "just now" for deltas under a minute', () => {
    expect(humaniseAge('2026-04-14T14:59:30Z', NOW)).toBe('just now');
  });

  it('returns minute counts under an hour', () => {
    expect(humaniseAge('2026-04-14T14:58:00Z', NOW)).toBe('2m');
    expect(humaniseAge('2026-04-14T14:01:00Z', NOW)).toBe('59m');
  });

  it('returns hour counts under a day', () => {
    expect(humaniseAge('2026-04-14T12:00:00Z', NOW)).toBe('3h');
    expect(humaniseAge('2026-04-13T16:00:00Z', NOW)).toBe('23h');
  });

  it('returns "yesterday" when the date is the previous calendar day', () => {
    expect(humaniseAge('2026-04-13T10:00:00Z', NOW)).toBe('yesterday');
  });

  it('returns month + day for older dates in the same year', () => {
    expect(humaniseAge('2026-03-12T10:00:00Z', NOW)).toBe('Mar 12');
  });

  it('includes the year for dates in a different year', () => {
    expect(humaniseAge('2025-02-03T10:00:00Z', NOW)).toBe('Feb 3 2025');
  });

  it('falls back to absolute date for clock-skew future timestamps', () => {
    expect(humaniseAge('2026-05-01T10:00:00Z', NOW)).toBe('May 1');
  });
});

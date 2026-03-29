import { describe, expect, it, vi, afterEach } from 'vitest';
import { isValidYear, resolveDefaultYear } from './types.js';

describe('isValidYear', () => {
  it('accepts typical 4-digit years', () => {
    expect(isValidYear(2024)).toBe(true);
    expect(isValidYear(2026)).toBe(true);
    expect(isValidYear(2000)).toBe(true);
  });

  it('accepts boundary years', () => {
    expect(isValidYear(1900)).toBe(true);
    expect(isValidYear(2100)).toBe(true);
  });

  it('rejects years below minimum', () => {
    expect(isValidYear(1899)).toBe(false);
    expect(isValidYear(0)).toBe(false);
    expect(isValidYear(-1)).toBe(false);
  });

  it('rejects years above maximum', () => {
    expect(isValidYear(2101)).toBe(false);
    expect(isValidYear(99999)).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(isValidYear(2024.5)).toBe(false);
    expect(isValidYear(NaN)).toBe(false);
    expect(isValidYear(Infinity)).toBe(false);
  });
});

describe('resolveDefaultYear', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null for empty array', () => {
    expect(resolveDefaultYear([])).toBeNull();
  });

  it('returns current calendar year if present in list', () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear + 1, currentYear, currentYear - 1];
    expect(resolveDefaultYear(years)).toBe(currentYear);
  });

  it('returns the first (most recent) year if current year is not in list', () => {
    // Use years that are definitely not the current year
    const years = [2099, 2098, 2097];
    expect(resolveDefaultYear(years)).toBe(2099);
  });

  it('returns the only year if list has one element', () => {
    expect(resolveDefaultYear([2025])).toBe(2025);
  });
});

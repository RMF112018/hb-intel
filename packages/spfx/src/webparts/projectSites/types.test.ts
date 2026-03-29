import { describe, expect, it } from 'vitest';
import { isValidYear, MIN_VALID_YEAR, MAX_VALID_YEAR } from './types.js';

describe('isValidYear', () => {
  it('accepts typical 4-digit years', () => {
    expect(isValidYear(2024)).toBe(true);
    expect(isValidYear(2026)).toBe(true);
    expect(isValidYear(2000)).toBe(true);
  });

  it('accepts boundary years', () => {
    expect(isValidYear(MIN_VALID_YEAR)).toBe(true);
    expect(isValidYear(MAX_VALID_YEAR)).toBe(true);
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

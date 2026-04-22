import { describe, expect, it } from 'vitest';
import { excelSerialToYmd, normalizeInspectionDate } from './dateNormalization.js';

describe('normalizeInspectionDate', () => {
  it('passes through ISO YYYY-MM-DD', () => {
    expect(normalizeInspectionDate('2026-04-22')).toBe('2026-04-22');
  });

  it('parses ISO with time/timezone suffix', () => {
    expect(normalizeInspectionDate('2026-04-22T13:00:00Z')).toBe('2026-04-22');
    expect(normalizeInspectionDate('2026-04-22T13:00:00-04:00')).toBe('2026-04-22');
  });

  it('parses US short dates M/D/YYYY', () => {
    expect(normalizeInspectionDate('4/22/2026')).toBe('2026-04-22');
    expect(normalizeInspectionDate('04/22/2026')).toBe('2026-04-22');
    expect(normalizeInspectionDate('12/31/2025')).toBe('2025-12-31');
  });

  it('parses YYYY/MM/DD', () => {
    expect(normalizeInspectionDate('2026/04/22')).toBe('2026-04-22');
  });

  it('parses Date objects using UTC components', () => {
    const d = new Date(Date.UTC(2026, 3, 22));
    expect(normalizeInspectionDate(d)).toBe('2026-04-22');
  });

  it('parses Excel serial numbers with Feb-29-1900 skip', () => {
    // Serial 1 = 1900-01-01 (per Excel's buggy convention).
    // Serial 60 is the phantom Feb-29-1900; Excel treats serial 61 as 1900-03-01.
    // Our helper adjusts so `excelSerialToYmd(61)` should be '1900-03-01'.
    expect(excelSerialToYmd(61)).toBe('1900-03-01');
    // Modern serial sanity check.
    expect(excelSerialToYmd(46134)).toBe('2026-04-22');
  });

  it('returns null on unparseable input', () => {
    expect(normalizeInspectionDate('not a date')).toBeNull();
    expect(normalizeInspectionDate('')).toBeNull();
    expect(normalizeInspectionDate(null)).toBeNull();
  });
});

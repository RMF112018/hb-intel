import { describe, expect, it } from 'vitest';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { resolvePageYear } from './resolvePageYear.js';

// ── Mock context factory ──────────────────────────────────────────────────

function createMockContext(
  fieldValues?: Record<string, unknown> | undefined,
): WebPartContext {
  return {
    pageContext: {
      listItem: fieldValues !== undefined ? { fieldValues } : undefined,
    },
  } as unknown as WebPartContext;
}

// ── Property pane override ────────────────────────────────────────────────

describe('resolvePageYear — property pane override', () => {
  it('returns resolved when override is a valid year', () => {
    const result = resolvePageYear(createMockContext(), 2026);
    expect(result).toEqual({
      kind: 'resolved',
      year: 2026,
      source: 'property-pane',
    });
  });

  it('rounds fractional override to nearest integer', () => {
    const result = resolvePageYear(createMockContext(), 2026.7);
    expect(result).toEqual({
      kind: 'resolved',
      year: 2027,
      source: 'property-pane',
    });
  });

  it('returns invalid when override is out of range (too high)', () => {
    const result = resolvePageYear(createMockContext(), 99999);
    expect(result).toEqual({
      kind: 'invalid',
      rawValue: 99999,
      source: 'property-pane',
    });
  });

  it('returns invalid when override is out of range (too low but positive)', () => {
    const result = resolvePageYear(createMockContext(), 3);
    expect(result).toEqual({
      kind: 'invalid',
      rawValue: 3,
      source: 'property-pane',
    });
  });

  it('falls through to page metadata when override is 0', () => {
    const result = resolvePageYear(createMockContext(), 0);
    expect(result.kind).toBe('missing');
  });

  it('falls through to page metadata when override is negative', () => {
    const result = resolvePageYear(createMockContext(), -1);
    expect(result.kind).toBe('missing');
  });
});

// ── Page metadata resolution ──────────────────────────────────────────────

describe('resolvePageYear — page metadata', () => {
  it('resolves a valid numeric Year from page metadata', () => {
    const result = resolvePageYear(createMockContext({ Year: 2025 }), 0);
    expect(result).toEqual({
      kind: 'resolved',
      year: 2025,
      source: 'page-metadata',
    });
  });

  it('coerces a string year from page metadata', () => {
    const result = resolvePageYear(createMockContext({ Year: '2024' }), 0);
    expect(result).toEqual({
      kind: 'resolved',
      year: 2024,
      source: 'page-metadata',
    });
  });

  it('returns invalid for out-of-range numeric year from page metadata', () => {
    const result = resolvePageYear(createMockContext({ Year: 50000 }), 0);
    expect(result).toEqual({
      kind: 'invalid',
      rawValue: 50000,
      source: 'page-metadata',
    });
  });

  it('returns invalid for non-numeric string from page metadata', () => {
    const result = resolvePageYear(createMockContext({ Year: 'abc' }), 0);
    expect(result).toEqual({
      kind: 'invalid',
      rawValue: 'abc',
      source: 'page-metadata',
    });
  });

  it('returns invalid for 0 from page metadata', () => {
    const result = resolvePageYear(createMockContext({ Year: 0 }), 0);
    expect(result).toEqual({
      kind: 'invalid',
      rawValue: 0,
      source: 'page-metadata',
    });
  });

  it('returns missing when Year is null', () => {
    const result = resolvePageYear(createMockContext({ Year: null }), 0);
    expect(result.kind).toBe('missing');
  });

  it('returns missing when Year is undefined', () => {
    const result = resolvePageYear(createMockContext({ Year: undefined }), 0);
    expect(result.kind).toBe('missing');
  });

  it('returns missing when fieldValues has no Year key', () => {
    const result = resolvePageYear(createMockContext({ Title: 'Test Page' }), 0);
    expect(result.kind).toBe('missing');
  });

  it('returns missing when listItem is absent', () => {
    const result = resolvePageYear(createMockContext(undefined), 0);
    expect(result.kind).toBe('missing');
  });

  it('handles whitespace-padded string year', () => {
    const result = resolvePageYear(createMockContext({ Year: '  2025  ' }), 0);
    expect(result).toEqual({
      kind: 'resolved',
      year: 2025,
      source: 'page-metadata',
    });
  });

  it('returns invalid for empty string Year (field present but valueless)', () => {
    const result = resolvePageYear(createMockContext({ Year: '' }), 0);
    // Empty string is present but not a valid year — treated as invalid, not missing
    expect(result.kind).toBe('invalid');
  });
});

// ── Priority: property pane overrides page metadata ───────────────────────

describe('resolvePageYear — priority', () => {
  it('property pane override takes priority over page metadata', () => {
    const result = resolvePageYear(createMockContext({ Year: 2025 }), 2026);
    expect(result).toEqual({
      kind: 'resolved',
      year: 2026,
      source: 'property-pane',
    });
  });
});

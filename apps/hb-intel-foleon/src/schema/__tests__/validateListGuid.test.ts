import { describe, expect, it } from 'vitest';
import {
  FoleonSchemaError,
  assertValidListGuid,
  isValidListGuid,
} from '../validateListGuid.js';

describe('assertValidListGuid', () => {
  it('throws missing-list-guid on undefined / empty / whitespace', () => {
    for (const bad of [undefined, null, '', '   ']) {
      try {
        assertValidListGuid(bad, 'HB_FoleonContentRegistry');
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(FoleonSchemaError);
        expect((err as FoleonSchemaError).code).toBe('missing-list-guid');
        expect((err as FoleonSchemaError).listRole).toBe('HB_FoleonContentRegistry');
      }
    }
  });

  it('throws invalid-list-guid on malformed input', () => {
    for (const bad of ['not-a-guid', '123', '11111111-1111-1111-1111']) {
      try {
        assertValidListGuid(bad, 'HB_FoleonHomepagePlacements');
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(FoleonSchemaError);
        expect((err as FoleonSchemaError).code).toBe('invalid-list-guid');
      }
    }
  });

  it('accepts a well-formed GUID regardless of case and trims whitespace', () => {
    expect(() =>
      assertValidListGuid('11111111-1111-1111-1111-111111111111', 'HB_FoleonContentRegistry'),
    ).not.toThrow();
    expect(() =>
      assertValidListGuid('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', 'HB_FoleonContentRegistry'),
    ).not.toThrow();
    expect(() =>
      assertValidListGuid('  11111111-1111-1111-1111-111111111111  ', 'HB_FoleonContentRegistry'),
    ).not.toThrow();
  });
});

describe('isValidListGuid', () => {
  it('returns true for a well-formed GUID', () => {
    expect(isValidListGuid('11111111-1111-1111-1111-111111111111')).toBe(true);
  });
  it('returns false for missing or malformed input', () => {
    expect(isValidListGuid(undefined)).toBe(false);
    expect(isValidListGuid('')).toBe(false);
    expect(isValidListGuid('not-a-guid')).toBe(false);
  });
});

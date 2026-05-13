import { describe, expect, it } from 'vitest';
import {
  normalizeUpn,
  normalizeUpnArray,
  parseUpnArrayStorage,
  serializeUpnArrayStorage,
} from './MyProjectUpnNormalization.js';

describe('MyProjectUpnNormalization', () => {
  it('normalizes casing and whitespace for single UPN values', () => {
    expect(normalizeUpn('  USER@Example.COM  ')).toBe('user@example.com');
  });

  it('rejects invalid tokens for single-value normalization', () => {
    expect(normalizeUpn('not-an-email')).toBeNull();
    expect(normalizeUpn('')).toBeNull();
    expect(normalizeUpn(42)).toBeNull();
  });

  it('deduplicates and sorts normalized arrays', () => {
    expect(normalizeUpnArray(['B@x.com', 'a@x.com', 'a@x.com', ' bad '])).toEqual([
      'a@x.com',
      'b@x.com',
    ]);
  });

  it('parses valid JSON array storage', () => {
    expect(parseUpnArrayStorage('["A@x.com", "b@x.com", "a@x.com"]')).toEqual([
      'a@x.com',
      'b@x.com',
    ]);
  });

  it('parses comma-delimited migration text', () => {
    expect(parseUpnArrayStorage('a@x.com, B@x.com,invalid')).toEqual(['a@x.com', 'b@x.com']);
  });

  it('parses semicolon-delimited migration text', () => {
    expect(parseUpnArrayStorage('a@x.com; B@x.com ;invalid')).toEqual(['a@x.com', 'b@x.com']);
  });

  it('supports materialized arrays from adapters', () => {
    expect(parseUpnArrayStorage(['b@x.com', 'A@x.com', 'A@x.com'])).toEqual(['a@x.com', 'b@x.com']);
  });

  it('handles null/undefined as empty arrays', () => {
    expect(parseUpnArrayStorage(null)).toEqual([]);
    expect(parseUpnArrayStorage(undefined)).toEqual([]);
  });

  it('salvages bracketed pseudo-json text when practical', () => {
    expect(parseUpnArrayStorage("['A@x.com', 'b@x.com', invalid]")).toEqual(['a@x.com', 'b@x.com']);
  });

  it('serializes deterministically as canonical JSON array text', () => {
    expect(serializeUpnArrayStorage(['B@x.com', 'a@x.com', 'a@x.com', 'invalid'])).toBe('["a@x.com","b@x.com"]');
    expect(serializeUpnArrayStorage(null)).toBe('[]');
  });
});

import { describe, expect, it } from 'vitest';

import {
  parseCachedJsonSnapshot,
  stringifyCachedJsonSnapshot,
} from '../adobe-sign-cache/repositories/cache-snapshot-codec.js';

describe('stringifyCachedJsonSnapshot', () => {
  it('wraps the payload in a { schemaVersion, payload } envelope', () => {
    const raw = stringifyCachedJsonSnapshot({ hello: 'world' }, 1);
    expect(JSON.parse(raw)).toEqual({ schemaVersion: 1, payload: { hello: 'world' } });
  });

  it('throws RangeError for zero / negative / non-integer schemaVersion', () => {
    expect(() => stringifyCachedJsonSnapshot({}, 0)).toThrow(RangeError);
    expect(() => stringifyCachedJsonSnapshot({}, -1)).toThrow(RangeError);
    expect(() => stringifyCachedJsonSnapshot({}, 1.5)).toThrow(RangeError);
  });
});

describe('parseCachedJsonSnapshot', () => {
  it('round-trips a payload through stringify + parse', () => {
    const raw = stringifyCachedJsonSnapshot({ a: 1, b: ['x'] }, 1);
    const result = parseCachedJsonSnapshot<{ a: number; b: string[] }>(raw, 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload).toEqual({ a: 1, b: ['x'] });
      expect(result.schemaVersion).toBe(1);
    }
  });

  it("returns 'empty' for null / undefined / empty string", () => {
    expect(parseCachedJsonSnapshot(null, 1).ok).toBe(false);
    expect(parseCachedJsonSnapshot(undefined, 1).ok).toBe(false);
    expect(parseCachedJsonSnapshot('', 1).ok).toBe(false);
    const r = parseCachedJsonSnapshot(null, 1);
    if (!r.ok) expect(r.reason).toBe('empty');
  });

  it("returns 'parse-error' for malformed JSON without throwing", () => {
    const result = parseCachedJsonSnapshot('not json {', 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('parse-error');
  });

  it("returns 'envelope-shape-invalid' for an array root", () => {
    const result = parseCachedJsonSnapshot('[1,2]', 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('envelope-shape-invalid');
  });

  it("returns 'missing-schema-version' when schemaVersion is absent or non-positive-integer", () => {
    expect(
      parseCachedJsonSnapshot(JSON.stringify({ payload: {} }), 1).ok,
    ).toBe(false);
    expect(
      parseCachedJsonSnapshot(JSON.stringify({ schemaVersion: '1', payload: {} }), 1).ok,
    ).toBe(false);
    expect(
      parseCachedJsonSnapshot(JSON.stringify({ schemaVersion: 0, payload: {} }), 1).ok,
    ).toBe(false);
    expect(
      parseCachedJsonSnapshot(JSON.stringify({ schemaVersion: 1.5, payload: {} }), 1).ok,
    ).toBe(false);
  });

  it("returns 'schema-version-mismatch' when versions disagree", () => {
    const raw = stringifyCachedJsonSnapshot({}, 2);
    const result = parseCachedJsonSnapshot(raw, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('schema-version-mismatch');
  });

  it("returns 'envelope-shape-invalid' when payload key is missing", () => {
    const raw = JSON.stringify({ schemaVersion: 1 });
    const result = parseCachedJsonSnapshot(raw, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('envelope-shape-invalid');
  });

  it('runs the optional payload validator and rejects on validator=false', () => {
    const raw = stringifyCachedJsonSnapshot({ x: 1 }, 1);
    const result = parseCachedJsonSnapshot<{ x: number }>(
      raw,
      1,
      (value): value is { x: number } =>
        typeof value === 'object' && value !== null && (value as { x?: unknown }).x === 'expected',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('payload-shape-invalid');
  });
});

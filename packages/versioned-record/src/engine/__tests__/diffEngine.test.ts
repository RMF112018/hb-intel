// src/engine/__tests__/diffEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeDiff,
  computeCharDiff,
  formatNumericDelta,
  flattenRecord,
  classifyChange,
  valuesAreEqual,
  serializeValue,
  humanizeFieldPath,
} from '../diffEngine';

// ---------------------------------------------------------------------------
// flattenRecord
// ---------------------------------------------------------------------------
describe('flattenRecord', () => {
  it('flattens a shallow record', () => {
    const flat = flattenRecord({ a: 1, b: 'hello' });
    expect(flat.get('a')).toBe(1);
    expect(flat.get('b')).toBe('hello');
  });

  it('flattens nested objects with dot notation', () => {
    const flat = flattenRecord({ scoring: { totalScore: 42 } });
    expect(flat.get('scoring.totalScore')).toBe(42);
  });

  it('flattens arrays with bracket notation', () => {
    const flat = flattenRecord({ items: ['a', 'b', 'c'] });
    expect(flat.get('items[0]')).toBe('a');
    expect(flat.get('items[2]')).toBe('c');
  });

  it('handles null and undefined values', () => {
    const flat = flattenRecord({ a: null, b: undefined });
    expect(flat.get('a')).toBeNull();
    expect(flat.get('b')).toBeUndefined();
  });

  it('handles deeply nested arrays of objects', () => {
    const flat = flattenRecord({ team: [{ name: 'Alice' }, { name: 'Bob' }] });
    expect(flat.get('team[0].name')).toBe('Alice');
    expect(flat.get('team[1].name')).toBe('Bob');
  });

  it('handles arrays with null and undefined values', () => {
    const flat = flattenRecord({ items: [null, undefined, 'value'] });
    expect(flat.get('items[0]')).toBeNull();
    expect(flat.get('items[1]')).toBeUndefined();
    expect(flat.get('items[2]')).toBe('value');
  });

  it('handles nested arrays inside arrays', () => {
    const flat = flattenRecord({ matrix: [[1, 2], [3, 4]] });
    expect(flat.get('matrix[0][0]')).toBe(1);
    expect(flat.get('matrix[1][1]')).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// classifyChange
// ---------------------------------------------------------------------------
describe('classifyChange', () => {
  it('returns "added" when previous is undefined', () => {
    expect(classifyChange(undefined, 'value')).toBe('added');
  });
  it('returns "removed" when current is undefined', () => {
    expect(classifyChange('value', undefined)).toBe('removed');
  });
  it('returns null for equal primitives', () => {
    expect(classifyChange(42, 42)).toBeNull();
    expect(classifyChange('abc', 'abc')).toBeNull();
  });
  it('returns "modified" for changed primitives', () => {
    expect(classifyChange(42, 67)).toBe('modified');
    expect(classifyChange('old', 'new')).toBe('modified');
  });
  it('returns null for both null', () => {
    expect(classifyChange(null, null)).toBeNull();
  });
  it('returns "modified" for null → value transition', () => {
    expect(classifyChange(null, 'value')).toBe('modified');
  });
});

// ---------------------------------------------------------------------------
// valuesAreEqual
// ---------------------------------------------------------------------------
describe('valuesAreEqual', () => {
  it('returns true for identical primitives', () => {
    expect(valuesAreEqual(1, 1)).toBe(true);
    expect(valuesAreEqual('a', 'a')).toBe(true);
    expect(valuesAreEqual(null, null)).toBe(true);
  });
  it('returns false for different primitives', () => {
    expect(valuesAreEqual(1, 2)).toBe(false);
  });
  it('returns true for deeply equal objects', () => {
    expect(valuesAreEqual({ a: 1 }, { a: 1 })).toBe(true);
  });
  it('returns false for objects with different values', () => {
    expect(valuesAreEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatNumericDelta
// ---------------------------------------------------------------------------
describe('formatNumericDelta', () => {
  it('returns positive delta string', () => {
    expect(formatNumericDelta(42, 67)).toBe('+25');
  });
  it('returns negative delta string', () => {
    expect(formatNumericDelta(67, 42)).toBe('-25');
  });
  it('returns +0 for equal values', () => {
    expect(formatNumericDelta(5, 5)).toBe('+0');
  });
  it('returns undefined for non-numeric values', () => {
    expect(formatNumericDelta('a', 'b')).toBeUndefined();
    expect(formatNumericDelta(null, 5)).toBeUndefined();
  });
  it('returns undefined for infinite values', () => {
    expect(formatNumericDelta(Infinity, 5)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// serializeValue
// ---------------------------------------------------------------------------
describe('serializeValue', () => {
  it('returns empty string for null', () => {
    expect(serializeValue(null)).toBe('');
  });
  it('returns empty string for undefined', () => {
    expect(serializeValue(undefined)).toBe('');
  });
  it('returns string as-is', () => {
    expect(serializeValue('hello')).toBe('hello');
  });
  it('converts numbers to string', () => {
    expect(serializeValue(42)).toBe('42');
  });
  it('JSON-serializes objects', () => {
    expect(serializeValue({ a: 1 })).toBe('{"a":1}');
  });
});

// ---------------------------------------------------------------------------
// humanizeFieldPath
// ---------------------------------------------------------------------------
describe('humanizeFieldPath', () => {
  it('converts camelCase to Title Case', () => {
    expect(humanizeFieldPath('totalScore')).toBe('Total Score');
  });
  it('handles dot notation', () => {
    expect(humanizeFieldPath('scoring.totalScore')).toBe('Scoring Total Score');
  });
  it('handles array brackets', () => {
    expect(humanizeFieldPath('items[0].name')).toBe('Items [0] Name');
  });
});

// ---------------------------------------------------------------------------
// computeDiff — integration
// ---------------------------------------------------------------------------
describe('computeDiff', () => {
  it('detects a modified numeric field with delta', () => {
    const prev = { score: 42 };
    const curr = { score: 67 };
    const diffs = computeDiff(prev, curr);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]!.fieldName).toBe('score');
    expect(diffs[0]!.changeType).toBe('modified');
    expect(diffs[0]!.numericDelta).toBe('+25');
    expect(diffs[0]!.previousValue).toBe('42');
    expect(diffs[0]!.currentValue).toBe('67');
  });

  it('detects an added field', () => {
    const prev = { name: 'Project A' };
    const curr = { name: 'Project A', description: 'New description' };
    const diffs = computeDiff(prev, curr);
    expect(diffs.find((d) => d.fieldName === 'description')?.changeType).toBe('added');
  });

  it('detects a removed field', () => {
    const prev = { name: 'Project A', draft: true };
    const curr = { name: 'Project A' };
    const diffs = computeDiff(prev as Record<string, unknown>, curr as Record<string, unknown>);
    expect(diffs.find((d) => d.fieldName === 'draft')?.changeType).toBe('removed');
  });

  it('omits unchanged fields', () => {
    const prev = { name: 'Same', score: 10 };
    const curr = { name: 'Same', score: 10 };
    expect(computeDiff(prev, curr)).toHaveLength(0);
  });

  it('excludes specified fields', () => {
    const prev = { name: 'Old', isDirty: false };
    const curr = { name: 'New', isDirty: true };
    const diffs = computeDiff(
      prev as Record<string, unknown>,
      curr as Record<string, unknown>,
      ['isDirty']
    );
    expect(diffs.find((d) => d.fieldName === 'isDirty')).toBeUndefined();
    expect(diffs.find((d) => d.fieldName === 'name')).toBeDefined();
  });

  it('detects changes in nested fields', () => {
    const prev = { scoring: { totalScore: 40, riskScore: 10 } };
    const curr = { scoring: { totalScore: 75, riskScore: 10 } };
    const diffs = computeDiff(prev, curr);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]!.fieldName).toBe('scoring.totalScore');
    expect(diffs[0]!.numericDelta).toBe('+35');
  });

  it('detects changes in array elements', () => {
    const prev = { team: ['Alice', 'Bob'] };
    const curr = { team: ['Alice', 'Charlie'] };
    const diffs = computeDiff(prev, curr);
    expect(diffs.find((d) => d.fieldName === 'team[1]')?.changeType).toBe('modified');
  });

  it('uses custom field labels', () => {
    const prev = { ts: 42 };
    const curr = { ts: 67 };
    const diffs = computeDiff(prev, curr, [], { ts: 'Total Score' });
    expect(diffs[0]!.label).toBe('Total Score');
  });

  it('returns diffs sorted alphabetically by fieldName', () => {
    const prev = { b: 1, a: 1 };
    const curr = { b: 2, a: 2 };
    const diffs = computeDiff(prev, curr);
    expect(diffs[0]!.fieldName).toBe('a');
    expect(diffs[1]!.fieldName).toBe('b');
  });
});

// ---------------------------------------------------------------------------
// computeCharDiff
// ---------------------------------------------------------------------------
describe('computeCharDiff', () => {
  it('returns equal token for identical strings', () => {
    const tokens = computeCharDiff('hello', 'hello');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]!.type).toBe('equal');
  });

  it('detects a single character insertion', () => {
    const tokens = computeCharDiff('cat', 'cats');
    const added = tokens.find((t) => t.type === 'added');
    expect(added).toBeDefined();
    expect(added!.text).toBe('s');
  });

  it('detects a single character deletion', () => {
    const tokens = computeCharDiff('cats', 'cat');
    const removed = tokens.find((t) => t.type === 'removed');
    expect(removed).toBeDefined();
    expect(removed!.text).toBe('s');
  });

  it('falls back to two-token for very long strings', () => {
    const longStr = 'x'.repeat(6000);
    const tokens = computeCharDiff(longStr, longStr + 'y');
    expect(tokens).toHaveLength(2);
    expect(tokens[0]!.type).toBe('removed');
    expect(tokens[1]!.type).toBe('added');
  });

  it('merges consecutive equal characters into one token', () => {
    const tokens = computeCharDiff('abc', 'axc');
    // Should have: equal('a'), removed('b'), added('x'), equal('c')
    const types = tokens.map((t) => t.type);
    expect(types).toEqual(['equal', 'removed', 'added', 'equal']);
  });

  it('handles empty string comparison', () => {
    const tokens = computeCharDiff('', 'abc');
    expect(tokens.length).toBeGreaterThan(0);
    const addedText = tokens.filter((t) => t.type === 'added').map((t) => t.text).join('');
    expect(addedText).toBe('abc');
  });

  it('falls back to two-token when both strings exceed max length', () => {
    const long1 = 'a'.repeat(6000);
    const long2 = 'b'.repeat(6000);
    const tokens = computeCharDiff(long1, long2);
    expect(tokens).toHaveLength(2);
    expect(tokens[0]!.type).toBe('removed');
    expect(tokens[1]!.type).toBe('added');
  });
});

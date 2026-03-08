# SF06-T03 — Diff Engine

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01 (scaffold), T02 (contracts — `IVersionDiff`, `ChangeType`)
**Blocks:** T04 (`useVersionDiff`), T06 (`HbcVersionDiff`)
**Decision Reference:** D-05 — Client-side pure function in `src/engine/diffEngine.ts`

---

## Objective

Implement the complete client-side diff computation engine. All functions are pure (no side effects, no I/O), stateless, and exported for direct unit testing. The engine must achieve ≥95% line/function coverage per the spec. It handles four value categories: primitive scalars, numeric fields (with delta string), text strings (character-level highlighting tokens), and nested objects/arrays (recursive flattening to dot-notation paths).

---

## File: `src/engine/diffEngine.ts`

```typescript
import type { IVersionDiff, ChangeType } from '../types';

// ---------------------------------------------------------------------------
// Internal types (not exported — engine implementation details)
// ---------------------------------------------------------------------------

/** A flattened key-value map derived from a record by dot-notation traversal. */
type FlatRecord = Map<string, unknown>;

/** Token types for character-level text diff. */
type CharDiffToken =
  | { type: 'equal'; text: string }
  | { type: 'added'; text: string }
  | { type: 'removed'; text: string };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Computes a field-level diff between two record snapshots.
 * Returns an array of `IVersionDiff` entries — one per changed field.
 * Unchanged fields are omitted.
 *
 * @param previous - The baseline snapshot (version A).
 * @param current  - The comparison snapshot (version B).
 * @param excludeFields - Dot-notation paths to skip during comparison.
 * @param fieldLabels - Optional map of dot-notation path → human-readable label.
 */
export function computeDiff<T extends Record<string, unknown>>(
  previous: T,
  current: T,
  excludeFields: string[] = [],
  fieldLabels: Record<string, string> = {}
): IVersionDiff[] {
  const flatPrev = flattenRecord(previous);
  const flatCurr = flattenRecord(current);
  const excludeSet = new Set(excludeFields);

  const allKeys = new Set([...flatPrev.keys(), ...flatCurr.keys()]);
  const diffs: IVersionDiff[] = [];

  for (const key of allKeys) {
    if (excludeSet.has(key)) continue;

    const prevVal = flatPrev.get(key);
    const currVal = flatCurr.get(key);

    const changeType = classifyChange(prevVal, currVal);
    if (changeType === null) continue; // no change — skip

    diffs.push(buildDiffEntry(key, prevVal, currVal, changeType, fieldLabels));
  }

  // Sort by field path for deterministic output
  return diffs.sort((a, b) => a.fieldName.localeCompare(b.fieldName));
}

/**
 * Computes character-level diff tokens between two text strings.
 * Used by `HbcVersionDiff` to highlight inline changes within a text field.
 * Implements a simple LCS-based Myers diff for short strings (<5000 chars).
 * Falls back to a two-token (removed + added) representation for long strings.
 */
export function computeCharDiff(previous: string, current: string): CharDiffToken[] {
  const CHAR_DIFF_MAX_LENGTH = 5000;

  if (previous === current) {
    return [{ type: 'equal', text: previous }];
  }

  if (previous.length > CHAR_DIFF_MAX_LENGTH || current.length > CHAR_DIFF_MAX_LENGTH) {
    return [
      { type: 'removed', text: previous },
      { type: 'added', text: current },
    ];
  }

  return myersCharDiff(previous, current);
}

/**
 * Formats a numeric delta as a signed string: `'+25'`, `'-3'`, `'+0'`.
 * Returns `undefined` if either value is not a finite number.
 */
export function formatNumericDelta(previous: unknown, current: unknown): string | undefined {
  if (typeof previous !== 'number' || typeof current !== 'number') return undefined;
  if (!isFinite(previous) || !isFinite(current)) return undefined;
  const delta = current - previous;
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

// ---------------------------------------------------------------------------
// Flattening
// ---------------------------------------------------------------------------

/**
 * Recursively flattens a nested record into a dot-notation key → value map.
 * Arrays are flattened with index notation: `'items[0].name'`.
 * `null` and `undefined` values are included as-is.
 */
export function flattenRecord(
  record: Record<string, unknown>,
  prefix = '',
  result: FlatRecord = new Map()
): FlatRecord {
  for (const [key, value] of Object.entries(record)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result.set(fullKey, value);
    } else if (Array.isArray(value)) {
      flattenArray(value, fullKey, result);
    } else if (typeof value === 'object') {
      flattenRecord(value as Record<string, unknown>, fullKey, result);
    } else {
      result.set(fullKey, value);
    }
  }
  return result;
}

function flattenArray(
  arr: unknown[],
  prefix: string,
  result: FlatRecord
): void {
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    const fullKey = `${prefix}[${i}]`;
    if (value === null || value === undefined) {
      result.set(fullKey, value);
    } else if (Array.isArray(value)) {
      flattenArray(value, fullKey, result);
    } else if (typeof value === 'object') {
      flattenRecord(value as Record<string, unknown>, fullKey, result);
    } else {
      result.set(fullKey, value);
    }
  }
}

// ---------------------------------------------------------------------------
// Change classification
// ---------------------------------------------------------------------------

/**
 * Determines the `ChangeType` for a field by comparing previous and current values.
 * Returns `null` when values are deeply equal (no change — field should be omitted).
 */
export function classifyChange(
  previous: unknown,
  current: unknown
): ChangeType | null {
  if (previous === undefined && current !== undefined) return 'added';
  if (previous !== undefined && current === undefined) return 'removed';
  if (valuesAreEqual(previous, current)) return null;
  return 'modified';
}

/**
 * Deep equality check for flattened values.
 * Handles primitives, null, undefined, and JSON-serializable objects.
 */
export function valuesAreEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Diff entry construction
// ---------------------------------------------------------------------------

function buildDiffEntry(
  key: string,
  prevVal: unknown,
  currVal: unknown,
  changeType: ChangeType,
  fieldLabels: Record<string, string>
): IVersionDiff {
  const previousValue = serializeValue(prevVal);
  const currentValue = serializeValue(currVal);
  const numericDelta = formatNumericDelta(prevVal, currVal);
  const label = fieldLabels[key] ?? humanizeFieldPath(key);

  return {
    fieldName: key,
    label,
    previousValue,
    currentValue,
    changeType,
    numericDelta,
  };
}

/**
 * Converts a flattened field value to a display string.
 * - Primitives: `String(value)`
 * - null/undefined: empty string
 * - Objects/arrays: compact JSON
 */
export function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

/**
 * Converts a dot-notation field path to a human-readable label.
 * `'scoring.totalScore'` → `'Scoring Total Score'`
 * `'items[0].name'` → `'Items [0] Name'`
 */
export function humanizeFieldPath(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, ' [$1]')
    .split('.')
    .map((segment) =>
      segment
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim()
    )
    .join(' ');
}

// ---------------------------------------------------------------------------
// Myers LCS character-level diff (O(ND) algorithm)
// ---------------------------------------------------------------------------

/**
 * Implements a simplified Myers diff algorithm for character-level comparison.
 * Produces an array of equal/added/removed tokens suitable for inline rendering.
 */
function myersCharDiff(previous: string, current: string): CharDiffToken[] {
  const n = previous.length;
  const m = current.length;
  const maxD = n + m;

  // `v` is the working array: v[k] = furthest reaching x on diagonal k
  const v: number[] = new Array(2 * maxD + 1).fill(0);
  const trace: number[][] = [];

  outer: for (let d = 0; d <= maxD; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      const idx = k + maxD;
      let x: number;
      if (k === -d || (k !== d && v[idx - 1] < v[idx + 1])) {
        x = v[idx + 1] ?? 0;
      } else {
        x = (v[idx - 1] ?? 0) + 1;
      }
      let y = x - k;
      while (x < n && y < m && previous[x] === current[y]) {
        x++;
        y++;
      }
      v[idx] = x;
      if (x >= n && y >= m) {
        trace.push([...v]);
        break outer;
      }
    }
  }

  return backtrackTokens(previous, current, trace, maxD);
}

function backtrackTokens(
  previous: string,
  current: string,
  trace: number[][],
  maxD: number
): CharDiffToken[] {
  const tokens: CharDiffToken[] = [];
  let x = previous.length;
  let y = current.length;

  for (let d = trace.length - 1; d > 0 && (x > 0 || y > 0); d--) {
    const v = trace[d - 1];
    if (!v) break;
    const k = x - y;
    const idx = k + maxD;

    let prevK: number;
    if (k === -d || (k !== d && (v[idx - 1] ?? 0) < (v[idx + 1] ?? 0))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[prevK + maxD] ?? 0;
    const prevY = prevX - prevK;

    // Snake (equal chars going diagonally)
    while (x > prevX + (k !== prevK ? 0 : 1) && y > prevY + (k !== prevK ? 0 : 1)) {
      x--;
      y--;
      tokens.unshift({ type: 'equal', text: previous[x] ?? '' });
    }

    if (d > 0 && (x !== prevX || y !== prevY)) {
      if (k < prevK) {
        // Inserted from current
        y--;
        tokens.unshift({ type: 'added', text: current[y] ?? '' });
      } else {
        // Deleted from previous
        x--;
        tokens.unshift({ type: 'removed', text: previous[x] ?? '' });
      }
    }
  }

  // Merge consecutive tokens of the same type for efficiency
  return mergeTokens(tokens);
}

function mergeTokens(tokens: CharDiffToken[]): CharDiffToken[] {
  if (tokens.length === 0) return tokens;
  const merged: CharDiffToken[] = [{ ...tokens[0]! }];
  for (let i = 1; i < tokens.length; i++) {
    const current = tokens[i]!;
    const last = merged[merged.length - 1]!;
    if (current.type === last.type) {
      last.text += current.text;
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}
```

---

## State / Transition Table

The diff engine has no runtime state (all functions are pure). The following table documents the classification logic for all input combinations that `classifyChange` and `computeDiff` must handle:

| Scenario | `previous` | `current` | `classifyChange` result | `IVersionDiff.changeType` |
|---|---|---|---|---|
| Field added | `undefined` | any non-undefined | `'added'` | `'added'` |
| Field removed | any non-undefined | `undefined` | `'removed'` | `'removed'` |
| Primitive unchanged | `42` | `42` | `null` | *(omitted)* |
| Primitive changed | `42` | `67` | `'modified'` | `'modified'` |
| Numeric with delta | `42` | `67` | `'modified'` | `'modified'`, `numericDelta: '+25'` |
| String changed | `'foo'` | `'bar'` | `'modified'` | `'modified'` |
| Null → value | `null` | `'x'` | `'modified'` | `'modified'` |
| Value → null | `'x'` | `null` | `'modified'` | `'modified'` |
| Both null | `null` | `null` | `null` | *(omitted)* |
| Object unchanged (deep) | `{a:1}` | `{a:1}` | `null` | *(omitted)* |
| Nested field changed | `{a:{b:1}}` | `{a:{b:2}}` | `'modified'` on `a.b` | `'modified'` |
| Array element changed | `[1,2,3]` | `[1,9,3]` | `'modified'` on `[1]` | `'modified'` |
| Array element added | `[1,2]` | `[1,2,3]` | `'added'` on `[2]` | `'added'` |
| Excluded field changed | any | any | *(skipped)* | *(omitted)* |

---

## Exhaustive Unit Tests

```typescript
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
});
```

---

## Verification Commands

```bash
cd packages/versioned-record

# Run diff engine tests with verbose output
pnpm test -- --reporter=verbose src/engine/__tests__/diffEngine.test.ts

# Run coverage for engine only — must meet ≥95% threshold
pnpm test:coverage -- --include 'src/engine/**'

# TypeScript check
pnpm typecheck
```

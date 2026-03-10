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

  for (let d = 0; d <= maxD; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      const idx = k + maxD;
      let x: number;
      if (k === -d || (k !== d && v[idx - 1]! < v[idx + 1]!)) {
        x = v[idx + 1]!;
      } else {
        x = v[idx - 1]! + 1;
      }
      let y = x - k;
      while (x < n && y < m && previous[x] === current[y]) {
        x++;
        y++;
      }
      v[idx] = x;
      if (x >= n && y >= m) {
        return mergeTokens(backtrackTokens(previous, current, trace, d, maxD));
      }
    }
  }

  return [];
}

function backtrackTokens(
  previous: string,
  current: string,
  trace: number[][],
  editDist: number,
  maxD: number
): CharDiffToken[] {
  const tokens: CharDiffToken[] = [];
  let x = previous.length;
  let y = current.length;

  for (let d = editDist; d > 0; d--) {
    const v = trace[d - 1]!;
    const k = x - y;
    const idx = k + maxD;

    let prevK: number;
    if (k === -d || (k !== d && (v[idx - 1] ?? 0) <= (v[idx + 1] ?? 0))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[prevK + maxD] ?? 0;
    const prevY = prevX - prevK;

    // Snake (equal chars going diagonally)
    while (x > prevX && y > prevY && previous[x - 1] === current[y - 1]) {
      x--;
      y--;
      tokens.unshift({ type: 'equal', text: previous[x]! });
    }

    if (k < prevK) {
      // Inserted from current
      y--;
      tokens.unshift({ type: 'added', text: current[y]! });
    } else {
      // Deleted from previous
      x--;
      tokens.unshift({ type: 'removed', text: previous[x]! });
    }
  }

  // Handle initial snake (d=0)
  while (x > 0 && y > 0) {
    x--;
    y--;
    tokens.unshift({ type: 'equal', text: previous[x]! });
  }

  return tokens;
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

import type { ISeedFieldMapping } from '../types';

/**
 * Fuzzy header auto-mapping (D-02).
 *
 * Attempts to match each detected source column header to a field mapping's
 * label using normalized Levenshtein distance.
 *
 * A match is accepted if the similarity score ≥ FUZZY_MATCH_THRESHOLD (0.8).
 * Each field mapping is matched to at most one source column.
 * The highest-scoring match wins if multiple columns score above the threshold.
 *
 * @returns A map from sourceColumn → destinationField for columns that matched.
 *          Unmatched columns are not included (caller treats them as unmapped).
 */
export const FUZZY_MATCH_THRESHOLD = 0.8;

export function autoMapHeaders<TSource, TDest>(
  detectedHeaders: string[],
  fieldMappings: ISeedFieldMapping<TSource, TDest>[]
): Record<string, keyof TDest> {
  const result: Record<string, keyof TDest> = {};
  const usedColumns = new Set<string>();

  for (const mapping of fieldMappings) {
    let bestScore = 0;
    let bestColumn: string | null = null;

    for (const header of detectedHeaders) {
      if (usedColumns.has(header)) continue;
      const score = normalizedSimilarity(
        normalize(header),
        normalize(mapping.label)
      );
      if (score > bestScore) {
        bestScore = score;
        bestColumn = header;
      }
    }

    if (bestColumn !== null && bestScore >= FUZZY_MATCH_THRESHOLD) {
      result[bestColumn] = mapping.destinationField;
      usedColumns.add(bestColumn);
    }
  }

  return result;
}

/**
 * Normalizes a string for comparison:
 * - Lowercase
 * - Remove non-alphanumeric characters
 * - Collapse whitespace
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Computes normalized Levenshtein similarity between two strings.
 * Returns a value in [0, 1] where 1 is an exact match.
 */
function normalizedSimilarity(a: string, b: string): number {
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - distance / maxLen;
}

/**
 * Standard Levenshtein edit distance.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

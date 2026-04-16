/**
 * Shared OData string-literal escaper used by the Publisher's
 * read-only lookup adapters (`projectsLookupSource`,
 * `assetLibrarySource`, and any future `getbytitle`-bound lookup).
 *
 * Single quotes inside `'...'` must be doubled per the OData
 * grammar, and CR/LF are collapsed defensively so a multi-line
 * paste cannot break the filter expression.
 */
export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''").replace(/[\r\n]+/g, ' ');
}

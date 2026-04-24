/**
 * Pure, PnP-free identity/error utilities used across SharePoint and Safety
 * ingestion paths. Lives in its own module so Graph-only hot-path files can
 * consume these helpers without pulling `@pnp/sp` / `@pnp/nodejs-commonjs`
 * side-effect imports into their module graph (see audit report
 * `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/15-Graph-Only-Cutover-Closure.md`).
 *
 * This module intentionally imports from nothing PnP-adjacent so a future
 * static-import guard can rely on it as a clean dependency sink.
 */

const SHAREPOINT_TOKEN_ACQUISITION_ERROR_CODE = 'SHAREPOINT_TOKEN_ACQUISITION_FAILED';

/** Normalizes a site URL to lower-case path with no trailing slash for comparisons. */
export function normalizeSiteUrl(urlValue: string): URL {
  const url = new URL(urlValue);
  const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
  return new URL(`${url.origin}${normalizedPath.toLowerCase()}`);
}

/** Returns a normalized lower-case GUID string, or null if `value` is not a GUID. */
export function normalizeGuid(value: string): string | null {
  const normalized = value.replace(/[{}]/g, '').toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(normalized)
    ? normalized
    : null;
}

/** Returns the ISO date (YYYY-MM-DD) portion of a SharePoint date-like value, or null. */
export function normalizeSeedDate(value: unknown): string | null {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

/** Heuristic check for SharePoint "resource not found" errors. */
export function isNotFoundError(err: unknown): boolean {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('does not exist') ||
    message.includes('cannot find resource')
  );
}

/**
 * Extracts a SharePoint token acquisition error code when present, falling
 * back to the supplied default for non-token errors. Uses structural detection
 * (name + code) so this utility stays PnP-free and import-sink clean.
 */
export function toProvisioningErrorCode(err: unknown, fallback: string): string {
  if (
    err !== null &&
    typeof err === 'object' &&
    (err as { name?: unknown }).name === 'SharePointTokenAcquisitionError' &&
    typeof (err as { code?: unknown }).code === 'string'
  ) {
    return (err as { code: string }).code;
  }
  return fallback;
}

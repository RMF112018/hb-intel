import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/webs/index.js';
import {
  createSharePointBearerTokenBehavior,
  SharePointTokenAcquisitionError,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';

/**
 * Builds an authenticated PnPjs `spfi` context for the given site URL using the
 * provided managed-identity token service. Shared across all SharePoint-facing
 * services so token behavior wiring lives in exactly one place.
 */
export async function getPnPContext(
  siteUrl: string,
  tokenService: IManagedIdentityTokenService,
): Promise<any> {
  const behavior = await createSharePointBearerTokenBehavior(siteUrl, tokenService);
  return (spfi(siteUrl) as any).using(behavior);
}

/**
 * Readiness poll for post-create eventual consistency in SharePoint. Retries
 * on any error until `timeoutMs` elapses.
 */
export async function waitForSite(
  siteUrl: string,
  tokenService: IManagedIdentityTokenService,
  timeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const sp = await getPnPContext(siteUrl, tokenService);
      await sp.web.select('Title')();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error(`Site at ${siteUrl} did not become available within ${timeoutMs}ms`);
}

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
 * back to the supplied default for non-token errors.
 */
export function toProvisioningErrorCode(err: unknown, fallback: string): string {
  return err instanceof SharePointTokenAcquisitionError ? err.code : fallback;
}

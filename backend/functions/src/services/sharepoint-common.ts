import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/webs/index.js';
import {
  createSharePointBearerTokenBehavior,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';

export {
  normalizeSiteUrl,
  normalizeGuid,
  normalizeSeedDate,
  isNotFoundError,
  toProvisioningErrorCode,
} from './sharepoint-identity-utils.js';

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

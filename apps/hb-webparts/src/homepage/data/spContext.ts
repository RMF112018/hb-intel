/**
 * SPFx context storage for homepage data-access hooks.
 *
 * The mount dispatcher stores the WebPartContext on first render.
 * Data-fetching hooks retrieve the site URL without needing the
 * full context object, keeping the coupling narrow.
 *
 * Phase 01 (synchronous-weaving-thacker): site-URL host-context is
 * now owned by `@hbc/sharepoint-platform`. This module re-exports
 * `storeSiteUrl`/`getSiteUrl` from that package and keeps only the
 * Kudos-domain facts (canonical list-host URL, session-cached
 * `resolveCurrentUserId`) app-local.
 */
import {
  storeSiteUrl as platformStoreSiteUrl,
  getSiteUrl as platformGetSiteUrl,
  resolveCurrentUserId as platformResolveCurrentUserId,
} from '@hbc/sharepoint-platform';

/** Store the SharePoint site URL extracted from SPFx context. */
export function storeSiteUrl(absoluteUrl: string | undefined): void {
  platformStoreSiteUrl(absoluteUrl);
}

/** Retrieve the stored site URL, or undefined when running outside SPFx. */
export function getSiteUrl(): string | undefined {
  return platformGetSiteUrl();
}

/* ── Priority Actions list host URL (canonical HBCentral) ────────
 *
 * Priority Actions Band Config + Items lists are authored on
 * HBCentral (see docs/reference/sharepoint/list-schemas/hbcentral/).
 * Mirroring Kudos, the rail's read seam resolves against this
 * canonical host regardless of which site the homepage webpart is
 * hosted on. This prevents the rail from rendering empty when the
 * homepage is deployed to a non-HBCentral site (the prior behavior
 * when the rail resolved against `getSiteUrl()` only). */

const PRIORITY_ACTIONS_LIST_HOST_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

let _priorityActionsListHostUrlOverride: string | undefined;

/** Store an explicit Priority Actions list-host URL override from webpart properties. */
export function storePriorityActionsListHostUrl(url: string | undefined): void {
  _priorityActionsListHostUrlOverride = url?.replace(/\/+$/, '');
}

/**
 * Retrieve the Priority Actions list-host URL. Resolution order:
 *   1. Explicit override from webpart properties (if set)
 *   2. Hardcoded canonical constant (HBCentral)
 *   3. Hosting site URL (fallback when neither is available)
 */
export function getPriorityActionsListHostUrl(): string | undefined {
  return _priorityActionsListHostUrlOverride ?? PRIORITY_ACTIONS_LIST_HOST_URL ?? platformGetSiteUrl();
}

/* ── Kudos list host URL (cross-site data access) ────────────── */

/**
 * Canonical Kudos list host — the sole production location for HB
 * Kudos lists. Hardcoded as a locked production fact, not a per-
 * instance configuration value. This ensures the companion always
 * targets HBCentral even when hosted on HBKudosAdminReview and
 * regardless of whether the webpart property bag contains
 * `kudosListHostUrl`.
 *
 * The same pattern used for canonical permission groups in
 * `kudosRoleResolver.ts` — locked infrastructure, not editor config.
 */
const KUDOS_LIST_HOST_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

/**
 * Optional override — set from webpart properties via `mount.tsx`.
 * When present, takes precedence over the hardcoded constant.
 * In normal production runtime this is not needed; it exists as a
 * dev/test escape hatch.
 */
let _kudosListHostUrlOverride: string | undefined;

/** Store an explicit Kudos list-host URL override from webpart properties. */
export function storeKudosListHostUrl(url: string | undefined): void {
  _kudosListHostUrlOverride = url?.replace(/\/+$/, '');
}

/**
 * Retrieve the Kudos list-host URL. Resolution order:
 *   1. Explicit override from webpart properties (if set)
 *   2. Hardcoded canonical constant (HBCentral)
 *   3. Hosting site URL (fallback for non-Kudos contexts)
 */
export function getKudosListHostUrl(): string | undefined {
  return _kudosListHostUrlOverride ?? KUDOS_LIST_HOST_URL ?? platformGetSiteUrl();
}

/* ── Current user ID resolution ───────────────────────────────── */

let _currentUserIdPromise: Promise<number | undefined> | undefined;

/**
 * Resolve the current SharePoint user's numeric ID on the canonical
 * list-host site. Uses `getKudosListHostUrl()` so the returned ID
 * matches user references stored in list items on `HBCentral`,
 * regardless of which site the webpart is hosted on.
 *
 * Cached for the session so repeated calls do not issue redundant
 * REST requests. Returns `undefined` outside SPFx context.
 *
 * The underlying HTTP call is delegated to the platform's pure
 * `resolveCurrentUserId`; this function adds the session-level cache.
 */
export function resolveCurrentUserId(): Promise<number | undefined> {
  if (_currentUserIdPromise) return _currentUserIdPromise;
  const siteUrl = getKudosListHostUrl();
  _currentUserIdPromise = platformResolveCurrentUserId(siteUrl);
  return _currentUserIdPromise;
}

/**
 * SPFx context storage for homepage data-access hooks.
 *
 * The mount dispatcher stores the WebPartContext on first render.
 * Data-fetching hooks retrieve the site URL without needing the
 * full context object, keeping the coupling narrow.
 */

let _siteAbsoluteUrl: string | undefined;

/** Store the SharePoint site URL extracted from SPFx context. */
export function storeSiteUrl(absoluteUrl: string | undefined): void {
  _siteAbsoluteUrl = absoluteUrl?.replace(/\/+$/, '');
}

/** Retrieve the stored site URL, or undefined when running outside SPFx. */
export function getSiteUrl(): string | undefined {
  return _siteAbsoluteUrl;
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
  return _kudosListHostUrlOverride ?? KUDOS_LIST_HOST_URL ?? _siteAbsoluteUrl;
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
 */
export function resolveCurrentUserId(): Promise<number | undefined> {
  if (_currentUserIdPromise) return _currentUserIdPromise;
  const siteUrl = _kudosListHostUrlOverride ?? KUDOS_LIST_HOST_URL ?? _siteAbsoluteUrl;
  if (!siteUrl) {
    _currentUserIdPromise = Promise.resolve(undefined);
    return _currentUserIdPromise;
  }
  _currentUserIdPromise = fetch(`${siteUrl}/_api/web/currentuser`, {
    headers: { Accept: 'application/json;odata=nometadata' },
  })
    .then((r) => (r.ok ? r.json() : undefined))
    .then((body: { Id?: number } | undefined) => body?.Id)
    .catch(() => undefined);
  return _currentUserIdPromise;
}

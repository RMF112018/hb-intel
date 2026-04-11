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
 * Explicit list-host URL for HB Kudos list operations.
 *
 * When the companion webpart is hosted on a different site
 * (`HBKudosAdminReview`) than the canonical list host (`HBCentral`),
 * this override ensures all list reads, writes, and audit-event
 * queries target the correct site.
 *
 * Falls back to `_siteAbsoluteUrl` when not set, which is the
 * correct behavior for the public webpart hosted on the same site
 * as the lists.
 */
let _kudosListHostUrl: string | undefined;

/** Store the explicit Kudos list-host URL from webpart properties. */
export function storeKudosListHostUrl(url: string | undefined): void {
  _kudosListHostUrl = url?.replace(/\/+$/, '');
}

/**
 * Retrieve the Kudos list-host URL. Returns the explicit override
 * when set, otherwise falls back to the hosting site URL.
 */
export function getKudosListHostUrl(): string | undefined {
  return _kudosListHostUrl ?? _siteAbsoluteUrl;
}

/* ── Current user ID resolution ───────────────────────────────── */

let _currentUserIdPromise: Promise<number | undefined> | undefined;

/**
 * Resolve the current SharePoint user's numeric ID. Cached for the
 * session so repeated calls do not issue redundant REST requests.
 * Returns `undefined` outside SPFx context.
 */
export function resolveCurrentUserId(): Promise<number | undefined> {
  if (_currentUserIdPromise) return _currentUserIdPromise;
  const siteUrl = _siteAbsoluteUrl;
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

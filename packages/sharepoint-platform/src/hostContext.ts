/**
 * Module-level host-context store.
 *
 * The SPFx mount dispatcher stores the current site URL on first render;
 * data-access code retrieves it without needing to carry the full
 * WebPartContext around. `storeListHostUrl` / `getListHostUrl` is a
 * generic override slot that individual domains (e.g. a cross-site list
 * host) can use without this package knowing about any specific domain.
 */

let _siteAbsoluteUrl: string | undefined;
let _listHostUrl: string | undefined;

function trimTrailingSlashes(url: string | undefined): string | undefined {
  return url?.replace(/\/+$/, '');
}

/** Store the SharePoint site URL (typically from SPFx context). */
export function storeSiteUrl(absoluteUrl: string | undefined): void {
  _siteAbsoluteUrl = trimTrailingSlashes(absoluteUrl);
}

/** Retrieve the stored site URL, or undefined when running outside SPFx. */
export function getSiteUrl(): string | undefined {
  return _siteAbsoluteUrl;
}

/** Store an optional list-host URL override (generic; domain-agnostic). */
export function storeListHostUrl(url: string | undefined): void {
  _listHostUrl = trimTrailingSlashes(url);
}

/**
 * Retrieve the generic list-host override. Returns undefined when no
 * override has been set. Callers decide how to combine this with the
 * site URL or any domain-specific canonical URL.
 */
export function getListHostUrl(): string | undefined {
  return _listHostUrl;
}

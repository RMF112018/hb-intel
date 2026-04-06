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

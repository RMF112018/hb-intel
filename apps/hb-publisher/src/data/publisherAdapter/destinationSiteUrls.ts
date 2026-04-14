/**
 * Canonical destination → site-URL mapping for the Article Publisher.
 *
 * The tenant `HB Articles.TargetSiteUrl` column is **optional** per
 * the schema report, but every active destination page IS written
 * to a real site (the `HB Article Destination Pages.TargetSiteUrl`
 * binding column is required). This module is the single place
 * that answers "what site URL should a destination's pages live
 * on?" so author-authored `TargetSiteUrl` stays an optional
 * override rather than a hidden app-level required field.
 *
 * Author intent:
 *   - Leave `article.TargetSiteUrl` blank → resolver fills in the
 *     canonical destination URL at publish time.
 *   - Provide `article.TargetSiteUrl` explicitly → validation
 *     enforces an exact match with the canonical URL so authors
 *     cannot silently retarget a page at an unauthorized site.
 *
 * Current sprint supports `projectSpotlight` only. Additional
 * destinations (e.g. `companyPulse`) register a canonical URL
 * here when they come online; the resolver returns `undefined`
 * for anything not yet wired, which surfaces as a validation
 * error rather than a silent mis-bind.
 */

import { DESTINATION_VALUES, type Destination } from './publisherEnums';
import { PROJECT_SPOTLIGHT_SHELL_SOURCE_SITE_URL } from './pageGeneration/xmlShellManifest';

export const PROJECT_SPOTLIGHT_DESTINATION_SITE_URL =
  PROJECT_SPOTLIGHT_SHELL_SOURCE_SITE_URL;

/**
 * Canonical destination-site path suffix (e.g. `/sites/ProjectSpotlight`).
 * Validation uses the path — not the full URL — so an author-supplied
 * override is accepted across tenant hosts that share the same site
 * name (prod vs. test tenants), while still rejecting a retarget to
 * a completely unrelated path.
 */
const DESTINATION_SITE_PATHS: Readonly<Record<Destination, string | undefined>> = {
  projectSpotlight: '/sites/ProjectSpotlight',
  companyPulse: undefined,
};

/**
 * Canonical site URL for a destination's pages.
 *
 * Returns `undefined` for destinations not wired in the current
 * sprint. Callers must treat `undefined` as "no binding site is
 * authorized — fail closed".
 */
export function resolveDestinationSiteUrl(
  destination: Destination,
): string | undefined {
  switch (destination) {
    case 'projectSpotlight':
      return PROJECT_SPOTLIGHT_DESTINATION_SITE_URL;
    default:
      return undefined;
  }
}

/**
 * Canonical site-path suffix for a destination, used by validation
 * to detect retargeting attempts without hard-coding a single host.
 */
export function resolveDestinationSitePath(
  destination: Destination,
): string | undefined {
  return DESTINATION_SITE_PATHS[destination];
}

/**
 * Destinations the current sprint's authoring + publish pipeline
 * actually supports end to end. Derived from `DESTINATION_VALUES`
 * by keeping only the entries that register a canonical site URL
 * (i.e. the publish pipeline knows where to put the page).
 *
 * `DESTINATION_VALUES` stays schema-complete so adapters can still
 * read legacy rows for any declared Choice value; `SUPPORTED_DESTINATIONS`
 * gates the UI + any new-article authoring path so operators are
 * not invited into destinations whose publish pipeline is not wired.
 * Closes P2-3.
 */
export function isDestinationSupported(destination: Destination): boolean {
  return resolveDestinationSiteUrl(destination) !== undefined;
}

export const SUPPORTED_DESTINATIONS: readonly Destination[] =
  DESTINATION_VALUES.filter(isDestinationSupported);

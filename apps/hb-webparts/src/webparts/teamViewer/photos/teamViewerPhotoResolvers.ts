/**
 * teamViewerPhotoResolvers — deterministic photo URL producers.
 *
 * Photo precedence (locked Phase-01 Prompt-04):
 *
 *   1. explicit `person.photoUrl` (from the article team-member row).
 *   2. SharePoint profile photo via `_layouts/15/userphoto.aspx` — a
 *      deterministic URL keyed by email/upn, no async fetch. This is
 *      the Delve profile photo already used across HB Intel.
 *   3. Graph-backed person photo (async blob URL). Used only when SP
 *      isn't available, because when both are available they resolve
 *      to the same image.
 *   4. initials fallback (applied by the card component on either
 *      missing `photoUrl` OR a broken-image onError).
 *
 * This module exposes a pure builder; the React hook layer owns the
 * Graph async fetch + cache.
 */
import type { TeamViewerPerson } from '../teamViewerContracts.js';
import { createSharePointUserPhotoResolver } from '../../../homepage/helpers/peopleCultureProfilePhotoResolver.js';

export type TeamViewerPhotoSource = 'explicit' | 'sharepoint' | 'graph' | 'initials';

export interface TeamViewerPhotoResolution {
  url: string | undefined;
  source: TeamViewerPhotoSource;
}

export interface TeamViewerPhotoResolverOptions {
  /** Absolute SharePoint site URL (Delve profile photos live under here). */
  siteUrl?: string;
  /** Photo size to request from `/_layouts/15/userphoto.aspx`. */
  size?: 'S' | 'M' | 'L';
}

/** Select the best deterministic photo key for a person. */
export function personPhotoKey(person: TeamViewerPerson): string | undefined {
  return person.email ?? person.upn;
}

/**
 * Build the synchronous resolver used by the hook. Applies precedence
 * 1 and 2 only — Graph (precedence 3) is layered in the hook because
 * it requires an async token provider + blob-URL cache.
 */
export function createTeamViewerSyncPhotoResolver(
  options: TeamViewerPhotoResolverOptions,
): (person: TeamViewerPerson) => TeamViewerPhotoResolution {
  const spResolver =
    options.siteUrl && options.siteUrl.length > 0
      ? createSharePointUserPhotoResolver({ siteUrl: options.siteUrl, size: options.size ?? 'L' })
      : undefined;

  return (person) => {
    if (person.photoUrl) {
      return { url: person.photoUrl, source: 'explicit' };
    }
    const key = personPhotoKey(person);
    if (spResolver && key) {
      const hit = spResolver(key);
      if (hit?.src) return { url: hit.src, source: 'sharepoint' };
    }
    return { url: undefined, source: 'initials' };
  };
}

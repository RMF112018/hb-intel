/**
 * People & Culture profile-photo resolver factories.
 *
 * Phase-14 pc/ Prompt-04 (Media, Preview, Homepage, Milestone Operations).
 *
 * These helpers produce `ProfilePhotoResolver` callbacks that can be
 * supplied to `resolveMediaSource` so `profilePhoto` media sources
 * render through a real image endpoint instead of falling through to
 * the initials placeholder. No React, no network — the resolvers
 * return deterministic URLs; the consuming component fetches them.
 *
 * Two factories are exported:
 *
 *   - `createSharePointUserPhotoResolver` — builds the classic
 *     SharePoint `/_layouts/15/userphoto.aspx?accountname=...&size=L`
 *     URL. Requires a person-id that looks like a resolvable
 *     SharePoint accountname (email or `i:0#.f|membership|email`).
 *   - `createStaticProfilePhotoResolver` — wraps a prebuilt
 *     `{ personId → { src, alt } }` map so tests, local dev, and
 *     static-fallback scenarios can exercise the same contract.
 *
 * Both resolvers accept a person-id that may come from either a
 * SharePoint item's user field OR from the legacy `legacy:<name>`
 * placeholder emitted by the PC public legacy adapter. When the
 * person-id cannot be resolved to a real accountname, the resolver
 * returns `undefined` and the caller falls back to the initials
 * placeholder.
 */

import type { ProfilePhotoResolver } from './peopleCultureSplitModel.js';

export type ProfilePhotoSize = 'S' | 'M' | 'L';

export interface SharePointUserPhotoResolverOptions {
  /**
   * Absolute site URL, e.g. `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
   * Used as the base for the `/_layouts/15/userphoto.aspx` endpoint.
   */
  siteUrl: string;
  /** Default image size to request. Defaults to `L`. */
  size?: ProfilePhotoSize;
  /**
   * Optional explicit person-id → accountname map. Useful when the
   * PC item carries a stable GUID / numeric id but the SharePoint
   * endpoint needs the `i:0#.f|membership|email` form. If the
   * lookup misses, the resolver falls back to treating the raw
   * person-id as an accountname.
   */
  accountNameLookup?: (personId: string) => string | undefined;
  /**
   * Optional alt-text builder. Defaults to `Photo of <id-fragment>`.
   */
  buildAltText?: (accountName: string) => string;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function looksLikeLegacyPlaceholder(personId: string): boolean {
  return personId.startsWith('legacy:');
}

/**
 * Accepts raw SharePoint account strings (email, i:0#.f|membership|…)
 * plus plain email addresses. Returns `undefined` for placeholder
 * ids that can't be resolved.
 */
function normalizeAccountName(personId: string): string | undefined {
  if (!personId) return undefined;
  if (looksLikeLegacyPlaceholder(personId)) return undefined;
  const trimmed = personId.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

/**
 * Build a `ProfilePhotoResolver` that points at SharePoint's
 * `_layouts/15/userphoto.aspx` endpoint. Safe to call with a
 * blank site URL — in that case the resolver always returns
 * `undefined` so consumers fall through to the initials placeholder.
 */
export function createSharePointUserPhotoResolver(
  options: SharePointUserPhotoResolverOptions,
): ProfilePhotoResolver {
  const base = trimTrailingSlash(options.siteUrl || '');
  const size = options.size ?? 'L';
  const buildAltText =
    options.buildAltText ??
    ((accountName: string) => {
      const local = accountName.split('@')[0] ?? accountName;
      return `Photo of ${local}`;
    });
  const accountNameLookup = options.accountNameLookup;

  return (personId: string) => {
    if (!base) return undefined;
    const mapped = accountNameLookup?.(personId);
    const accountName = mapped ?? normalizeAccountName(personId);
    if (!accountName) return undefined;
    const src = `${base}/_layouts/15/userphoto.aspx?accountname=${encodeURIComponent(
      accountName,
    )}&size=${size}`;
    return { src, alt: buildAltText(accountName) };
  };
}

/**
 * Build a resolver backed by a static map. Used by tests and by
 * local-dev scenarios where no SharePoint endpoint is reachable.
 */
export function createStaticProfilePhotoResolver(
  map: Record<string, { src: string; alt: string }>,
): ProfilePhotoResolver {
  return (personId: string) => map[personId] ?? undefined;
}

/**
 * Compose multiple resolvers. The first resolver to return a hit
 * wins. Useful for layering a static map on top of a live
 * SharePoint resolver, or a fallback resolver behind a tenant
 * resolver.
 */
export function composeProfilePhotoResolvers(
  ...resolvers: ReadonlyArray<ProfilePhotoResolver | undefined>
): ProfilePhotoResolver {
  const active = resolvers.filter(
    (r): r is ProfilePhotoResolver => typeof r === 'function',
  );
  if (active.length === 0) {
    return () => undefined;
  }
  if (active.length === 1) {
    return active[0];
  }
  return (personId: string) => {
    for (const resolver of active) {
      const hit = resolver(personId);
      if (hit) return hit;
    }
    return undefined;
  };
}

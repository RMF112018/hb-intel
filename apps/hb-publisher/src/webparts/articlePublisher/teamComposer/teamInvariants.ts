/**
 * Pure invariants for the teammate management surface.
 * Workstream-d step-03.
 */

import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';

/**
 * Enforce the mutually-exclusive "featured teammate" invariant.
 *
 * When `featuredId` is defined, exactly that row is marked
 * `IsFeaturedMember: true`; every other row has the flag cleared
 * (set to `undefined` so it serialises cleanly). When `featuredId`
 * is `undefined`, every row is cleared — useful when an author
 * toggles the featured chip off.
 */
export function applyFeaturedInvariant(
  rows: readonly PublisherTeamMemberRow[],
  featuredId: string | undefined,
): PublisherTeamMemberRow[] {
  return rows.map((r) => {
    const shouldFeature = featuredId !== undefined && r.TeamMemberId === featuredId;
    if (shouldFeature) {
      if (r.IsFeaturedMember === true) return r;
      return { ...r, IsFeaturedMember: true };
    }
    if (r.IsFeaturedMember === true) {
      const { IsFeaturedMember: _drop, ...rest } = r;
      return { ...rest, IsFeaturedMember: undefined };
    }
    return r;
  });
}

/**
 * Re-stamp `SortOrder` on a row list so the persisted order matches
 * stack position (1-indexed). Pure.
 */
export function restampSortOrder(
  rows: readonly PublisherTeamMemberRow[],
): PublisherTeamMemberRow[] {
  return rows.map((r, i) => (r.SortOrder === i + 1 ? r : { ...r, SortOrder: i + 1 }));
}

/**
 * Move the row at `idx` by `dir` positions and re-stamp SortOrder.
 * A no-op when the move would fall off the ends.
 */
export function moveRow(
  rows: readonly PublisherTeamMemberRow[],
  idx: number,
  dir: -1 | 1,
): PublisherTeamMemberRow[] {
  const j = idx + dir;
  if (j < 0 || j >= rows.length) return rows.slice();
  const next = rows.slice();
  [next[idx]!, next[j]!] = [next[j]!, next[idx]!];
  return restampSortOrder(next);
}

/**
 * Two-letter initials for the chip avatar. Mirrors the HbcPeoplePicker
 * fallback behaviour so visual identity carries over from composer to
 * saved chip. Pure.
 */
export function teamMemberInitials(
  row: Pick<PublisherTeamMemberRow, 'DisplayName' | 'PersonPrincipal'>,
): string {
  const source = (row.DisplayName || row.PersonPrincipal || '').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  const single = parts[0]!;
  // For "alice@hedrickbrothers.com" style → "AL"; otherwise first char.
  if (single.includes('@')) {
    const local = single.split('@')[0]!;
    return local.slice(0, 2).toUpperCase() || '?';
  }
  return (single[0] ?? '?').toUpperCase();
}

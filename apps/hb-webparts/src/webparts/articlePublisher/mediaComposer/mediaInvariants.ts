/**
 * Pure invariants for the gallery surface. Workstream-e step-02.
 */

import type { PublisherMediaRow } from '../../../homepage/data/publisherAdapter/index.js';

/**
 * Mutually-exclusive featured-gallery-image invariant. Only the
 * row identified by `featuredId` carries `FeaturedInGallery: true`;
 * every other row has the flag cleared. When `featuredId` is
 * undefined, the flag is cleared on every row.
 */
export function applyFeaturedGalleryInvariant(
  rows: readonly PublisherMediaRow[],
  featuredId: string | undefined,
): PublisherMediaRow[] {
  return rows.map((r) => {
    const shouldFeature = featuredId !== undefined && r.MediaId === featuredId;
    if (shouldFeature) {
      if (r.FeaturedInGallery === true) return r;
      return { ...r, FeaturedInGallery: true };
    }
    if (r.FeaturedInGallery === true) {
      return { ...r, FeaturedInGallery: undefined };
    }
    return r;
  });
}

/** Re-stamp `SortOrder` to 1-indexed grid position. Reference-stable per row. */
export function restampMediaSortOrder(
  rows: readonly PublisherMediaRow[],
): PublisherMediaRow[] {
  return rows.map((r, i) => (r.SortOrder === i + 1 ? r : { ...r, SortOrder: i + 1 }));
}

/**
 * Move the row at `idx` by `delta` positions and re-stamp SortOrder.
 * `delta` is an arbitrary signed integer so the grid-aware keyboard
 * reorder (up/down jumps a row width) can use this helper as-is.
 */
export function moveMediaRow(
  rows: readonly PublisherMediaRow[],
  idx: number,
  delta: number,
): PublisherMediaRow[] {
  if (delta === 0) return rows.slice();
  const target = idx + delta;
  const clamped = Math.max(0, Math.min(rows.length - 1, target));
  if (clamped === idx) return rows.slice();
  const next = rows.slice();
  const [pulled] = next.splice(idx, 1);
  if (!pulled) return rows.slice();
  next.splice(clamped, 0, pulled);
  return restampMediaSortOrder(next);
}

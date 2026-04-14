import { describe, expect, it } from 'vitest';
import type { PublisherMediaRow } from '../../../homepage/data/publisherAdapter/index.js';
import {
  applyFeaturedGalleryInvariant,
  moveMediaRow,
  restampMediaSortOrder,
} from './mediaInvariants.js';

function row(id: string, over: Partial<PublisherMediaRow> = {}): PublisherMediaRow {
  return {
    ArticleId: 'art-1',
    MediaId: id,
    Title: id,
    MediaRole: 'gallery',
    ImageAsset: `https://img.example.com/${id}.jpg`,
    AltText: id,
    SortOrder: 1,
    ...over,
  };
}

describe('applyFeaturedGalleryInvariant', () => {
  it('features exactly one row and clears the flag on the others', () => {
    const rows = [
      row('a', { FeaturedInGallery: true }),
      row('b'),
      row('c', { FeaturedInGallery: true }),
    ];
    const out = applyFeaturedGalleryInvariant(rows, 'b');
    expect(out.map((r) => r.FeaturedInGallery)).toEqual([undefined, true, undefined]);
  });

  it('clears every row when featuredId is undefined', () => {
    const rows = [row('a', { FeaturedInGallery: true }), row('b')];
    const out = applyFeaturedGalleryInvariant(rows, undefined);
    expect(out.every((r) => r.FeaturedInGallery === undefined)).toBe(true);
  });

  it('is reference-stable for rows already matching the invariant', () => {
    const rows = [row('a', { FeaturedInGallery: true }), row('b')];
    const out = applyFeaturedGalleryInvariant(rows, 'a');
    expect(out[0]).toBe(rows[0]);
    expect(out[1]).toBe(rows[1]);
  });
});

describe('restampMediaSortOrder', () => {
  it('rewrites SortOrder to 1-indexed grid position', () => {
    const rows = [row('a', { SortOrder: 99 }), row('b', { SortOrder: 7 })];
    expect(restampMediaSortOrder(rows).map((r) => r.SortOrder)).toEqual([1, 2]);
  });

  it('returns the same reference for rows already at the correct position', () => {
    const rows = [row('a', { SortOrder: 1 }), row('b', { SortOrder: 2 })];
    const out = restampMediaSortOrder(rows);
    expect(out[0]).toBe(rows[0]);
    expect(out[1]).toBe(rows[1]);
  });
});

describe('moveMediaRow', () => {
  const rows = [row('a'), row('b'), row('c'), row('d')];

  it('moves one step forward and re-stamps sort order', () => {
    const out = moveMediaRow(rows, 0, 1);
    expect(out.map((r) => r.MediaId)).toEqual(['b', 'a', 'c', 'd']);
    expect(out.map((r) => r.SortOrder)).toEqual([1, 2, 3, 4]);
  });

  it('moves multiple steps for grid-aware reorder', () => {
    const out = moveMediaRow(rows, 0, 2);
    expect(out.map((r) => r.MediaId)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('clamps to the ends instead of wrapping', () => {
    expect(moveMediaRow(rows, 0, -1).map((r) => r.MediaId)).toEqual(['a', 'b', 'c', 'd']);
    expect(moveMediaRow(rows, 3, 5).map((r) => r.MediaId)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('is a no-op when delta is zero', () => {
    expect(moveMediaRow(rows, 1, 0).map((r) => r.MediaId)).toEqual(['a', 'b', 'c', 'd']);
  });
});

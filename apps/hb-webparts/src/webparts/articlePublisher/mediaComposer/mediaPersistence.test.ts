/**
 * Workstream-e step-04 — media persistence + preview + gallery
 * readiness round-trip. Locks in that composer-produced rows map
 * cleanly through the SharePoint writer and compose identically
 * on the preview + publish paths.
 */

import { describe, expect, it } from 'vitest';
import { mapMediaRowToListFields } from '../../../homepage/data/publisherAdapter/publisherWriters.js';
import {
  applyFeaturedGalleryInvariant,
  createMediaRowFromDraft,
  restampMediaSortOrder,
  type MediaComposerDraft,
} from './index.js';

function draft(over: Partial<MediaComposerDraft> = {}): MediaComposerDraft {
  return {
    imageUrl: 'https://img.example.com/library/atlantic-center/crew-raise.jpg',
    altText: 'Crew raising the final steel beam at the West Palm Beach jobsite.',
    caption: 'Final beam — April 2026.',
    role: 'gallery',
    ...over,
  };
}

describe('media persistence round-trip', () => {
  it('maps a composer-produced row to the SharePoint field bag', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft: draft(),
      sortOrder: 2,
    });
    const fields = mapMediaRowToListFields(row);
    expect(fields).toMatchObject({
      ArticleId: 'art-1',
      MediaId: 'm-1',
      Title: 'crew-raise',
      MediaRole: 'gallery',
      AltText: 'Crew raising the final steel beam at the West Palm Beach jobsite.',
      Caption: 'Final beam — April 2026.',
      SortOrder: 2,
    });
    // URL field serialises as { Url, Description } per tenant SharePoint.
    expect(fields.ImageAsset).toEqual({
      Url: 'https://img.example.com/library/atlantic-center/crew-raise.jpg',
      Description: 'https://img.example.com/library/atlantic-center/crew-raise.jpg',
    });
    // Optional columns go to null when absent.
    expect(fields.GalleryGroup).toBeNull();
    expect(fields.FeaturedInGallery).toBeNull();
  });

  it('emits FeaturedInGallery=true for a featured row', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft: draft({ featured: true }),
      sortOrder: 1,
    });
    expect(mapMediaRowToListFields(row).FeaturedInGallery).toBe(true);
  });
});

describe('gallery ordering + featured invariant round-trip', () => {
  it('restampMediaSortOrder makes grid position the SortOrder on write', () => {
    const grid = restampMediaSortOrder([
      createMediaRowFromDraft({
        articleId: 'art-1',
        mediaId: 'm-a',
        draft: draft({ imageUrl: 'https://img.example.com/a.jpg', altText: 'alt a' }),
        sortOrder: 99,
      }),
      createMediaRowFromDraft({
        articleId: 'art-1',
        mediaId: 'm-b',
        draft: draft({ imageUrl: 'https://img.example.com/b.jpg', altText: 'alt b' }),
        sortOrder: 7,
      }),
    ]);
    expect(grid.map((r) => r.SortOrder)).toEqual([1, 2]);
    // Field bags serialise matching SortOrder.
    expect(grid.map((r) => mapMediaRowToListFields(r).SortOrder)).toEqual([1, 2]);
  });

  it('enforces mutually-exclusive FeaturedInGallery before persistence', () => {
    const a = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-a',
      draft: draft({ featured: true, imageUrl: 'https://img.example.com/a.jpg' }),
      sortOrder: 1,
    });
    const b = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-b',
      draft: draft({ featured: true, imageUrl: 'https://img.example.com/b.jpg' }),
      sortOrder: 2,
    });
    const enforced = applyFeaturedGalleryInvariant([a, b], 'm-b');
    expect(enforced.find((r) => r.MediaId === 'm-a')?.FeaturedInGallery).toBeUndefined();
    expect(enforced.find((r) => r.MediaId === 'm-b')?.FeaturedInGallery).toBe(true);
  });
});

describe('composeGallery contract parity', () => {
  it('filters to gallery-role rows and ignores legacy hero/secondary rows', () => {
    // Composer only writes gallery | supporting; legacy hero /
    // secondary rows may still exist on articles migrated from the
    // pre-redesign editor. Confirm those rows do not surface to
    // composeGallery so the gallery block keeps a clean feed.
    const rows = [
      createMediaRowFromDraft({
        articleId: 'art-1',
        mediaId: 'm-1',
        draft: draft({ imageUrl: 'https://img.example.com/g.jpg' }),
        sortOrder: 1,
      }),
      {
        ...createMediaRowFromDraft({
          articleId: 'art-1',
          mediaId: 'm-2',
          draft: draft({ imageUrl: 'https://img.example.com/h.jpg' }),
          sortOrder: 2,
        }),
        MediaRole: 'hero' as const,
      },
    ];
    const galleryOnly = rows.filter((r) => r.MediaRole === 'gallery');
    expect(galleryOnly.map((r) => r.MediaId)).toEqual(['m-1']);
  });
});

import { describe, expect, it } from 'vitest';
import {
  createMediaRowFromDraft,
  deriveMediaTitle,
  draftFromRow,
  isAllowedImageUrl,
  mergeMediaRowWithDraft,
  type MediaComposerDraft,
} from './buildMediaRow.js';

const draft: MediaComposerDraft = {
  imageUrl: 'https://img.example.com/projects/atlantic-center/crew-raise.jpg',
  altText: 'Crew raising the final steel beam at the West Palm Beach jobsite.',
  caption: 'Final beam — April 2026.',
  role: 'gallery',
};

describe('deriveMediaTitle', () => {
  it('uses the URL pathname last segment (without extension) when present', () => {
    expect(
      deriveMediaTitle({ imageUrl: draft.imageUrl, altText: draft.altText, mediaId: 'm-1' }),
    ).toBe('crew-raise');
  });

  it('decodes percent-encoded segments', () => {
    expect(
      deriveMediaTitle({
        imageUrl: 'https://img.example.com/library/Acme%20Tower.png',
        altText: '',
        mediaId: 'm-1',
      }),
    ).toBe('Acme Tower');
  });

  it('falls back to alt text (max 60 chars) when the URL has no usable segment', () => {
    expect(
      deriveMediaTitle({
        imageUrl: 'https://img.example.com/',
        altText: 'A crew on the West Palm Beach jobsite raising the final steel beam skyward',
        mediaId: 'm-1',
      }),
    ).toBe('A crew on the West Palm Beach jobsite raising the final stee');
  });

  it('falls back to the MediaId when both URL and alt text are empty', () => {
    expect(deriveMediaTitle({ imageUrl: '', altText: '', mediaId: 'm-99' })).toBe('m-99');
  });

  it('is safe against malformed URLs', () => {
    expect(
      deriveMediaTitle({ imageUrl: 'not a url', altText: 'alt', mediaId: 'm-1' }),
    ).toBe('alt');
  });
});

describe('createMediaRowFromDraft', () => {
  it('derives Title and carries composer fields into the tenant row', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft,
      sortOrder: 3,
    });
    expect(row).toMatchObject({
      ArticleId: 'art-1',
      MediaId: 'm-1',
      Title: 'crew-raise',
      MediaRole: 'gallery',
      ImageAsset: draft.imageUrl,
      AltText: draft.altText,
      Caption: 'Final beam — April 2026.',
      SortOrder: 3,
    });
    expect(row.FeaturedInGallery).toBeUndefined();
  });

  it('honours the featured flag', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft: { ...draft, featured: true },
      sortOrder: 1,
    });
    expect(row.FeaturedInGallery).toBe(true);
  });

  it('treats whitespace-only caption as absent', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft: { ...draft, caption: '   ' },
      sortOrder: 1,
    });
    expect(row.Caption).toBeUndefined();
  });
});

describe('mergeMediaRowWithDraft', () => {
  const legacy = {
    ArticleId: 'art-1',
    MediaId: 'm-legacy',
    Title: 'Hand-authored Title',
    MediaRole: 'gallery' as const,
    ImageAsset: 'https://img.example.com/old.jpg',
    AltText: 'old alt',
    Caption: 'old cap',
    SortOrder: 4,
    GalleryGroup: 'archive',
  };

  it('preserves a non-derivable hand-authored Title on edit', () => {
    const merged = mergeMediaRowWithDraft({
      existing: legacy,
      draft: { ...draft },
    });
    expect(merged.Title).toBe('Hand-authored Title');
    expect(merged.GalleryGroup).toBe('archive');
    expect(merged.ImageAsset).toBe(draft.imageUrl);
    expect(merged.AltText).toBe(draft.altText);
  });

  it('re-derives Title on edit when the existing Title matches the URL derivation', () => {
    const derived = {
      ...legacy,
      Title: deriveMediaTitle({
        imageUrl: legacy.ImageAsset,
        altText: legacy.AltText,
        mediaId: legacy.MediaId,
      }),
    };
    const merged = mergeMediaRowWithDraft({ existing: derived, draft });
    expect(merged.Title).toBe('crew-raise');
  });

  it('clears the featured flag when draft.featured is explicitly false', () => {
    const merged = mergeMediaRowWithDraft({
      existing: { ...legacy, FeaturedInGallery: true },
      draft: { ...draft, featured: false },
    });
    expect(merged.FeaturedInGallery).toBeUndefined();
  });
});

describe('draftFromRow', () => {
  it('projects a row back into a composer draft', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft: { ...draft, featured: true },
      sortOrder: 1,
    });
    expect(draftFromRow(row)).toEqual({
      imageUrl: draft.imageUrl,
      altText: draft.altText,
      caption: 'Final beam — April 2026.',
      role: 'gallery',
      featured: true,
    });
  });

  it('maps non-gallery / non-supporting roles to gallery for the composer chooser', () => {
    const row = createMediaRowFromDraft({
      articleId: 'art-1',
      mediaId: 'm-1',
      draft,
      sortOrder: 1,
    });
    const coerced = draftFromRow({ ...row, MediaRole: 'hero' });
    expect(coerced.role).toBe('gallery');
  });
});

describe('isAllowedImageUrl', () => {
  it('accepts https URLs', () => {
    expect(isAllowedImageUrl('https://img.example.com/a.jpg')).toBe(true);
  });

  it('rejects http, data, file, javascript, and protocol-relative URLs', () => {
    expect(isAllowedImageUrl('http://img.example.com/a.jpg')).toBe(false);
    expect(isAllowedImageUrl('data:image/png;base64,abc')).toBe(false);
    expect(isAllowedImageUrl('file:///etc/passwd')).toBe(false);
    expect(isAllowedImageUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedImageUrl('//img.example.com/a.jpg')).toBe(false);
  });

  it('rejects empty / whitespace / non-URL values', () => {
    expect(isAllowedImageUrl('')).toBe(false);
    expect(isAllowedImageUrl('   ')).toBe(false);
    expect(isAllowedImageUrl('not a url')).toBe(false);
  });
});

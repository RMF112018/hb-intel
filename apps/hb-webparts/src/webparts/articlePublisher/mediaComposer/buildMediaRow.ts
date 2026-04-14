/**
 * Pure helpers for the media composer. Workstream-e step-02.
 *
 * Encapsulates the add / edit mapping from composer state onto the
 * tenant `PublisherMediaRow` shape, including Title auto-derivation
 * so the author never fills the (tenant-required) internal Title
 * column by hand.
 */

import type {
  MediaRole,
  PublisherMediaRow,
} from '../../../homepage/data/publisherAdapter/index.js';

export type MediaComposerRole = Extract<MediaRole, 'gallery' | 'supporting'>;

export interface MediaComposerDraft {
  readonly imageUrl: string;
  readonly altText: string;
  readonly caption?: string;
  readonly role: MediaComposerRole;
  readonly featured?: boolean;
}

function trimOrUndefined(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Derive a tenant-required `Title` from the composer draft.
 * Strategy: last URL path segment (without extension), falling back
 * to the first 60 characters of alt text, falling back to the
 * MediaId. Safe against malformed URLs.
 */
export function deriveMediaTitle(args: {
  readonly imageUrl: string;
  readonly altText: string;
  readonly mediaId: string;
}): string {
  const fromUrl = lastUrlSegment(args.imageUrl);
  if (fromUrl) return fromUrl;
  const altTrimmed = args.altText.trim();
  if (altTrimmed.length > 0) {
    return altTrimmed.length <= 60 ? altTrimmed : altTrimmed.slice(0, 60).trimEnd();
  }
  return args.mediaId;
}

function lastUrlSegment(input: string): string | undefined {
  const trimmed = input.trim();
  if (trimmed.length === 0) return undefined;
  try {
    const u = new URL(trimmed);
    const parts = u.pathname.split('/').filter((p) => p.length > 0);
    const last = parts[parts.length - 1];
    if (!last) return undefined;
    return decodeURIComponent(last.replace(/\.[a-z0-9]{2,5}$/i, ''));
  } catch {
    // Not a parseable URL — fall through.
    return undefined;
  }
}

/**
 * Build a new `PublisherMediaRow` from composer state.
 */
export function createMediaRowFromDraft(args: {
  readonly articleId: string;
  readonly mediaId: string;
  readonly draft: MediaComposerDraft;
  readonly sortOrder: number;
}): PublisherMediaRow {
  const { articleId, mediaId, draft, sortOrder } = args;
  return {
    ArticleId: articleId,
    MediaId: mediaId,
    Title: deriveMediaTitle({
      imageUrl: draft.imageUrl,
      altText: draft.altText,
      mediaId,
    }),
    MediaRole: draft.role,
    ImageAsset: draft.imageUrl.trim(),
    AltText: draft.altText.trim(),
    Caption: trimOrUndefined(draft.caption),
    SortOrder: sortOrder,
    FeaturedInGallery: draft.featured === true ? true : undefined,
  };
}

/**
 * Merge composer state into an existing row without destroying
 * fields the composer does not author (`GalleryGroup`, and any
 * previously-authored `Title` that diverges from the derivation
 * rule).
 */
export function mergeMediaRowWithDraft(args: {
  readonly existing: PublisherMediaRow;
  readonly draft: MediaComposerDraft;
}): PublisherMediaRow {
  const { existing, draft } = args;
  // Preserve a hand-authored Title if the existing row's Title is
  // non-empty and does not match the derivation for its URL; that
  // signals an author-meaningful value, rare as it is.
  const autoTitle = deriveMediaTitle({
    imageUrl: existing.ImageAsset,
    altText: existing.AltText,
    mediaId: existing.MediaId,
  });
  const preservedTitle =
    existing.Title && existing.Title.trim().length > 0 && existing.Title !== autoTitle
      ? existing.Title
      : deriveMediaTitle({
          imageUrl: draft.imageUrl,
          altText: draft.altText,
          mediaId: existing.MediaId,
        });
  return {
    ...existing,
    Title: preservedTitle,
    MediaRole: draft.role,
    ImageAsset: draft.imageUrl.trim(),
    AltText: draft.altText.trim(),
    Caption: trimOrUndefined(draft.caption),
    FeaturedInGallery:
      draft.featured === true
        ? true
        : draft.featured === false
          ? undefined
          : existing.FeaturedInGallery,
  };
}

/**
 * Reverse projection for seeding the composer on edit.
 */
export function draftFromRow(row: PublisherMediaRow): MediaComposerDraft {
  const role: MediaComposerRole =
    row.MediaRole === 'supporting' ? 'supporting' : 'gallery';
  return {
    imageUrl: row.ImageAsset,
    altText: row.AltText,
    caption: trimOrUndefined(row.Caption),
    role,
    featured: row.FeaturedInGallery === true,
  };
}

/**
 * Strict `https://` URL validator. The publisher stamps author HTML
 * onto SharePoint pages; non-https image sources either break on a
 * secure tenant or ship mixed content. Protocol-relative `//foo` is
 * explicitly rejected — it would smuggle http on a mixed context.
 */
export function isAllowedImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('//')) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

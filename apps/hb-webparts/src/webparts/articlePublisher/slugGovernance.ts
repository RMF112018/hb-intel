/**
 * Governed slug generation for the Article Publisher.
 *
 * Workstream B, step-03 retires the author-facing Slug field. The
 * `Slug` column on `HB Articles` is now system-managed: derived from
 * the article title, normalised to a URL-safe lowercase form, and
 * deduped against the other articles in the workspace before save.
 *
 * Stability rule: once an article leaves the `draft` workflow state
 * (review, approved, published, scheduled-legacy, archived, withdrawn),
 * its slug is preserved on subsequent saves so external links and
 * destination-page bindings remain stable. Drafts continue to track
 * the headline live so authors can rename freely before review.
 */

import type { WorkflowState } from '../../homepage/data/publisherAdapter/publisherEnums.js';

/** Hard upper bound for slug length. Matches typical CMS-friendly limits. */
export const SLUG_MAX_LENGTH = 80;

/**
 * Lossy normalisation of a free-text title to a URL-safe slug
 * candidate. Non-alphanumeric runs collapse to a single hyphen;
 * leading and trailing hyphens are trimmed; length is capped.
 */
export function generateSlugFromTitle(title: string): string {
  const lowered = title.toLowerCase();
  const cleaned = lowered
    .replace(/['"`’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
  return cleaned.replace(/-+$/g, '');
}

/**
 * Resolve a slug candidate from the article. Falls back to a stable
 * `untitled-<id-tail>` slug when the title produces no usable
 * characters, so an article can always be saved even before a
 * headline exists.
 */
export function generateSlug(article: {
  readonly Title: string;
  readonly ArticleId: string;
}): string {
  const fromTitle = generateSlugFromTitle(article.Title ?? '');
  if (fromTitle.length > 0) return fromTitle;
  const tail = article.ArticleId.slice(-6) || 'article';
  return `untitled-${tail}`;
}

/**
 * Append `-2`, `-3`, … until the candidate does not collide with any
 * slug already in use. Length is honoured by trimming the base when
 * the suffix would exceed `SLUG_MAX_LENGTH`. Falls back to a
 * timestamp suffix in the pathological case of >999 collisions on
 * the same base.
 */
export function applySlugUniqueness(
  candidate: string,
  takenSlugs: ReadonlySet<string>,
): string {
  if (candidate.length === 0) return candidate;
  if (!takenSlugs.has(candidate)) return candidate;
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const suffixStr = String(suffix);
    const room = SLUG_MAX_LENGTH - suffixStr.length - 1; // hyphen + suffix
    const base = candidate.length > room
      ? candidate.slice(0, room).replace(/-+$/g, '')
      : candidate;
    const next = `${base}-${suffixStr}`;
    if (!takenSlugs.has(next)) return next;
  }
  const stamp = Date.now().toString(36).slice(-6);
  const stampRoom = SLUG_MAX_LENGTH - stamp.length - 1;
  const base = candidate.slice(0, stampRoom).replace(/-+$/g, '');
  return `${base}-${stamp}`;
}

/**
 * Should the slug be regenerated on this save?
 *
 * Slug is regenerated while the article is still in `draft` (so the
 * author can iterate on the headline freely) or whenever the
 * persisted slug is missing. After the article leaves draft, the
 * persisted slug is preserved so external links remain stable.
 */
export function shouldRegenerateSlug(
  workflowState: WorkflowState,
  currentSlug: string | undefined | null,
): boolean {
  if (!currentSlug || currentSlug.trim().length === 0) return true;
  return workflowState === 'draft';
}

/**
 * End-to-end resolver: produce the slug to persist for an article on
 * save, given the other articles already in the workspace. The
 * caller is responsible for excluding the article's own current slug
 * from `takenSlugs` so a re-save of the same article does not
 * collide with itself.
 */
export function resolveSlugForSave(
  article: {
    readonly Title: string;
    readonly ArticleId: string;
    readonly Slug?: string | null;
    readonly WorkflowState: WorkflowState;
  },
  takenSlugs: ReadonlySet<string>,
): string {
  if (!shouldRegenerateSlug(article.WorkflowState, article.Slug ?? undefined)) {
    return article.Slug as string;
  }
  return applySlugUniqueness(generateSlug(article), takenSlugs);
}

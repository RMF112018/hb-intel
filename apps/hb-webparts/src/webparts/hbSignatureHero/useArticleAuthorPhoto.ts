/**
 * useArticleAuthorPhoto — neutral author photo resolver for article mode.
 *
 * Reuses the shared `usePersonPhotoCache` seam from
 * `@hbc/ui-kit/homepage` — the same primitive the people-picker and
 * Kudos recipient hydration consume — without depending on any Kudos
 * domain code, recognition types, or feed/composer logic.
 *
 * Resolution order (first non-null wins):
 *   1. explicit `authorPhotoUrl`
 *   2. Graph-resolved photo keyed by `authorUpn` via the provided
 *      `fetchPersonPhoto` adapter
 *   3. undefined — caller renders the initials / no-photo fallback
 *
 * Caching is provided by `usePersonPhotoCache` (per-key, per-hook
 * instance, with automatic blob URL cleanup). When neither field is
 * present the hook returns `undefined` without invoking the adapter.
 */
import { usePersonPhotoCache, type PersonPhotoFn } from '@hbc/ui-kit/homepage';

export interface UseArticleAuthorPhotoInput {
  authorUpn?: string;
  authorPhotoUrl?: string;
  fetchPersonPhoto?: PersonPhotoFn;
}

export function useArticleAuthorPhoto(
  input: UseArticleAuthorPhotoInput,
): string | undefined {
  const { authorPhotoUrl, authorUpn, fetchPersonPhoto } = input;
  const { getPhoto } = usePersonPhotoCache(fetchPersonPhoto);

  if (authorPhotoUrl) return authorPhotoUrl;
  if (!authorUpn || !fetchPersonPhoto) return undefined;

  const entry = getPhoto(authorUpn);
  return entry.state === 'available' ? entry.url : undefined;
}

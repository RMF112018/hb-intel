/**
 * useRecipientPhotoHydration — Graph-backed recipient photo cache.
 *
 * Owns a single concern: fetch individual recipient photos via the
 * provided Graph photo fn, memoize them by email, and expose a
 * hydrator that injects the cached photos into KudosEntry recipients
 * for downstream surface components (PublicKudosSurface, ArchiveList,
 * KudosFeedBody).
 *
 * Phase-19 Wave 2 hook-discipline scrub: the previous implementation
 * required an `exhaustive-deps` suppression because including the
 * cache in the effect's deps would re-trigger the effect on every
 * write. The cache is now read from a ref inside the effect so the
 * deps array is `[fetchPersonPhoto, entries]` — honest and lint-clean.
 */
import * as React from 'react';
import { createGraphPersonPhotoFn } from '@hbc/ui-kit/homepage';
import type { KudosEntry } from '../../../homepage/webparts/kudosContracts.js';

export interface UseRecipientPhotoHydrationResult {
  hydrate: (entries: KudosEntry[]) => KudosEntry[];
}

export function useRecipientPhotoHydration(
  entries: KudosEntry[],
  getGraphToken?: () => Promise<string>,
): UseRecipientPhotoHydrationResult {
  const fetchPersonPhoto = React.useMemo(
    () => (getGraphToken ? createGraphPersonPhotoFn(getGraphToken) : undefined),
    [getGraphToken],
  );

  const [cache, setCache] = React.useState<Record<string, string>>({});
  const cacheRef = React.useRef(cache);
  React.useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  React.useEffect(() => {
    if (!fetchPersonPhoto || entries.length === 0) return;
    let cancelled = false;
    const emails = new Set<string>();
    for (const entry of entries) {
      for (const r of entry.recipients) {
        if (r.recipientType === 'individual' && r.email && !cacheRef.current[r.email]) {
          emails.add(r.email);
        }
      }
    }
    if (emails.size === 0) return;
    const fetchAll = async (): Promise<void> => {
      const results: Record<string, string> = {};
      for (const email of emails) {
        try {
          const url = await fetchPersonPhoto(email);
          if (url && !cancelled) results[email] = url;
        } catch { /* no photo available — initials fallback */ }
      }
      if (!cancelled && Object.keys(results).length > 0) {
        setCache((prev) => ({ ...prev, ...results }));
      }
    };
    void fetchAll();
    return () => { cancelled = true; };
  }, [fetchPersonPhoto, entries]);

  const hydrate = React.useCallback(
    (list: KudosEntry[]): KudosEntry[] => {
      if (Object.keys(cache).length === 0) return list;
      return list.map((entry) => ({
        ...entry,
        recipients: entry.recipients.map((r) => {
          if (r.recipientType !== 'individual' || !r.email) return r;
          const photoUrl = cache[r.email];
          if (!photoUrl) return r;
          return { ...r, media: { src: photoUrl, alt: r.name } };
        }),
      }));
    },
    [cache],
  );

  return { hydrate };
}

export function useGraphPersonPhotoFn(
  getGraphToken?: () => Promise<string>,
): ReturnType<typeof createGraphPersonPhotoFn> | undefined {
  return React.useMemo(
    () => (getGraphToken ? createGraphPersonPhotoFn(getGraphToken) : undefined),
    [getGraphToken],
  );
}

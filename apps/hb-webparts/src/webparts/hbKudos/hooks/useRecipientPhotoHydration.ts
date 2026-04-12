/**
 * useRecipientPhotoHydration — Graph-backed recipient photo cache.
 *
 * Extracted from HbKudos.tsx (phase-19 Wave 2 orchestration refactor).
 * Owns a single concern: fetch individual recipient photos via the
 * provided Graph photo fn, memoize them by email, and expose a
 * hydrator that injects the cached photos into KudosEntry recipients
 * for downstream surface components (PublicKudosSurface, ArchiveList,
 * KudosFeedBody).
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

  React.useEffect(() => {
    if (!fetchPersonPhoto || entries.length === 0) return;
    let cancelled = false;
    const emails = new Set<string>();
    for (const entry of entries) {
      for (const r of entry.recipients) {
        if (r.recipientType === 'individual' && r.email && !cache[r.email]) {
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
  }, [fetchPersonPhoto, entries]); // eslint-disable-line react-hooks/exhaustive-deps

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

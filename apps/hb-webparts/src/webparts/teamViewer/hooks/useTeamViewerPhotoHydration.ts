/**
 * useTeamViewerPhotoHydration — Graph-backed photo cache for TeamViewer.
 *
 * Generic over `TeamViewerPerson`; keyed by email/upn. Modeled on the
 * Kudos recipient-photo hydrator but with no Kudos domain coupling.
 * When two or more webparts need this mechanic, consolidate to
 * `homepage/shared/usePersonPhotoHydration.ts`.
 */
import * as React from 'react';
import { createGraphPersonPhotoFn } from '@hbc/ui-kit/homepage';
import type { TeamViewerPerson } from '../teamViewerContracts.js';

export interface UseTeamViewerPhotoHydrationResult {
  hydrate: (people: TeamViewerPerson[]) => TeamViewerPerson[];
}

function photoKey(person: TeamViewerPerson): string | undefined {
  return person.email ?? person.upn;
}

export function useTeamViewerPhotoHydration(
  people: TeamViewerPerson[],
  getGraphToken?: () => Promise<string>,
): UseTeamViewerPhotoHydrationResult {
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
    if (!fetchPersonPhoto || people.length === 0) return;
    let cancelled = false;
    const keys = new Set<string>();
    for (const p of people) {
      if (p.photoUrl) continue;
      const k = photoKey(p);
      if (k && !cacheRef.current[k]) keys.add(k);
    }
    if (keys.size === 0) return;
    const fetchAll = async (): Promise<void> => {
      const results: Record<string, string> = {};
      for (const key of keys) {
        try {
          const url = await fetchPersonPhoto(key);
          if (url && !cancelled) results[key] = url;
        } catch {
          /* no photo available — initials fallback */
        }
      }
      if (!cancelled && Object.keys(results).length > 0) {
        setCache((prev) => ({ ...prev, ...results }));
      }
    };
    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [fetchPersonPhoto, people]);

  const hydrate = React.useCallback(
    (list: TeamViewerPerson[]): TeamViewerPerson[] => {
      if (Object.keys(cache).length === 0) return list;
      return list.map((p) => {
        if (p.photoUrl) return p;
        const k = photoKey(p);
        const resolved = k ? cache[k] : undefined;
        return resolved ? { ...p, photoUrl: resolved } : p;
      });
    },
    [cache],
  );

  return { hydrate };
}

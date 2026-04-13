/**
 * useTeamViewerPhotoHydration — layered photo resolution for TeamViewer.
 *
 * Precedence (implemented here, see `photos/teamViewerPhotoResolvers.ts`
 * for the locked doctrine):
 *
 *   1. explicit `person.photoUrl`
 *   2. SharePoint `/_layouts/15/userphoto.aspx` (deterministic, no fetch)
 *   3. Graph-backed person photo (async blob URL, only when SP is not
 *      configured — i.e., no siteUrl is available)
 *   4. initials fallback (owned by the card component on missing URL
 *      OR broken-image onError)
 *
 * The hook returns a `hydrate(list)` mapper plus the last-resolved
 * `photoSource` so higher layers can reflect provenance if needed.
 *
 * Malformed-record policy: the normalization layer already drops rows
 * without a display name and coerces malformed scalars to `undefined`.
 * This hook layers photo resolution on top and never introduces broken
 * URLs — on a fetch failure it simply leaves `photoUrl` undefined.
 */
import * as React from 'react';
import { createGraphPersonPhotoFn } from '@hbc/ui-kit/homepage';
import type { TeamViewerPerson } from '../teamViewerContracts.js';
import {
  createTeamViewerSyncPhotoResolver,
  personPhotoKey,
  type TeamViewerPhotoSource,
} from '../photos/teamViewerPhotoResolvers.js';

export interface UseTeamViewerPhotoHydrationOptions {
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
}

export interface UseTeamViewerPhotoHydrationResult {
  hydrate: (people: TeamViewerPerson[]) => TeamViewerPerson[];
  /** Per-id source tag — useful for diagnostics and tests. */
  sources: Readonly<Record<string, TeamViewerPhotoSource>>;
}

export function useTeamViewerPhotoHydration(
  people: TeamViewerPerson[],
  options: UseTeamViewerPhotoHydrationOptions = {},
): UseTeamViewerPhotoHydrationResult {
  const { siteUrl, getGraphToken } = options;

  const syncResolver = React.useMemo(
    () => createTeamViewerSyncPhotoResolver({ siteUrl }),
    [siteUrl],
  );

  const graphFetch = React.useMemo(
    () => (getGraphToken ? createGraphPersonPhotoFn(getGraphToken) : undefined),
    [getGraphToken],
  );

  const [graphCache, setGraphCache] = React.useState<Record<string, string>>({});
  const [sources, setSources] = React.useState<Record<string, TeamViewerPhotoSource>>({});
  const graphCacheRef = React.useRef(graphCache);
  React.useEffect(() => {
    graphCacheRef.current = graphCache;
  }, [graphCache]);

  // Layered effect: only fetch Graph for people the sync resolver
  // couldn't place (no siteUrl or no photo key via SP). Skips people
  // already covered by explicit photoUrl.
  React.useEffect(() => {
    if (!graphFetch || people.length === 0) return;
    // When SP is available it supplies precedence 2; Graph is redundant.
    if (siteUrl && siteUrl.length > 0) return;

    let cancelled = false;
    const keys = new Set<string>();
    for (const p of people) {
      if (p.photoUrl) continue;
      const k = personPhotoKey(p);
      if (k && !graphCacheRef.current[k]) keys.add(k);
    }
    if (keys.size === 0) return;

    const fetchAll = async (): Promise<void> => {
      const results: Record<string, string> = {};
      for (const key of keys) {
        try {
          const url = await graphFetch(key);
          if (url && !cancelled) results[key] = url;
        } catch {
          /* Graph failure → leave undefined → initials fallback. */
        }
      }
      if (!cancelled && Object.keys(results).length > 0) {
        setGraphCache((prev) => ({ ...prev, ...results }));
      }
    };
    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [graphFetch, people, siteUrl]);

  const hydrate = React.useCallback(
    (list: TeamViewerPerson[]): TeamViewerPerson[] => {
      const next = list.map((p) => {
        const sync = syncResolver(p);
        if (sync.url) {
          return { ...p, photoUrl: sync.url };
        }
        const key = personPhotoKey(p);
        const graphUrl = key ? graphCache[key] : undefined;
        if (graphUrl) {
          return { ...p, photoUrl: graphUrl };
        }
        return p;
      });
      return next;
    },
    [syncResolver, graphCache],
  );

  // Track the provenance of the last hydrate pass. Kept as a separate
  // state update so React can batch alongside the hydrate memo above.
  React.useEffect(() => {
    if (people.length === 0) {
      if (Object.keys(sources).length > 0) setSources({});
      return;
    }
    const next: Record<string, TeamViewerPhotoSource> = {};
    for (const p of people) {
      const sync = syncResolver(p);
      if (sync.url) {
        next[p.id] = sync.source;
        continue;
      }
      const key = personPhotoKey(p);
      if (key && graphCache[key]) {
        next[p.id] = 'graph';
        continue;
      }
      next[p.id] = 'initials';
    }
    setSources(next);
    // Intentionally exclude `sources` from deps; it's derived.

  }, [people, syncResolver, graphCache]);

  return { hydrate, sources };
}

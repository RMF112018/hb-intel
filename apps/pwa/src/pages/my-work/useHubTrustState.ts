/**
 * useHubTrustState — P2-B3 §4–§6.
 * Derives hub trust display state from feed result and connectivity.
 */
import { useMemo, useRef } from 'react';
import { useConnectivity } from '@hbc/session-state';
import type { ConnectivityStatus } from '@hbc/session-state';
import type { IMyWorkFeedResult, MyWorkSource } from '@hbc/my-work-feed';
import { FEED_FRESHNESS_WINDOW_MS } from './trustStateConstants.js';

export interface IHubTrustState {
  freshness: 'live' | 'cached' | 'partial' | 'queued';
  /** P2-B3 §5: When data was last confirmed good (all sources healthy). */
  lastTrustedDataIso: string | null;
  /** P2-B3 §5: When a refresh was last attempted (regardless of success). */
  lastRefreshAttemptIso: string | null;
  isWithinFreshnessWindow: boolean;
  isStaleWhileRevalidating: boolean;
  connectivity: ConnectivityStatus;
  degradedSourceCount: number;
  /** UIF-011: Source keys that failed to load. Empty array when all sources healthy. */
  degradedSources: MyWorkSource[];
}

export function useHubTrustState(
  feed: IMyWorkFeedResult | undefined,
  isLoading: boolean,
): IHubTrustState {
  const connectivity = useConnectivity();

  // FRS-01: Track when data was last confirmed good across re-renders.
  // Updated only when freshness is 'live' (all sources healthy).
  const lastTrustedRef = useRef<string | null>(null);

  return useMemo(() => {
    // FRS-02 / UX-F3: Preserve 'queued' as a distinct trust state per P2-B3 §3.
    const freshness = (feed?.healthState?.freshness ?? 'live') as
      | 'live' | 'cached' | 'partial' | 'queued';

    // FRS-01: Split timestamp model per P2-B3 §5.
    // lastRefreshAttemptIso: always reflects the latest aggregation attempt.
    // lastTrustedDataIso: reflects the last time all sources were healthy.
    const lastRefreshAttemptIso = feed?.lastRefreshedIso ?? null;

    if (freshness === 'live' && lastRefreshAttemptIso) {
      lastTrustedRef.current = lastRefreshAttemptIso;
    }
    const lastTrustedDataIso = lastTrustedRef.current;

    // Freshness window measures trusted data age, not attempt age.
    const isWithinFreshnessWindow = lastTrustedDataIso
      ? Date.now() - new Date(lastTrustedDataIso).getTime() < FEED_FRESHNESS_WINDOW_MS
      : true; // No timestamp yet — treat as fresh (loading state)

    // Stale-while-revalidate: data is stale but a refresh is in progress
    const isStaleWhileRevalidating =
      (feed?.isStale === true || !isWithinFreshnessWindow) && isLoading;

    const degradedSourceCount = feed?.healthState?.degradedSourceCount ?? 0;
    const degradedSources = (feed?.healthState?.degradedSources ?? []) as MyWorkSource[];

    return {
      freshness,
      lastTrustedDataIso,
      lastRefreshAttemptIso,
      isWithinFreshnessWindow,
      isStaleWhileRevalidating,
      connectivity,
      degradedSourceCount,
      degradedSources,
    };
  }, [feed, isLoading, connectivity]);
}

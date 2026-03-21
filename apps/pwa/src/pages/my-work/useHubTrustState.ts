/**
 * useHubTrustState — P2-B3 §4–§6.
 * Derives hub trust display state from feed result and connectivity.
 */
import { useMemo } from 'react';
import { useConnectivity } from '@hbc/session-state';
import type { ConnectivityStatus } from '@hbc/session-state';
import type { IMyWorkFeedResult, MyWorkSource } from '@hbc/my-work-feed';
import { FEED_FRESHNESS_WINDOW_MS } from './trustStateConstants.js';

export interface IHubTrustState {
  freshness: 'live' | 'cached' | 'partial';
  lastRefreshedIso: string | null;
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

  return useMemo(() => {
    const freshness = feed?.healthState?.freshness ?? 'live';
    // Exclude 'queued' from freshness per P2-B3 §4.1 — treat as live
    const normalizedFreshness =
      freshness === 'queued' ? 'live' : (freshness as 'live' | 'cached' | 'partial');

    const lastRefreshedIso = feed?.lastRefreshedIso ?? null;

    const isWithinFreshnessWindow = lastRefreshedIso
      ? Date.now() - new Date(lastRefreshedIso).getTime() < FEED_FRESHNESS_WINDOW_MS
      : true; // No timestamp yet — treat as fresh (loading state)

    // Stale-while-revalidate: data is stale but a refresh is in progress
    const isStaleWhileRevalidating =
      (feed?.isStale === true || !isWithinFreshnessWindow) && isLoading;

    const degradedSourceCount = feed?.healthState?.degradedSourceCount ?? 0;
    const degradedSources = (feed?.healthState?.degradedSources ?? []) as MyWorkSource[];

    return {
      freshness: normalizedFreshness,
      lastRefreshedIso,
      isWithinFreshnessWindow,
      isStaleWhileRevalidating,
      connectivity,
      degradedSourceCount,
      degradedSources,
    };
  }, [feed, isLoading, connectivity]);
}

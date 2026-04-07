/**
 * React hook that fetches People & Culture data from SharePoint lists.
 *
 * When running inside SPFx (site URL available), lists are the primary
 * data source. When running locally or without SPFx context, returns
 * undefined so the component falls back to manifest config props.
 *
 * Follows the same pattern as useProjectSpotlightData.ts.
 */
import { useState, useEffect, useRef } from 'react';
import { getSiteUrl } from './spContext.js';
import { fetchPeopleCultureListData } from './peopleCultureListSource.js';
import type { PeopleCultureMergedConfig } from '../webparts/communicationsContracts.js';

export interface PeopleCultureDataResult {
  /** List-sourced config, or undefined when unavailable (triggers prop fallback). */
  listConfig: Partial<PeopleCultureMergedConfig> | undefined;
  /** True while the initial fetch is in progress. */
  isLoading: boolean;
  /** Non-null when the fetch failed (component should fall back to prop config). */
  error: string | undefined;
}

/** Cache to prevent duplicate fetches across re-renders. */
let _cache: { config: Partial<PeopleCultureMergedConfig>; fetchedAt: number } | undefined;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function usePeopleCultureData(): PeopleCultureDataResult {
  const siteUrl = getSiteUrl();
  const [result, setResult] = useState<PeopleCultureDataResult>(() => {
    // If cache is still fresh, use it immediately (no loading flash)
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
      return { listConfig: _cache.config, isLoading: false, error: undefined };
    }
    // No SPFx context → signal fallback immediately (no loading state)
    if (!siteUrl) {
      return { listConfig: undefined, isLoading: false, error: undefined };
    }
    return { listConfig: undefined, isLoading: true, error: undefined };
  });

  const abortRef = useRef<AbortController | undefined>();

  useEffect(() => {
    if (!siteUrl) return;

    // Cache still valid → skip fetch
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) return;

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    (async () => {
      try {
        const { config } = await fetchPeopleCultureListData(siteUrl);
        if (cancelled) return;

        _cache = { config, fetchedAt: Date.now() };
        setResult({ listConfig: config, isLoading: false, error: undefined });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load People & Culture data';
        setResult({ listConfig: undefined, isLoading: false, error: message });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [siteUrl]);

  return result;
}

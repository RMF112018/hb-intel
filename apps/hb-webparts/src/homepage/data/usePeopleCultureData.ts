/**
 * React hook that fetches People & Culture data from SharePoint lists.
 *
 * When running inside SPFx (site URL available), lists are the primary
 * data source. When running locally or without SPFx context, returns
 * undefined so the component falls back to manifest config props.
 *
 * Follows the same pattern as useProjectSpotlightData.ts.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createCacheInvalidationBus } from '@hbc/sharepoint-platform';
import { getKudosListHostUrl } from './spContext.js';
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

/**
 * Cache invalidation bus — generation bumps whenever
 * `invalidatePeopleCultureCache` is called. Hooks subscribe via the
 * bus so re-fetch is triggered without polling a module-level counter.
 */
const _cacheBus = createCacheInvalidationBus();

/**
 * Clear the shared People & Culture data cache so the next render
 * triggers a fresh fetch from SharePoint. Call this after any
 * mutation (governance action, new submission, celebrate, etc.)
 * to prevent stale-after-action UI.
 */
export function invalidatePeopleCultureCache(): void {
  _cache = undefined;
  _cacheBus.invalidate();
}

export interface PeopleCultureDataResultWithRefresh extends PeopleCultureDataResult {
  /** Force a fresh fetch from SharePoint, clearing the cache. */
  refresh: () => void;
}

export function usePeopleCultureData(): PeopleCultureDataResultWithRefresh {
  const siteUrl = getKudosListHostUrl();
  const [generation, setGeneration] = useState(_cacheBus.getGeneration());
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

  // Subscribe to external invalidations via the shared cache bus.
  useEffect(() => {
    return _cacheBus.subscribe(() => {
      setGeneration(_cacheBus.getGeneration());
    });
  }, []);

  const refresh = useCallback(() => {
    invalidatePeopleCultureCache();
  }, []);

  useEffect(() => {
    if (!siteUrl) return;

    // Cache still valid → skip fetch
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) return;

    setResult((prev) => prev.isLoading ? prev : { ...prev, isLoading: true });

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    (async () => {
      try {
        const { config, errors } = await fetchPeopleCultureListData(siteUrl);
        if (cancelled) return;

        // When all lists return empty arrays (failed or truly empty), return
        // undefined so the component falls back to manifest config props.
        const hasData = Boolean(
          config.announcements?.length ||
            config.kudos?.length ||
            config.celebrations?.length,
        );

        _cache = { config, fetchedAt: Date.now() };

        // `error` is reserved for genuine binding/network failures so the
        // consumer can render a distinct load-failure state. A successful
        // fetch where all lists are simply empty is a legitimate true-empty
        // condition — it must NOT be flagged as an error. Consumers
        // distinguish true-empty from error via (listConfig === undefined
        // && error === undefined).
        const bindingError = errors.length > 0 ? errors.join(' | ') : undefined;

        setResult({
          listConfig: hasData ? config : undefined,
          isLoading: false,
          error: bindingError,
        });
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
  }, [siteUrl, generation]);

  return { ...result, refresh };
}

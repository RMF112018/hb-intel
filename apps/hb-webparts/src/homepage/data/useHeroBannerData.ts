/**
 * React hook that resolves the Hero Banner config from the hosted
 * SharePoint list, with cache + graceful fallback to prop/manifest
 * config when SPFx context is absent or the list query fails.
 *
 * Mirrors the pattern used by `useProjectSpotlightData` /
 * `useToolLauncherData` so behavior stays consistent across the
 * homepage data seams.
 */
import { useEffect, useRef, useState } from 'react';
import { getSiteUrl } from './spContext.js';
import { fetchHeroBannerListConfig } from './heroBannerListSource.js';
import type { HbHeroBannerConfig } from '../webparts/topBandContracts.js';

export interface HeroBannerDataResult {
  /**
   * List-sourced config, or `undefined` when no enabled row exists
   * or when SPFx context is unavailable. `undefined` is the signal
   * to fall back to manifest/property config at the consumer.
   */
  listConfig: Partial<HbHeroBannerConfig> | undefined;
  isLoading: boolean;
  error: string | undefined;
}

interface CacheEntry {
  siteUrl: string;
  config: Partial<HbHeroBannerConfig> | undefined;
  fetchedAt: number;
}

let _cache: CacheEntry | undefined;
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Invalidate the in-memory cache. Exposed for admin-app write flows. */
export function invalidateHeroBannerCache(): void {
  _cache = undefined;
}

function cacheHit(siteUrl: string): CacheEntry | undefined {
  if (!_cache) return undefined;
  if (_cache.siteUrl !== siteUrl) return undefined;
  if (Date.now() - _cache.fetchedAt >= CACHE_TTL_MS) return undefined;
  return _cache;
}

export function useHeroBannerData(): HeroBannerDataResult {
  const siteUrl = getSiteUrl();
  const [result, setResult] = useState<HeroBannerDataResult>(() => {
    if (siteUrl) {
      const hit = cacheHit(siteUrl);
      if (hit) {
        return { listConfig: hit.config, isLoading: false, error: undefined };
      }
      return { listConfig: undefined, isLoading: true, error: undefined };
    }
    return { listConfig: undefined, isLoading: false, error: undefined };
  });

  const abortRef = useRef<AbortController | undefined>();

  useEffect(() => {
    if (!siteUrl) return;
    if (cacheHit(siteUrl)) return;

    const controller = new AbortController();
    abortRef.current = controller;
    let cancelled = false;

    (async () => {
      try {
        const config = await fetchHeroBannerListConfig(siteUrl);
        if (cancelled) return;
        _cache = { siteUrl, config, fetchedAt: Date.now() };
        setResult({ listConfig: config, isLoading: false, error: undefined });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load Hero Banner config';
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

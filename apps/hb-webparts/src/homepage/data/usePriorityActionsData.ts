/**
 * React hook that resolves Priority Actions config and items from the
 * hosted SharePoint lists, with cache + graceful fallback when SPFx
 * context is absent or queries fail.
 *
 * Mirrors the pattern used by `useHeroBannerData` /
 * `useToolLauncherData` so behavior stays consistent across the
 * homepage data seams.
 */
import { useEffect, useRef, useState } from 'react';
import { getSiteUrl } from './spContext.js';
import { fetchPriorityActionsConfig } from './priorityActionsConfigListSource.js';
import { fetchPriorityActionsItems } from './priorityActionsItemsListSource.js';
import type { PriorityActionsConfigResolved, PriorityActionsItemNormalized } from './priorityActionsContracts.js';
import { normalizeItemRows, filterByAudience, filterBySchedule } from './priorityActionsNormalization.js';
import type { RawPriorityActionsItemRow } from './priorityActionsItemsListDescriptor.js';

export interface PriorityActionsDataResult {
  config: PriorityActionsConfigResolved | undefined;
  items: PriorityActionsItemNormalized[];
  isLoading: boolean;
  error: string | undefined;
}

interface CacheEntry {
  siteUrl: string;
  bandKey: string;
  config: PriorityActionsConfigResolved | undefined;
  rawItems: RawPriorityActionsItemRow[];
  fetchedAt: number;
}

let _cache: CacheEntry | undefined;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidatePriorityActionsCache(): void {
  _cache = undefined;
}

function cacheHit(siteUrl: string, bandKey: string): CacheEntry | undefined {
  if (!_cache) return undefined;
  if (_cache.siteUrl !== siteUrl || _cache.bandKey !== bandKey) return undefined;
  if (Date.now() - _cache.fetchedAt >= CACHE_TTL_MS) return undefined;
  return _cache;
}

function deriveItems(
  rawItems: RawPriorityActionsItemRow[],
  activeAudience: string | undefined,
): PriorityActionsItemNormalized[] {
  let items = normalizeItemRows(rawItems);
  items = filterByAudience(items, activeAudience);
  items = filterBySchedule(items);
  return items;
}

export interface UsePriorityActionsDataOptions {
  bandKey?: string;
  activeAudience?: string;
}

export function usePriorityActionsData(
  options: UsePriorityActionsDataOptions = {},
): PriorityActionsDataResult {
  const { bandKey = 'homepage-primary', activeAudience } = options;
  const siteUrl = getSiteUrl();

  const [result, setResult] = useState<PriorityActionsDataResult>(() => {
    if (siteUrl) {
      const hit = cacheHit(siteUrl, bandKey);
      if (hit) {
        return {
          config: hit.config,
          items: deriveItems(hit.rawItems, activeAudience),
          isLoading: false,
          error: undefined,
        };
      }
      return { config: undefined, items: [], isLoading: true, error: undefined };
    }
    return { config: undefined, items: [], isLoading: false, error: undefined };
  });

  const abortRef = useRef<AbortController | undefined>();

  useEffect(() => {
    if (!siteUrl) return;
    if (cacheHit(siteUrl, bandKey)) return;

    const controller = new AbortController();
    abortRef.current = controller;
    let cancelled = false;

    (async () => {
      try {
        const [config, rawItems] = await Promise.all([
          fetchPriorityActionsConfig(siteUrl, bandKey),
          fetchPriorityActionsItems(siteUrl, bandKey),
        ]);
        if (cancelled) return;
        _cache = { siteUrl, bandKey, config, rawItems, fetchedAt: Date.now() };
        setResult({
          config,
          items: deriveItems(rawItems, activeAudience),
          isLoading: false,
          error: undefined,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load Priority Actions data';
        setResult({ config: undefined, items: [], isLoading: false, error: message });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [siteUrl, bandKey, activeAudience]);

  return result;
}

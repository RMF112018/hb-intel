/**
 * React hook that fetches Tool Launcher data from the SharePoint list.
 *
 * When running inside SPFx (site URL available), the list is the primary
 * data source. When running locally or without SPFx context, returns
 * undefined so the component falls back to manifest config props.
 */
import { useState, useEffect, useRef } from 'react';
import { getSiteUrl } from './spContext.js';
import { fetchToolLauncherListItems } from './toolLauncherListSource.js';
import type { LauncherPlatformRecord } from '../webparts/toolLauncherContracts.js';

export interface ToolLauncherDataResult {
  /** Normalized platform records from the list, or undefined when unavailable (triggers prop fallback). */
  platforms: LauncherPlatformRecord[] | undefined;
  /** True while the initial fetch is in progress. */
  isLoading: boolean;
  /** Non-null when the fetch failed (component should fall back to prop config). */
  error: string | undefined;
}

/** Cache to prevent duplicate fetches across re-renders. */
let _cache: { platforms: LauncherPlatformRecord[]; fetchedAt: number } | undefined;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useToolLauncherData(): ToolLauncherDataResult {
  const siteUrl = getSiteUrl();
  const [result, setResult] = useState<ToolLauncherDataResult>(() => {
    // If cache is still fresh, use it immediately (no loading flash)
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
      return { platforms: _cache.platforms, isLoading: false, error: undefined };
    }
    // No SPFx context → signal fallback immediately (no loading state)
    if (!siteUrl) {
      return { platforms: undefined, isLoading: false, error: undefined };
    }
    return { platforms: undefined, isLoading: true, error: undefined };
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
        const platforms = await fetchToolLauncherListItems(siteUrl);
        if (cancelled) return;

        _cache = { platforms, fetchedAt: Date.now() };
        setResult({ platforms, isLoading: false, error: undefined });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load tool launcher data';
        setResult({ platforms: undefined, isLoading: false, error: message });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [siteUrl]);

  return result;
}

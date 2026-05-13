/**
 * React hook that reads the Adobe Sign OAuth callback marker on mount,
 * returns the typed result, and cleans the URL so a refresh doesn't
 * re-show the banner.
 *
 * The default seams read `window.location.search` and call
 * `history.replaceState({}, '', newUrl)`. Both seams are injectable for
 * tests.
 *
 * @module runtime/useAdobeSignCallbackResult
 */

import { useEffect, useRef, useState } from 'react';

import {
  parseAdobeSignCallbackResult,
  stripAdobeSignCallbackFromSearch,
  type AdobeSignCallbackResult,
} from '../state/adobeSignCallbackResult.js';

export interface UseAdobeSignCallbackResultOptions {
  /** Defaults to `() => window.location.search`. */
  readonly readSearch?: () => string;
  /**
   * Receives the cleaned search string (e.g., `''` or `'?other=1'`) and
   * is responsible for updating the browser URL. Defaults to a wrapper
   * around `history.replaceState`.
   */
  readonly cleanUrl?: (cleanedSearch: string) => void;
}

function defaultReadSearch(): string {
  if (typeof window === 'undefined' || !window.location) return '';
  return window.location.search;
}

function defaultCleanUrl(cleanedSearch: string): void {
  if (typeof window === 'undefined' || !window.history || !window.location) return;
  const { pathname, hash } = window.location;
  const nextUrl = `${pathname}${cleanedSearch}${hash}`;
  window.history.replaceState({}, '', nextUrl);
}

export function useAdobeSignCallbackResult(
  options?: UseAdobeSignCallbackResultOptions,
): AdobeSignCallbackResult | null {
  const readSearch = options?.readSearch ?? defaultReadSearch;
  const cleanUrl = options?.cleanUrl ?? defaultCleanUrl;
  const consumedRef = useRef(false);
  const [result, setResult] = useState<AdobeSignCallbackResult | null>(() =>
    parseAdobeSignCallbackResult(readSearch()),
  );

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    const search = readSearch();
    const parsed = parseAdobeSignCallbackResult(search);
    if (!parsed) return;
    // Sync state — parseAdobeSignCallbackResult is deterministic, so the
    // initial useState may already hold the same value. Setting again is a
    // no-op when references match (rare; we still call to defend against
    // SSR initial mismatch).
    setResult(parsed);
    cleanUrl(stripAdobeSignCallbackFromSearch(search));
    // The hook intentionally runs once at mount; injected seams are
    // captured by closure and read inside the effect, so we don't need
    // them in the deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}

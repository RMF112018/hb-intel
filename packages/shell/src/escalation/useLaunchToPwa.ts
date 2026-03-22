import { useCallback, useMemo } from 'react';
import { buildPwaDeepLink, type PwaDeepLinkParams } from './buildPwaDeepLink.js';

/**
 * React hook for SPFx-to-PWA cross-lane escalation.
 *
 * Provides a `launch` function that opens the PWA in a new tab with
 * the constructed deep-link URL, and a `buildUrl` function for cases
 * where the caller needs the URL without triggering navigation.
 *
 * @param pwaBaseUrl - Base URL of the PWA (from tenant config or env)
 *
 * @example
 * const { launch } = useLaunchToPwa('https://app.example.com');
 * launch({
 *   projectId: 'proj-001',
 *   module: 'review',
 *   reviewArtifactId: 'artifact-uuid',
 *   view: 'thread',
 *   returnTo: window.location.pathname,
 * });
 */
export function useLaunchToPwa(pwaBaseUrl: string): {
  /** Open PWA deep-link in a new browser tab */
  launch: (params: PwaDeepLinkParams) => void;
  /** Build PWA deep-link URL without navigating */
  buildUrl: (params: PwaDeepLinkParams) => string;
} {
  const buildUrl = useCallback(
    (params: PwaDeepLinkParams) => buildPwaDeepLink(pwaBaseUrl, params),
    [pwaBaseUrl],
  );

  const launch = useCallback(
    (params: PwaDeepLinkParams) => {
      const url = buildPwaDeepLink(pwaBaseUrl, params);
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [pwaBaseUrl],
  );

  return useMemo(() => ({ launch, buildUrl }), [launch, buildUrl]);
}

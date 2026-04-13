/**
 * teamViewerHostContext — canonical list host for TeamViewer.
 *
 * TeamViewer binds to publisher-authored article lists that live on a
 * single canonical control-plane site:
 *
 *   https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 *
 * Render hosts (e.g. `/sites/CompanyPulse`, `/sites/ProjectSpotlight`)
 * are **consumers** of that control plane. They are never treated as
 * the list host. This module is the single source of truth for that
 * separation, so the runtime cannot accidentally route a list read at
 * the render host.
 *
 * For dev / harness scenarios a webpart property override is allowed
 * via `resolveTeamViewerListHostUrl(override)` but, per the Phase-01
 * topology lock, production always returns the canonical URL.
 */

/** Canonical publisher-list host for TeamViewer. Do not edit without an ADR. */
export const TEAM_VIEWER_CANONICAL_LIST_HOST_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral' as const;

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolve the list host URL. Accepts an optional absolute override
 * (used by the dev harness and by explicit config overrides); falls
 * back to the canonical HBCentral URL. Returns a URL with no trailing
 * slash so endpoint construction is deterministic.
 */
export function resolveTeamViewerListHostUrl(override?: string): string {
  const candidate = typeof override === 'string' ? override.trim() : '';
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return trimTrailingSlashes(candidate);
  }
  return TEAM_VIEWER_CANONICAL_LIST_HOST_URL;
}

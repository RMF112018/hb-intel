// ─────────────────────────────────────────────────────────────────────────────
// SPFx-to-PWA deep-link URL builder (Phase 3 Stage 0.4)
//
// Constructs deep-link URLs for cross-lane escalation from SPFx webparts
// to the PWA Project Hub. Follows the escalation mechanism defined in
// P3-G2 §7 and the query parameter contract in P3-G2 §2.3.
//
// Governing: P3-G2 §3, §7, §8.8
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parameters for constructing a PWA deep-link URL.
 *
 * @see P3-G2 §2.3 — Cross-lane query parameters
 */
export interface PwaDeepLinkParams {
  /** Canonical project ID (UUID) — mandatory for all escalation scenarios */
  projectId: string;
  /** Target module slug (e.g., 'schedule', 'financial', 'review') */
  module?: string;
  /** Action to perform on arrival (e.g., 'import', 'create') */
  action?: string;
  /** View mode to activate (e.g., 'history', 'thread', 'comparison') */
  view?: string;
  /** Executive review annotation artifact ID for closure-loop context (P3-G2 §8.8) */
  reviewArtifactId?: string;
  /** URL-encoded return path for back-navigation to SPFx */
  returnTo?: string;
  /** Source lane identifier for telemetry (defaults to 'spfx') */
  source?: string;
}

/**
 * Build a PWA deep-link URL for SPFx-to-PWA escalation.
 *
 * URL format: `{pwaBaseUrl}/project-hub/{projectId}/{module}?{queryParams}`
 *
 * @param pwaBaseUrl - Base URL of the PWA (e.g., 'https://hb-intel.example.com')
 * @param params - Deep-link parameters per P3-G2 §2.3
 * @returns Fully constructed deep-link URL
 *
 * @example
 * buildPwaDeepLink('https://app.example.com', {
 *   projectId: 'proj-001',
 *   module: 'schedule',
 *   action: 'import',
 *   returnTo: '/sites/project-hub',
 * });
 * // → 'https://app.example.com/project-hub/proj-001/schedule?action=import&returnTo=%2Fsites%2Fproject-hub&source=spfx'
 */
export function buildPwaDeepLink(
  pwaBaseUrl: string,
  params: PwaDeepLinkParams,
): string {
  const base = pwaBaseUrl.replace(/\/+$/, '');

  // Build path: /project-hub/{projectId}/{module?}
  let path = `${base}/project-hub/${encodeURIComponent(params.projectId)}`;
  if (params.module) {
    path += `/${encodeURIComponent(params.module)}`;
  }

  // Build query parameters
  const searchParams = new URLSearchParams();

  if (params.action) {
    searchParams.set('action', params.action);
  }
  if (params.view) {
    searchParams.set('view', params.view);
  }
  if (params.reviewArtifactId) {
    searchParams.set('reviewArtifactId', params.reviewArtifactId);
  }
  if (params.returnTo) {
    searchParams.set('returnTo', params.returnTo);
  }

  // Always append source for telemetry (defaults to 'spfx')
  searchParams.set('source', params.source ?? 'spfx');

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Phase 3 Stage 4.4 — Deep-link handler for cross-lane arrivals.
 *
 * Parses inbound deep-link URL parameters from SPFx-to-PWA escalation
 * and other cross-surface handoffs. Extracts projectId, module, action,
 * view, reviewArtifactId, returnTo, and source.
 *
 * Governing: P3-B1 §6 (Deep-link handling), P3-G2 §5 (Cross-lane params)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parsed deep-link parameters from an inbound URL.
 */
export interface DeepLinkParams {
  /** Canonical project ID from the URL path */
  projectId: string;
  /** Target module slug from the URL path (e.g., 'financial', 'schedule') */
  module?: string;
  /** Action to perform on arrival (e.g., 'import', 'create') */
  action?: string;
  /** View mode to activate (e.g., 'history', 'thread', 'comparison') */
  view?: string;
  /** Executive review artifact ID for closure-loop context */
  reviewArtifactId?: string;
  /** URL-encoded return path for back-navigation to source lane */
  returnTo?: string;
  /** Source lane identifier for telemetry (e.g., 'spfx') */
  source?: string;
}

/**
 * Result of deep-link URL parsing and resolution.
 */
export interface DeepLinkResolution {
  /** Whether the deep link contains a valid projectId */
  valid: boolean;
  /** Parsed parameters (null if invalid) */
  params: DeepLinkParams | null;
  /** Target path within the project context (e.g., '/financial') */
  targetPath: string;
  /** Whether a returnTo parameter is present for back-navigation */
  hasReturnTo: boolean;
  /** Whether this arrival is from an external surface (source param present) */
  isExternalArrival: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse inbound deep-link parameters from route path segments and query params.
 *
 * @param pathSegments - Extracted from the route (e.g., { projectId: 'uuid', module: 'financial' })
 * @param searchParams - Query string parameters as a Record
 */
export function parseDeepLinkParams(
  pathSegments: { projectId?: string; module?: string },
  searchParams: Record<string, string>,
): DeepLinkResolution {
  const projectId = pathSegments.projectId?.trim();

  if (!projectId) {
    return {
      valid: false,
      params: null,
      targetPath: '/',
      hasReturnTo: false,
      isExternalArrival: false,
    };
  }

  const params: DeepLinkParams = {
    projectId,
    module: pathSegments.module?.trim() || undefined,
    action: searchParams.action || undefined,
    view: searchParams.view || undefined,
    reviewArtifactId: searchParams.reviewArtifactId || undefined,
    returnTo: searchParams.returnTo || undefined,
    source: searchParams.source || undefined,
  };

  return {
    valid: true,
    params,
    targetPath: buildTargetPathFromDeepLink(params),
    hasReturnTo: Boolean(params.returnTo),
    isExternalArrival: Boolean(params.source),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Target path builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the target path within the project context from deep-link parameters.
 *
 * Returns the module path (e.g., '/financial') or '/' for project home.
 * Does not include the `/project-hub/{projectId}` prefix — that's the
 * route structure's responsibility.
 */
export function buildTargetPathFromDeepLink(params: DeepLinkParams): string {
  if (!params.module) return '/';
  return `/${params.module}`;
}

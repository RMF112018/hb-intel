/**
 * Phase 3 Stage 4.1 — Project route context resolver.
 *
 * Single entry point for route-entry project context resolution.
 * Called by route guards (beforeLoad) when entering project-scoped routes.
 * Accepts pre-resolved normalization result — caller handles data access.
 *
 * Governing: P3-B1 §2.1 (route format), §3.2 (store sync rule)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Input type (caller provides from normalizeProjectIdentifier)
// ─────────────────────────────────────────────────────────────────────────────

export interface NormalizationInput {
  /** The canonical projectId (null if not found) */
  projectId: string | null;
  /** Whether a redirect to the canonical projectId-based route is needed */
  redirectRequired: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectRouteContextResult {
  /** Whether the route context was successfully resolved */
  resolved: boolean;
  /** The canonical projectId (only set when resolved=true) */
  projectId?: string;
  /** Whether a redirect to the canonical projectId-based route is needed */
  redirectRequired: boolean;
  /** The canonical projectId to redirect to (only set when redirectRequired=true) */
  redirectTo?: string;
  /** Whether access was denied */
  accessDenied: boolean;
  /** Denial reason (only set when accessDenied=true) */
  denialReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve project route context from a normalization result.
 *
 * The caller is responsible for:
 * 1. Calling `normalizeProjectIdentifier` (from @hbc/data-access)
 * 2. Passing the result here
 * 3. Acting on the returned context (redirect, deny, or proceed)
 *
 * @param rawProjectId - The raw $projectId from the route parameter
 * @param normalization - Result from normalizeProjectIdentifier (null if not found)
 */
export function resolveProjectRouteContext(
  rawProjectId: string,
  normalization: NormalizationInput | null,
): ProjectRouteContextResult {
  if (!rawProjectId || !rawProjectId.trim()) {
    return {
      resolved: false,
      redirectRequired: false,
      accessDenied: true,
      denialReason: 'project-not-found',
    };
  }

  if (!normalization || !normalization.projectId) {
    return {
      resolved: false,
      redirectRequired: false,
      accessDenied: true,
      denialReason: 'project-not-found',
    };
  }

  if (normalization.redirectRequired) {
    return {
      resolved: true,
      projectId: normalization.projectId,
      redirectRequired: true,
      redirectTo: normalization.projectId,
      accessDenied: false,
    };
  }

  return {
    resolved: true,
    projectId: normalization.projectId,
    redirectRequired: false,
    accessDenied: false,
  };
}

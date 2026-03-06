import type { AuthLifecyclePhase, AuthMode } from '../types.js';

/**
 * Guard failure categories for centralized pre-render enforcement.
 */
export type GuardFailureKind =
  | 'runtime-unsupported'
  | 'unauthenticated'
  | 'reauth-required'
  | 'role-denied'
  | 'permission-denied';

/**
 * Ordered guard decision input.
 *
 * Alignment notes:
 * - D-04: guard decisions consume centralized route/auth context.
 * - D-07: deterministic evaluation order avoids ambiguous protected rendering.
 * - D-10: shared resolver prevents feature-level guard drift.
 */
export interface GuardResolutionInput {
  lifecyclePhase: AuthLifecyclePhase;
  runtimeMode: AuthMode | null;
  resolvedRoles: readonly string[];
  requiredRole?: string;
  requiredPermission?: string;
  hasPermission?: boolean;
  supportedRuntimeModes?: readonly AuthMode[];
}

/**
 * Ordered guard evaluation result used by wrappers and shell surfaces.
 */
export interface GuardResolutionResult {
  allow: boolean;
  failureKind: GuardFailureKind | null;
  shouldCaptureRedirect: boolean;
}

/**
 * Resolve guard outcomes in strict precedence:
 * 1) runtime support
 * 2) auth/session state
 * 3) role authorization
 * 4) permission authorization
 *
 * This ordering ensures protected content never renders before central gate
 * evaluation has resolved all required constraints.
 */
export function resolveGuardResolution(input: GuardResolutionInput): GuardResolutionResult {
  if (
    input.supportedRuntimeModes &&
    input.runtimeMode &&
    !input.supportedRuntimeModes.includes(input.runtimeMode)
  ) {
    return {
      allow: false,
      failureKind: 'runtime-unsupported',
      shouldCaptureRedirect: false,
    };
  }

  if (input.lifecyclePhase === 'reauth-required') {
    return {
      allow: false,
      failureKind: 'reauth-required',
      shouldCaptureRedirect: true,
    };
  }

  if (input.lifecyclePhase !== 'authenticated') {
    return {
      allow: false,
      failureKind: 'unauthenticated',
      shouldCaptureRedirect: true,
    };
  }

  if (input.requiredRole && !input.resolvedRoles.includes(input.requiredRole)) {
    return {
      allow: false,
      failureKind: 'role-denied',
      shouldCaptureRedirect: false,
    };
  }

  if (input.requiredPermission && input.hasPermission !== true) {
    return {
      allow: false,
      failureKind: 'permission-denied',
      shouldCaptureRedirect: false,
    };
  }

  return {
    allow: true,
    failureKind: null,
    shouldCaptureRedirect: false,
  };
}

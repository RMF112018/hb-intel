import type { HttpResponseInit } from '@azure/functions';
import type { IValidatedClaims } from './validateToken.js';
import type { ILogger } from '../utils/logger.js';
import { forbiddenResponse } from '../utils/response-helpers.js';

// ── App-Role Constants ───────────────────────────────────────────────────

/**
 * P9-G5-04: Canonical app-role value sets for the Project Setup authorization model.
 * Each functional role accepts two value names for tenant-specific naming flexibility.
 *
 * @see Gap-5_Entra-App-Role-and-Scope-Contract.md §3
 */
export const ADMIN_ROLES = ['Admin', 'HBIntelAdmin'] as const;
export const CONTROLLER_ROLES = ['Controller', 'HBIntelController'] as const;
export const BREAK_GLASS_ROLES = ['BreakGlass'] as const;
export const AUTOMATION_ROLES = ['Automation'] as const;
export const SAFETY_SUBMITTER_ROLES = ['HBIntelSafetySubmitter'] as const;
export const SAFETY_OPERATOR_ROLES = ['HBIntelSafetyOperator'] as const;
export const SAFETY_REVIEWER_ROLES = ['HBIntelSafetyReviewer'] as const;
export const SAFETY_ADMIN_ROLES = ['HBIntelSafetyAdmin'] as const;
export const SAFETY_GLOBAL_OVERRIDE_ROLES = [...ADMIN_ROLES, ...BREAK_GLASS_ROLES] as const;
export const FOLEON_VIEWER_ROLES = ['HBIntelFoleonViewer'] as const;
export const FOLEON_EDITOR_ROLES = ['HBIntelFoleonEditor'] as const;
export const FOLEON_PUBLISHER_ROLES = ['HBIntelFoleonPublisher'] as const;
export const FOLEON_ADMIN_ROLES = ['HBIntelFoleonAdmin'] as const;
export const FOLEON_OPERATOR_ROLES = ['HBIntelFoleonOperator'] as const;
export const FOLEON_HOMEPAGE_MANAGER_ROLES = ['HBIntelFoleonHomepageManager'] as const;
export const FOLEON_GLOBAL_OVERRIDE_ROLES = [...ADMIN_ROLES, ...BREAK_GLASS_ROLES] as const;

/** All privileged user roles (admin + controller). */
export const PRIVILEGED_ROLES = [...ADMIN_ROLES, ...CONTROLLER_ROLES] as const;

// ── Delegated Scope Constants ────────────────────────────────────────────

/**
 * P9-G5-04: The delegated scope required for interactive API access.
 * Declared in `apps/estimating/config/package-solution.json` as `access_as_user`.
 */
export const REQUIRED_DELEGATED_SCOPE = 'access_as_user';

// ── Token-Type Helpers ───────────────────────────────────────────────────

/**
 * P9-G5-04: Determine if the validated claims represent an app-only token.
 *
 * Primary signal: `idtyp === 'app'` (canonical Entra v2 indicator).
 * Fallback: absence of `scp` and `upn` together indicates app-only.
 *
 * @see Gap-5_Entra-App-Role-and-Scope-Contract.md §4.1
 */
export function isAppOnlyToken(claims: IValidatedClaims): boolean {
  if (claims.idtyp === 'app') return true;
  if (!claims.scp && !claims.upn) return true;
  return false;
}

// ── Role-Check Helpers ───────────────────────────────────────────────────

/**
 * P9-G5-04: Check whether the caller has any of the specified app-roles.
 */
export function hasAnyRole(claims: IValidatedClaims, roles: readonly string[]): boolean {
  return claims.roles.some((role) => roles.includes(role));
}

/** Check whether the caller has an admin app-role. */
export function isAdmin(claims: IValidatedClaims): boolean {
  return hasAnyRole(claims, ADMIN_ROLES);
}

/** Check whether the caller has a controller app-role. */
export function isController(claims: IValidatedClaims): boolean {
  return hasAnyRole(claims, CONTROLLER_ROLES);
}

/** Check whether the caller has admin or controller app-role. */
export function isPrivileged(claims: IValidatedClaims): boolean {
  return hasAnyRole(claims, PRIVILEGED_ROLES);
}

/** Check whether the caller has a break-glass app-role. */
export function isBreakGlass(claims: IValidatedClaims): boolean {
  return hasAnyRole(claims, BREAK_GLASS_ROLES);
}

/** Check whether the caller has an automation/workload app-role. */
export function isAutomation(claims: IValidatedClaims): boolean {
  return hasAnyRole(claims, AUTOMATION_ROLES);
}

// ── Scope-Check Helpers ──────────────────────────────────────────────────

/**
 * P9-G5-04: Check whether the token carries a specific delegated scope.
 *
 * The `scp` claim in Entra v2 tokens is a space-delimited string.
 * Some configurations may present it differently, so this handles
 * both string and array formats defensively.
 */
export function hasScope(claims: IValidatedClaims, scope: string): boolean {
  const scp = claims.scp;
  if (!scp) return false;
  if (typeof scp === 'string') {
    return scp.split(' ').includes(scope);
  }
  // Defensive: handle unexpected array format
  if (Array.isArray(scp)) {
    return (scp as string[]).includes(scope);
  }
  return false;
}

/**
 * P9-G5-04: Verify the token carries the required delegated scope.
 * Returns `true` if the scope is present, `false` otherwise.
 */
export function hasDelegatedScope(claims: IValidatedClaims): boolean {
  return hasScope(claims, REQUIRED_DELEGATED_SCOPE);
}

// ── Ownership Helpers ────────────────────────────────────────────────────

/**
 * P9-G5-04: Check resource ownership using stable `oid` identity.
 *
 * Prefers `oid`-based comparison when the resource has a `submittedByOid` field.
 * Falls back to UPN comparison for pre-migration records that lack `oid`.
 *
 * @param claims - Validated JWT claims from the caller
 * @param resource - Object with ownership fields
 * @returns Object with `isOwner` result and `method` used ('oid' | 'upn' | 'none')
 */
export function checkOwnership(
  claims: IValidatedClaims,
  resource: { submittedByOid?: string; submittedBy?: string },
): { isOwner: boolean; method: 'oid' | 'upn' | 'none' } {
  // Prefer oid-based comparison when available
  if (resource.submittedByOid && claims.oid) {
    return {
      isOwner: resource.submittedByOid === claims.oid,
      method: 'oid',
    };
  }

  // Fallback to UPN for pre-migration records
  if (resource.submittedBy && claims.upn) {
    return {
      isOwner: resource.submittedBy.toLowerCase() === claims.upn.toLowerCase(),
      method: 'upn',
    };
  }

  return { isOwner: false, method: 'none' };
}

// ── Policy Enforcement (returning HTTP responses) ────────────────────────

/**
 * P9-G5-04: Enforce that the caller has at least one of the required app-roles.
 * Returns a 403 response if the check fails, or `null` if authorized.
 *
 * Usage in handlers:
 * ```ts
 * const denied = requireRoles(auth.claims, ADMIN_ROLES, requestId);
 * if (denied) return denied;
 * ```
 */
export function requireRoles(
  claims: IValidatedClaims,
  roles: readonly string[],
  requestId?: string,
): HttpResponseInit | null {
  if (hasAnyRole(claims, roles)) return null;
  return forbiddenResponse('Insufficient role', requestId);
}

/**
 * P9-G5-04: Enforce admin app-role. Returns 403 or null.
 */
export function requireAdmin(claims: IValidatedClaims, requestId?: string): HttpResponseInit | null {
  return requireRoles(claims, ADMIN_ROLES, requestId);
}

/**
 * P9-G5-04: Enforce delegated scope for interactive requests.
 * Returns 403 if the required scope is missing, or `null` if present.
 *
 * App-only tokens bypass this check (they use workload authorization instead).
 */
export function requireDelegatedScope(
  claims: IValidatedClaims,
  requestId?: string,
): HttpResponseInit | null {
  // App-only tokens don't carry scp — they are authorized at the workload layer
  if (isAppOnlyToken(claims)) return null;
  if (hasDelegatedScope(claims)) return null;
  return forbiddenResponse('Missing required scope: access_as_user', requestId);
}

/**
 * P9-G5-04: Enforce workload/app-only authorization.
 * Returns 403 if the token is not app-only or lacks the Automation role.
 */
export function requireWorkloadRole(
  claims: IValidatedClaims,
  requestId?: string,
): HttpResponseInit | null {
  if (!isAppOnlyToken(claims)) {
    return forbiddenResponse('Workload authorization requires an app-only token', requestId);
  }
  if (hasAnyRole(claims, AUTOMATION_ROLES)) return null;
  return forbiddenResponse('Automation role required', requestId);
}

// ── Authorization Telemetry ──────────────────────────────────────────────

/**
 * P9-G5-10: Structured authorization telemetry event properties.
 */
export interface AuthzTelemetryEvent {
  /** Authorization action type (e.g., 'role_check', 'scope_check', 'ownership_check'). */
  action: string;
  /** Authorization outcome. */
  outcome: 'allowed' | 'denied';
  /** Resolved or checked role (e.g., 'admin', 'controller', 'submitter'). */
  role?: string;
  /** Ownership detection method ('oid' | 'upn' | 'none'). */
  method?: string;
  /** True when the BreakGlass app-role was used for this decision. */
  isBreakGlass?: boolean;
  /** Request correlation ID. */
  correlationId?: string;
  /** Caller's Entra Object ID (stable identity). */
  callerOid?: string;
  /** Caller's UPN (for display/triage — not used for authorization). */
  callerUpn?: string;
}

export type SafetyRouteAction =
  | 'preview'
  | 'ingest'
  | 'replay'
  | 'excellence-rollup-read'
  | 'excellence-rollup-generate';
export type SafetyRouteRoleFamily =
  | 'safety-specific'
  | 'global-override'
  | 'workload-automation'
  | 'denied';
export type FoleonRouteAction =
  | 'view'
  | 'edit'
  | 'publish'
  | 'place'
  | 'sync'
  | 'admin';
export type FoleonRouteRoleFamily =
  | 'foleon-specific'
  | 'global-override'
  | 'workload-automation'
  | 'denied';

export interface ISafetyRouteAuthorizationDecision {
  readonly allowed: boolean;
  readonly deniedResponse: HttpResponseInit | null;
  readonly matchedRole: string | null;
  readonly matchedRoleFamily: SafetyRouteRoleFamily;
}

export interface IFoleonRouteAuthorizationDecision {
  readonly allowed: boolean;
  readonly deniedResponse: HttpResponseInit | null;
  readonly matchedRole: string | null;
  readonly matchedRoleFamily: FoleonRouteRoleFamily;
}

/**
 * P9-G5-10: Emit a structured authorization telemetry event.
 *
 * Keeps policy functions pure (return null/response) while letting
 * callers opt into observable authorization telemetry for production
 * support, security audit, and break-glass accountability.
 */
export function emitAuthorizationTelemetry(
  logger: ILogger,
  event: AuthzTelemetryEvent,
): void {
  const eventName = event.isBreakGlass ? 'authz.break_glass' : 'authz.decision';
  logger.trackEvent(eventName, {
    action: event.action,
    outcome: event.outcome,
    ...(event.role !== undefined && { role: event.role }),
    ...(event.method !== undefined && { method: event.method }),
    ...(event.isBreakGlass !== undefined && { isBreakGlass: event.isBreakGlass }),
    ...(event.correlationId !== undefined && { correlationId: event.correlationId }),
    ...(event.callerOid !== undefined && { callerOid: event.callerOid }),
    ...(event.callerUpn !== undefined && { callerUpn: event.callerUpn }),
  });
}

const SAFETY_ACTION_ROLES: Readonly<Record<SafetyRouteAction, ReadonlyArray<string>>> = {
  preview: [
    ...SAFETY_SUBMITTER_ROLES,
    ...SAFETY_OPERATOR_ROLES,
    ...SAFETY_REVIEWER_ROLES,
    ...SAFETY_ADMIN_ROLES,
  ],
  ingest: [
    ...SAFETY_SUBMITTER_ROLES,
    ...SAFETY_OPERATOR_ROLES,
    ...SAFETY_ADMIN_ROLES,
  ],
  replay: [
    ...SAFETY_OPERATOR_ROLES,
    ...SAFETY_REVIEWER_ROLES,
    ...SAFETY_ADMIN_ROLES,
  ],
  // Safety Field Excellence rollup read access — leadership review surface.
  // Reviewers may inspect candidates and dry-run scoring; Admins may also
  // generate. Global override (Admin/HBIntelAdmin/BreakGlass) and the
  // workload-automation app-only branch retain their existing behavior via
  // the shared `authorizeSafetyRoute` flow.
  'excellence-rollup-read': [
    ...SAFETY_REVIEWER_ROLES,
    ...SAFETY_ADMIN_ROLES,
  ],
  // Safety Field Excellence rollup generate (writes candidate score records).
  // Restricted to HBIntelSafetyAdmin (plus existing global override and
  // workload-automation paths). Reviewers cannot generate.
  'excellence-rollup-generate': [
    ...SAFETY_ADMIN_ROLES,
  ],
} as const;

const FOLEON_ACTION_ROLES: Readonly<Record<FoleonRouteAction, ReadonlyArray<string>>> = {
  view: [
    ...FOLEON_VIEWER_ROLES,
    ...FOLEON_EDITOR_ROLES,
    ...FOLEON_PUBLISHER_ROLES,
    ...FOLEON_OPERATOR_ROLES,
    ...FOLEON_ADMIN_ROLES,
    ...FOLEON_HOMEPAGE_MANAGER_ROLES,
  ],
  edit: [
    ...FOLEON_EDITOR_ROLES,
    ...FOLEON_PUBLISHER_ROLES,
    ...FOLEON_ADMIN_ROLES,
  ],
  publish: [
    ...FOLEON_PUBLISHER_ROLES,
    ...FOLEON_ADMIN_ROLES,
  ],
  place: [
    ...FOLEON_PUBLISHER_ROLES,
    ...FOLEON_HOMEPAGE_MANAGER_ROLES,
    ...FOLEON_ADMIN_ROLES,
  ],
  sync: [
    ...FOLEON_OPERATOR_ROLES,
    ...FOLEON_ADMIN_ROLES,
  ],
  admin: [
    ...FOLEON_ADMIN_ROLES,
  ],
} as const;

function firstMatchedRole(claims: IValidatedClaims, candidates: ReadonlyArray<string>): string | null {
  for (const role of candidates) {
    if (claims.roles.includes(role)) return role;
  }
  return null;
}

export function authorizeSafetyRoute(
  claims: IValidatedClaims,
  action: SafetyRouteAction,
  requestId?: string,
): ISafetyRouteAuthorizationDecision {
  if (isAppOnlyToken(claims)) {
    const workloadDenied = requireWorkloadRole(claims, requestId);
    if (workloadDenied) {
      return {
        allowed: false,
        deniedResponse: workloadDenied,
        matchedRole: null,
        matchedRoleFamily: 'denied',
      };
    }
    return {
      allowed: true,
      deniedResponse: null,
      matchedRole: firstMatchedRole(claims, AUTOMATION_ROLES),
      matchedRoleFamily: 'workload-automation',
    };
  }

  const scopeDenied = requireDelegatedScope(claims, requestId);
  if (scopeDenied) {
    return {
      allowed: false,
      deniedResponse: scopeDenied,
      matchedRole: null,
      matchedRoleFamily: 'denied',
    };
  }

  const safetyRole = firstMatchedRole(claims, SAFETY_ACTION_ROLES[action]);
  if (safetyRole) {
    return {
      allowed: true,
      deniedResponse: null,
      matchedRole: safetyRole,
      matchedRoleFamily: 'safety-specific',
    };
  }

  const globalOverrideRole = firstMatchedRole(claims, SAFETY_GLOBAL_OVERRIDE_ROLES);
  if (globalOverrideRole) {
    return {
      allowed: true,
      deniedResponse: null,
      matchedRole: globalOverrideRole,
      matchedRoleFamily: 'global-override',
    };
  }

  return {
    allowed: false,
    deniedResponse: forbiddenResponse('Insufficient role', requestId),
    matchedRole: null,
    matchedRoleFamily: 'denied',
  };
}

export function authorizeFoleonRoute(
  claims: IValidatedClaims,
  action: FoleonRouteAction,
  requestId?: string,
): IFoleonRouteAuthorizationDecision {
  if (isAppOnlyToken(claims)) {
    const workloadDenied = requireWorkloadRole(claims, requestId);
    if (workloadDenied) {
      return {
        allowed: false,
        deniedResponse: workloadDenied,
        matchedRole: null,
        matchedRoleFamily: 'denied',
      };
    }
    return {
      allowed: true,
      deniedResponse: null,
      matchedRole: firstMatchedRole(claims, AUTOMATION_ROLES),
      matchedRoleFamily: 'workload-automation',
    };
  }

  const scopeDenied = requireDelegatedScope(claims, requestId);
  if (scopeDenied) {
    return {
      allowed: false,
      deniedResponse: scopeDenied,
      matchedRole: null,
      matchedRoleFamily: 'denied',
    };
  }

  const foleonRole = firstMatchedRole(claims, FOLEON_ACTION_ROLES[action]);
  if (foleonRole) {
    return {
      allowed: true,
      deniedResponse: null,
      matchedRole: foleonRole,
      matchedRoleFamily: 'foleon-specific',
    };
  }

  const globalOverrideRole = firstMatchedRole(claims, FOLEON_GLOBAL_OVERRIDE_ROLES);
  if (globalOverrideRole) {
    return {
      allowed: true,
      deniedResponse: null,
      matchedRole: globalOverrideRole,
      matchedRoleFamily: 'global-override',
    };
  }

  return {
    allowed: false,
    deniedResponse: forbiddenResponse('Insufficient role', requestId),
    matchedRole: null,
    matchedRoleFamily: 'denied',
  };
}

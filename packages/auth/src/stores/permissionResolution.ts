import type {
  EffectivePermissionSet,
  PermissionOverrideRecord,
  PermissionResolutionInput,
  PermissionResolutionSnapshot,
} from '../types.js';

/**
 * Resolve effective permission truth from all required Phase 5.3 sources.
 *
 * Deterministic precedence:
 * 1) base role grants + default feature-action grants
 * 2) explicit per-user overrides (grant/deny)
 * 3) temporary/expiring override filtering
 * 4) emergency access grants (when active and not expired)
 *
 * Alignment notes:
 * - D-10: central shared API prevents direct feature-level authorization logic.
 */
export function resolveEffectivePermissions(
  input: PermissionResolutionInput,
): EffectivePermissionSet {
  const now = input.now ?? new Date();

  const grants = new Set<string>([
    ...input.baseRoleGrants,
    ...input.defaultFeatureActionGrants,
  ]);
  const denied = new Set<string>();
  const expiredOverrides: string[] = [];

  for (const override of input.explicitOverrides) {
    if (isOverrideExpired(override, now)) {
      expiredOverrides.push(override.action);
      continue;
    }

    if (override.mode === 'grant') {
      grants.add(override.action);
      denied.delete(override.action);
      continue;
    }

    grants.delete(override.action);
    denied.add(override.action);
  }

  const emergencyAccessActive = isEmergencyAccessActive(input.emergencyAccess, now);
  if (emergencyAccessActive && input.emergencyAccess) {
    for (const emergencyGrant of input.emergencyAccess.grants) {
      grants.add(emergencyGrant);
      denied.delete(emergencyGrant);
    }
  }

  return {
    grants: Array.from(grants).sort(),
    denied: Array.from(denied).sort(),
    expiredOverrides: Array.from(new Set(expiredOverrides)).sort(),
    emergencyAccessActive,
  };
}

/**
 * Shared evaluator used by guards/hooks/features to consume centralized
 * permission truth instead of recomputing grants in feature modules.
 */
export function isPermissionGranted(effective: EffectivePermissionSet, action: string): boolean {
  if (effective.denied.includes(action)) {
    return false;
  }

  if (effective.grants.includes('*:*')) {
    return true;
  }

  if (effective.grants.includes(action)) {
    return true;
  }

  // Allow domain-wide wildcard grants such as `project:*`.
  const actionSegments = action.split(':');
  if (actionSegments.length === 2) {
    const domainWildcard = `${actionSegments[0]}:*`;
    return effective.grants.includes(domainWildcard);
  }

  return false;
}

/**
 * Produce a diagnostics-friendly snapshot for logs/audit and debugging.
 */
export function getPermissionResolutionSnapshot(
  input: PermissionResolutionInput,
): PermissionResolutionSnapshot {
  return {
    evaluatedAt: (input.now ?? new Date()).toISOString(),
    inputSummary: {
      baseRoleGrantCount: input.baseRoleGrants.length,
      defaultGrantCount: input.defaultFeatureActionGrants.length,
      overrideCount: input.explicitOverrides.length,
      emergencyConfigured: Boolean(input.emergencyAccess),
    },
    effective: resolveEffectivePermissions(input),
  };
}

function isOverrideExpired(override: PermissionOverrideRecord, now: Date): boolean {
  if (!override.expiresAt) {
    return false;
  }

  return new Date(override.expiresAt).getTime() <= now.getTime();
}

function isEmergencyAccessActive(
  emergencyAccess: PermissionResolutionInput['emergencyAccess'],
  now: Date,
): boolean {
  if (!emergencyAccess || !emergencyAccess.enabled) {
    return false;
  }

  if (!emergencyAccess.expiresAt) {
    return true;
  }

  return new Date(emergencyAccess.expiresAt).getTime() > now.getTime();
}

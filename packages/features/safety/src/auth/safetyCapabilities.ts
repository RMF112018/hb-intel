/**
 * Frontend mirror of the backend Safety route/action authorization contract.
 *
 * Backend source of truth:
 *   backend/functions/src/middleware/authorization.ts — `SAFETY_ACTION_ROLES`
 *   backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
 *
 * The frontend DOES NOT depend on the backend package. We mirror the role
 * strings here so the UI can disable/explain unavailable actions before a
 * 403 round-trip. Backend remains the final authority — a stale or tampered
 * frontend capability state cannot elevate access.
 */

export const SAFETY_SUBMITTER_ROLE = 'HBIntelSafetySubmitter';
export const SAFETY_OPERATOR_ROLE = 'HBIntelSafetyOperator';
export const SAFETY_REVIEWER_ROLE = 'HBIntelSafetyReviewer';
export const SAFETY_ADMIN_ROLE = 'HBIntelSafetyAdmin';

/**
 * Global override roles accepted on every Safety route by the backend.
 * Mirrors `SAFETY_GLOBAL_OVERRIDE_ROLES` (authorization.ts line 22).
 */
export const SAFETY_GLOBAL_OVERRIDE_ROLES = [
  'Admin',
  'HBIntelAdmin',
  'BreakGlass',
] as const;

export type SafetyAction = 'preview' | 'ingest' | 'replay';

/**
 * Authoritative matrix — must match backend `SAFETY_ACTION_ROLES`.
 * Each entry is the union of safety-specific roles accepted for the action
 * plus the global override roles accepted on every safety route.
 */
export const SAFETY_ACTION_ROLES: Readonly<Record<SafetyAction, readonly string[]>> = {
  preview: [
    SAFETY_SUBMITTER_ROLE,
    SAFETY_OPERATOR_ROLE,
    SAFETY_REVIEWER_ROLE,
    SAFETY_ADMIN_ROLE,
    ...SAFETY_GLOBAL_OVERRIDE_ROLES,
  ],
  ingest: [
    SAFETY_SUBMITTER_ROLE,
    SAFETY_OPERATOR_ROLE,
    SAFETY_ADMIN_ROLE,
    ...SAFETY_GLOBAL_OVERRIDE_ROLES,
  ],
  replay: [
    SAFETY_OPERATOR_ROLE,
    SAFETY_REVIEWER_ROLE,
    SAFETY_ADMIN_ROLE,
    ...SAFETY_GLOBAL_OVERRIDE_ROLES,
  ],
} as const;

export interface SafetyCapabilities {
  readonly canPreview: boolean;
  readonly canIngest: boolean;
  readonly canReplay: boolean;
}

const ALL_DENIED: SafetyCapabilities = Object.freeze({
  canPreview: false,
  canIngest: false,
  canReplay: false,
});

function hasAny(roles: readonly string[], allowed: readonly string[]): boolean {
  for (const role of roles) {
    if (allowed.includes(role)) return true;
  }
  return false;
}

/**
 * Pure resolver. Null/undefined/empty role arrays collapse to all-denied —
 * never silently elevate access.
 */
export function resolveSafetyCapabilities(
  roles: readonly string[] | null | undefined,
): SafetyCapabilities {
  if (!roles || roles.length === 0) return ALL_DENIED;
  return {
    canPreview: hasAny(roles, SAFETY_ACTION_ROLES.preview),
    canIngest: hasAny(roles, SAFETY_ACTION_ROLES.ingest),
    canReplay: hasAny(roles, SAFETY_ACTION_ROLES.replay),
  };
}

const CAPABILITY_REASONS: Readonly<Record<keyof SafetyCapabilities, string>> = {
  canPreview:
    'Your account is not authorized to preview safety checklists. Contact an administrator if access should already be granted.',
  canIngest:
    'Your account is not authorized to commit safety checklists. Contact an administrator if access should already be granted.',
  canReplay:
    'Your account is not authorized to replay review-queue runs. Contact an administrator if access should already be granted.',
};

export function safetyCapabilityReason(
  capability: keyof SafetyCapabilities,
): string {
  return CAPABILITY_REASONS[capability];
}

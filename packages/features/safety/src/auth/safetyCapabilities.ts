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

/**
 * Discriminated capability state surfaced to the UI. Distinguishes the
 * "no qualifying authority" path from the "token unavailable" / "wrong
 * scope" / "still resolving" paths, so operators can triage hosted
 * denials without confusing them with a generic unauthorized response.
 */
export type SafetyCapabilityState =
  | 'pending'
  | 'authorized'
  | 'unauthorized'
  | 'token-unavailable'
  | 'scope-missing';

export interface SafetyCapabilities {
  readonly canPreview: boolean;
  readonly canIngest: boolean;
  readonly canReplay: boolean;
  readonly state: SafetyCapabilityState;
}

const ALL_FALSE = { canPreview: false, canIngest: false, canReplay: false } as const;

const PENDING: SafetyCapabilities = Object.freeze({ ...ALL_FALSE, state: 'pending' });
const UNAUTHORIZED: SafetyCapabilities = Object.freeze({ ...ALL_FALSE, state: 'unauthorized' });
const TOKEN_UNAVAILABLE: SafetyCapabilities = Object.freeze({
  ...ALL_FALSE,
  state: 'token-unavailable',
});
const SCOPE_MISSING: SafetyCapabilities = Object.freeze({
  ...ALL_FALSE,
  state: 'scope-missing',
});

export const PENDING_SAFETY_CAPABILITIES = PENDING;
export const UNAUTHORIZED_SAFETY_CAPABILITIES = UNAUTHORIZED;
export const TOKEN_UNAVAILABLE_SAFETY_CAPABILITIES = TOKEN_UNAVAILABLE;
export const SCOPE_MISSING_SAFETY_CAPABILITIES = SCOPE_MISSING;

function hasAny(roles: readonly string[], allowed: readonly string[]): boolean {
  for (const role of roles) {
    if (allowed.includes(role)) return true;
  }
  return false;
}

/**
 * Pure resolver. Null/undefined/empty role arrays collapse to all-denied
 * with state `'unauthorized'` — never silently elevate access.
 *
 * Used by both the SPFx token-authority path (after roles are extracted from
 * the validated API access token) and the mock-mode session path (where
 * roles come from the persona registry via `session.resolvedRoles`).
 */
export function resolveSafetyCapabilities(
  roles: readonly string[] | null | undefined,
): SafetyCapabilities {
  if (!roles || roles.length === 0) return UNAUTHORIZED;
  const canPreview = hasAny(roles, SAFETY_ACTION_ROLES.preview);
  const canIngest = hasAny(roles, SAFETY_ACTION_ROLES.ingest);
  const canReplay = hasAny(roles, SAFETY_ACTION_ROLES.replay);
  // 'authorized' iff at least one capability is granted. A non-empty role
  // array whose entries are all unrelated to Safety must NOT be reported as
  // authorized — that would lie about the source path in the proof object
  // and confuse hosted triage.
  return {
    canPreview,
    canIngest,
    canReplay,
    state: canPreview || canIngest || canReplay ? 'authorized' : 'unauthorized',
  };
}

/**
 * Resolve capabilities from API token roles in SPFx mode. Identical role
 * matrix to {@link resolveSafetyCapabilities}; named separately to make the
 * authority path explicit at call sites and in proof artifacts.
 */
export function safetyCapabilitiesFromTokenRoles(
  roles: readonly string[] | null | undefined,
): SafetyCapabilities {
  return resolveSafetyCapabilities(roles);
}

const CAPABILITY_REASONS_DEFAULT: Readonly<
  Record<Exclude<keyof SafetyCapabilities, 'state'>, string>
> = {
  canPreview:
    'Your account is not authorized to preview safety checklists. Contact an administrator if access should already be granted.',
  canIngest:
    'Your account is not authorized to commit safety checklists. Contact an administrator if access should already be granted.',
  canReplay:
    'Your account is not authorized to replay review-queue runs. Contact an administrator if access should already be granted.',
};

const CAPABILITY_REASONS_TOKEN_UNAVAILABLE: typeof CAPABILITY_REASONS_DEFAULT = {
  canPreview:
    'Safety API access token is unavailable. SharePoint API access for this app may not yet be approved by your tenant administrator.',
  canIngest:
    'Safety API access token is unavailable. SharePoint API access for this app may not yet be approved by your tenant administrator.',
  canReplay:
    'Safety API access token is unavailable. SharePoint API access for this app may not yet be approved by your tenant administrator.',
};

const CAPABILITY_REASONS_SCOPE_MISSING: typeof CAPABILITY_REASONS_DEFAULT = {
  canPreview:
    'Safety API token is missing the delegated `access_as_user` scope. Contact a tenant administrator.',
  canIngest:
    'Safety API token is missing the delegated `access_as_user` scope. Contact a tenant administrator.',
  canReplay:
    'Safety API token is missing the delegated `access_as_user` scope. Contact a tenant administrator.',
};

const CAPABILITY_REASONS_PENDING: typeof CAPABILITY_REASONS_DEFAULT = {
  canPreview: 'Resolving Safety access token…',
  canIngest: 'Resolving Safety access token…',
  canReplay: 'Resolving Safety access token…',
};

/**
 * Returns a human-readable reason describing why a capability is currently
 * unavailable. The optional `state` argument is consulted so callers can
 * surface distinct messages for the token-unavailable / scope-missing /
 * pending paths instead of collapsing every non-authorized state into the
 * generic "not authorized" copy.
 *
 * Backwards-compatible: callers that omit `state` get the historical
 * "not authorized" reason, matching pre-Phase-09 behavior.
 */
export function safetyCapabilityReason(
  capability: Exclude<keyof SafetyCapabilities, 'state'>,
  state?: SafetyCapabilityState,
): string {
  switch (state) {
    case 'token-unavailable':
      return CAPABILITY_REASONS_TOKEN_UNAVAILABLE[capability];
    case 'scope-missing':
      return CAPABILITY_REASONS_SCOPE_MISSING[capability];
    case 'pending':
      return CAPABILITY_REASONS_PENDING[capability];
    case 'authorized':
    case 'unauthorized':
    case undefined:
    default:
      return CAPABILITY_REASONS_DEFAULT[capability];
  }
}

import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import type { IValidatedClaims } from './middleware/validateToken.js';
import { isAdmin, isBreakGlass, isController, checkOwnership } from './middleware/authorization.js';

/**
 * D-PH6-08 backend state-transition rules mirrored from package-level lifecycle engine.
 * Traceability: docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md §6.8.2
 */
export const STATE_TRANSITIONS: Record<ProjectSetupRequestState, ProjectSetupRequestState[]> = {
  Submitted: ['UnderReview'],
  UnderReview: ['NeedsClarification', 'AwaitingExternalSetup', 'ReadyToProvision'],
  NeedsClarification: ['UnderReview'], // Coordinator resubmits and request returns to review.
  AwaitingExternalSetup: ['ReadyToProvision'],
  ReadyToProvision: ['Provisioning'], // projectNumber must be validated before this transition.
  Provisioning: ['Completed', 'Failed'],
  Completed: [], // Terminal.
  Failed: ['UnderReview'], // Controller can reopen after remediation.
};

/**
 * D-PH6-08 transition guard used by request lifecycle APIs.
 */
export function isValidTransition(from: ProjectSetupRequestState, to: ProjectSetupRequestState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

// ── Role-based authorization ──────────────────────────────────────────────

export type RequestRole = 'submitter' | 'controller' | 'admin' | 'system';

/**
 * P9-G5-06: Resolve the caller's role relative to a specific request.
 *
 * Uses JWT app-role claims for privileged roles and oid-based ownership
 * (with UPN fallback for pre-migration records) for submitter detection.
 * No environment variables are consulted.
 *
 * Priority: admin > controller > submitter > system
 */
export function resolveRequestRole(
  claims: IValidatedClaims,
  request: IProjectSetupRequest,
): RequestRole {
  if (isAdmin(claims) || isBreakGlass(claims)) return 'admin';
  if (isController(claims)) return 'controller';
  const { isOwner } = checkOwnership(claims, request);
  if (isOwner) return 'submitter';
  return 'system';
}

/**
 * Transitions that require controller or admin authority.
 * Submitters may only perform NeedsClarification → UnderReview (resubmit).
 */
const CONTROLLER_TRANSITIONS: Array<[ProjectSetupRequestState, ProjectSetupRequestState]> = [
  ['Submitted', 'UnderReview'],
  ['UnderReview', 'NeedsClarification'],
  ['UnderReview', 'AwaitingExternalSetup'],
  ['UnderReview', 'ReadyToProvision'],
  ['AwaitingExternalSetup', 'ReadyToProvision'],
  ['Failed', 'UnderReview'],
];

/**
 * Check whether the given role is authorized to perform a specific transition.
 * Admins can perform any valid transition.
 * Controllers can perform controller-level transitions.
 * Submitters can only resubmit from NeedsClarification.
 */
export function isAuthorizedTransition(
  role: RequestRole,
  from: ProjectSetupRequestState,
  to: ProjectSetupRequestState,
): boolean {
  if (role === 'admin') return true;
  if (role === 'controller') {
    return CONTROLLER_TRANSITIONS.some(([f, t]) => f === from && t === to);
  }
  if (role === 'submitter') {
    return from === 'NeedsClarification' && to === 'UnderReview';
  }
  // System transitions (Provisioning → Completed/Failed) are handled by the saga,
  // not by user-facing API calls.
  return role === 'system' && (from === 'ReadyToProvision' || from === 'Provisioning');
}

/**
 * D-PH6-08 notification targets by destination state.
 */
export const STATE_NOTIFICATION_TARGETS: Partial<
  Record<ProjectSetupRequestState, ('submitter' | 'controller' | 'group')[]>
> = {
  NeedsClarification: ['submitter'],
  ReadyToProvision: ['controller'],
  Provisioning: ['group'],
  Completed: ['group'],
  Failed: ['controller', 'submitter'],
};

/**
 * Derive project year from project number prefix (##-###-## → 20##).
 * Falls back to current year if project number is absent or unparseable.
 */
export function deriveProjectYear(projectNumber?: string): number {
  if (projectNumber) {
    const match = projectNumber.match(/^(\d{2})-/);
    if (match) {
      return 2000 + parseInt(match[1], 10);
    }
  }
  return new Date().getFullYear();
}

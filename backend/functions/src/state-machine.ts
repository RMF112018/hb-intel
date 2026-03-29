import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';

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
 * Resolve the caller's role relative to a specific request.
 * - `admin` if the caller's UPN is in ADMIN_UPNS
 * - `controller` if the caller's UPN is in CONTROLLER_UPNS
 * - `submitter` if the caller submitted the request
 * - `system` fallback (no specific role)
 */
export function resolveRequestRole(
  callerUpn: string,
  request: IProjectSetupRequest,
): RequestRole {
  const adminUpns = (process.env.ADMIN_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
  const controllerUpns = (process.env.CONTROLLER_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
  const normalizedCaller = callerUpn.toLowerCase();

  if (adminUpns.includes(normalizedCaller)) return 'admin';
  if (controllerUpns.includes(normalizedCaller)) return 'controller';
  if (request.submittedBy.toLowerCase() === normalizedCaller) return 'submitter';
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

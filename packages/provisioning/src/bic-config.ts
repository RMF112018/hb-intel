/**
 * W0-G3-T02: Canonical BIC ownership contract for project setup requests.
 *
 * This config is the single source of truth for "who has the ball" across
 * all surfaces (estimating, accounting, admin). Surfaces must import and
 * use this config — they must not redefine or override individual resolvers.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T02-Ownership-Next-Action-and-Handoff-Contract.md
 */
import type { IBicNextMoveConfig, IBicOwner } from '@hbc/bic-next-move';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';

// ─── Canonical Action Strings ────────────────────────────────────────────────

/**
 * Canonical expected-action strings per lifecycle state.
 * Defined in one place; consumed by BIC config and notification payloads.
 * Surfaces display whatever resolveExpectedAction() returns — they do not override.
 */
export const PROJECT_SETUP_ACTION_MAP: Readonly<Record<ProjectSetupRequestState, string>> = {
  Submitted: 'Review the new project setup request',
  UnderReview: 'Complete your review and approve or request clarification',
  NeedsClarification: 'Respond to clarification requests to continue setup',
  AwaitingExternalSetup: 'Complete external IT setup prerequisites',
  ReadyToProvision: 'Site provisioning is queued',
  Provisioning: 'Site provisioning is in progress',
  Completed: 'Review your provisioned project site and complete the getting-started steps',
  Failed: 'Investigate and recover the failed provisioning request',
};

/** Escalated failure action — used when requester retry is exhausted. */
export const PROJECT_SETUP_ESCALATED_FAILURE_ACTION =
  'Investigate the escalated provisioning failure — requester retry exhausted';

// ─── Canonical Urgency Mapping ───────────────────────────────────────────────

import type { BicUrgencyTier } from '@hbc/bic-next-move';

/**
 * Urgency tier per lifecycle state. States mapped to `null` are system-owned
 * (no BIC display needed) — the BIC framework handles null-owner urgency
 * automatically via D-04 (forced 'immediate' for null owner).
 */
export const PROJECT_SETUP_URGENCY_MAP: Readonly<
  Record<ProjectSetupRequestState, BicUrgencyTier | null>
> = {
  Submitted: 'watch',
  UnderReview: 'watch',
  NeedsClarification: 'immediate',
  AwaitingExternalSetup: 'watch',
  ReadyToProvision: null,
  Provisioning: null,
  Completed: 'upcoming',
  Failed: 'immediate',
};

// ─── Owner Derivation ────────────────────────────────────────────────────────

/** Role constants used in ownership resolution. */
export const BIC_ROLE_CONTROLLER = 'Controller';
export const BIC_ROLE_REQUESTER = 'Requester';
export const BIC_ROLE_ADMIN = 'Admin';
export const BIC_ROLE_PROJECT_LEAD = 'Project Lead';

/**
 * Derives the current BIC owner from the request's lifecycle state.
 *
 * Returns null for system-owned states (ReadyToProvision, Provisioning)
 * where no human has the ball. Consuming surfaces must handle null
 * gracefully — T06 governs what is displayed when owner is null.
 *
 * Deviation from spec: The spec references `deriveCurrentOwner` from
 * `@hbc/provisioning` as an existing function — it did not exist.
 * This is the canonical implementation.
 */
export function deriveCurrentOwner(request: IProjectSetupRequest): IBicOwner | null {
  switch (request.state) {
    case 'Submitted':
    case 'UnderReview':
    case 'AwaitingExternalSetup':
      // Controller owns review, approval, and external-setup coordination
      return {
        userId: request.completedBy ?? '',
        displayName: BIC_ROLE_CONTROLLER,
        role: BIC_ROLE_CONTROLLER,
      };

    case 'NeedsClarification':
      // Requester (Estimating Coordinator) must respond
      return {
        userId: request.submittedBy,
        displayName: BIC_ROLE_REQUESTER,
        role: BIC_ROLE_REQUESTER,
      };

    case 'ReadyToProvision':
    case 'Provisioning':
      // System-owned — no human owner
      return null;

    case 'Completed':
      // Project Lead (PM/Superintendent) reviews the provisioned site
      return {
        userId: request.projectLeadId ?? request.submittedBy,
        displayName: BIC_ROLE_PROJECT_LEAD,
        role: BIC_ROLE_PROJECT_LEAD,
      };

    case 'Failed':
      if (request.requesterRetryUsed) {
        // Escalated to Admin
        return {
          userId: '',
          displayName: BIC_ROLE_ADMIN,
          role: BIC_ROLE_ADMIN,
        };
      }
      // First failure — Admin investigates
      return {
        userId: '',
        displayName: BIC_ROLE_ADMIN,
        role: BIC_ROLE_ADMIN,
      };

    default:
      return null;
  }
}

// ─── BIC Config ──────────────────────────────────────────────────────────────

/**
 * Canonical IBicNextMoveConfig for project setup requests.
 *
 * Must be imported by all consuming surfaces (estimating, accounting, admin).
 * Must not be duplicated, overridden, or extended per-surface.
 */
export const PROJECT_SETUP_BIC_CONFIG: IBicNextMoveConfig<IProjectSetupRequest> = {
  ownershipModel: 'workflow-state-derived',

  resolveCurrentOwner: (request): IBicOwner | null => {
    return deriveCurrentOwner(request);
  },

  resolveExpectedAction: (request): string => {
    if (request.state === 'Failed' && request.requesterRetryUsed) {
      return PROJECT_SETUP_ESCALATED_FAILURE_ACTION;
    }
    return PROJECT_SETUP_ACTION_MAP[request.state] ?? 'Review this request';
  },

  resolveDueDate: (request): string | null => {
    // NeedsClarification: 3-business-day advisory from clarification request timestamp
    if (request.state === 'NeedsClarification' && request.clarificationRequestedAt) {
      const due = new Date(request.clarificationRequestedAt);
      due.setDate(due.getDate() + 3);
      return due.toISOString();
    }
    return null;
  },

  resolveIsBlocked: (request): boolean => {
    return (
      request.state === 'AwaitingExternalSetup' ||
      (request.state === 'Failed' && !!request.requesterRetryUsed)
    );
  },

  resolveBlockedReason: (request): string | null => {
    if (request.state === 'AwaitingExternalSetup') {
      return 'Waiting for external IT/security setup to complete before provisioning can proceed.';
    }
    if (request.state === 'Failed' && request.requesterRetryUsed) {
      return 'Requester retry has been used. An administrator must investigate and resume.';
    }
    return null;
  },

  resolvePreviousOwner: (): IBicOwner | null => {
    // Previous owner requires ownership history on the request.
    // Wave 0 does not store transfer history — return null.
    // Wave 1 can extend by adding ownershipHistory[] to the model.
    return null;
  },

  resolveNextOwner: (request): IBicOwner | null => {
    const nextRoleMap: Partial<Record<ProjectSetupRequestState, string>> = {
      Submitted: BIC_ROLE_CONTROLLER,
      UnderReview: BIC_ROLE_REQUESTER, // if clarification; or controller continues
      NeedsClarification: BIC_ROLE_CONTROLLER,
      AwaitingExternalSetup: BIC_ROLE_CONTROLLER,
      Provisioning: BIC_ROLE_PROJECT_LEAD,
    };
    const role = nextRoleMap[request.state];
    if (!role) return null;
    return { userId: '', displayName: role, role };
  },

  resolveEscalationOwner: (): IBicOwner | null => {
    return {
      userId: '',
      displayName: BIC_ROLE_ADMIN,
      role: BIC_ROLE_ADMIN,
    };
  },
};

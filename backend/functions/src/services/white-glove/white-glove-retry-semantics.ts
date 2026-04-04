/**
 * P9.1-04: White-glove retry, compensation, and repair rule definitions.
 *
 * Defines per-failure-class retry eligibility, compensation actions,
 * and operator-facing repair guidance. Used by the white-glove run
 * service to determine recovery behavior after device run failures.
 *
 * @module white-glove
 */

import { WhiteGloveFailureClass } from '@hbc/models/admin-control-plane';

// ─── Retry Strategy ────────────────────────────────────────────────────────────

export interface IRetryStrategy {
  readonly eligible: boolean;
  readonly maxRetries: number;
  readonly backoffMs: number;
}

const RETRY_RULES: Readonly<Record<WhiteGloveFailureClass, IRetryStrategy>> = {
  [WhiteGloveFailureClass.ConnectorFailure]: { eligible: true, maxRetries: 3, backoffMs: 5_000 },
  [WhiteGloveFailureClass.EnrollmentFailure]: { eligible: true, maxRetries: 2, backoffMs: 10_000 },
  [WhiteGloveFailureClass.ProfileAssignmentFailure]: { eligible: true, maxRetries: 2, backoffMs: 10_000 },
  [WhiteGloveFailureClass.StandardizationFailure]: { eligible: true, maxRetries: 3, backoffMs: 5_000 },
  [WhiteGloveFailureClass.ValidationFailure]: { eligible: true, maxRetries: 3, backoffMs: 2_000 },
  [WhiteGloveFailureClass.OperatorCancellation]: { eligible: false, maxRetries: 0, backoffMs: 0 },
  [WhiteGloveFailureClass.Transient]: { eligible: true, maxRetries: 5, backoffMs: 3_000 },
  [WhiteGloveFailureClass.PermissionDenied]: { eligible: false, maxRetries: 0, backoffMs: 0 },
};

/** Get the retry strategy for a failure class. */
export function getRetryStrategy(failureClass: WhiteGloveFailureClass): IRetryStrategy {
  return RETRY_RULES[failureClass];
}

// ─── Compensation Actions ──────────────────────────────────────────────────────

export type CompensationAction =
  | 'unenroll-device'
  | 'unassign-profile'
  | 'remove-group-membership'
  | 'revert-ninjaone-policy'
  | 'none';

const COMPENSATION_RULES: Readonly<Record<WhiteGloveFailureClass, readonly CompensationAction[]>> = {
  [WhiteGloveFailureClass.ConnectorFailure]: ['none'],
  [WhiteGloveFailureClass.EnrollmentFailure]: ['unenroll-device'],
  [WhiteGloveFailureClass.ProfileAssignmentFailure]: ['unassign-profile'],
  [WhiteGloveFailureClass.StandardizationFailure]: ['none'],
  [WhiteGloveFailureClass.ValidationFailure]: ['none'],
  [WhiteGloveFailureClass.OperatorCancellation]: ['unenroll-device', 'unassign-profile', 'remove-group-membership', 'revert-ninjaone-policy'],
  [WhiteGloveFailureClass.Transient]: ['none'],
  [WhiteGloveFailureClass.PermissionDenied]: ['none'],
};

/** Get compensation actions for a failure class. */
export function getCompensationActions(failureClass: WhiteGloveFailureClass): readonly CompensationAction[] {
  return COMPENSATION_RULES[failureClass];
}

// ─── Repair Guidance ───────────────────────────────────────────────────────────

export interface IRepairGuidance {
  readonly summary: string;
  readonly steps: readonly string[];
  readonly requiresAdminAction: boolean;
}

const REPAIR_GUIDANCE: Readonly<Record<WhiteGloveFailureClass, IRepairGuidance>> = {
  [WhiteGloveFailureClass.ConnectorFailure]: {
    summary: 'Connector is unreachable or authentication failed.',
    steps: [
      'Verify the connector configuration in the admin console.',
      'Test the connector connection.',
      'Check credentials have not expired.',
      'Retry the device run after the connector is healthy.',
    ],
    requiresAdminAction: true,
  },
  [WhiteGloveFailureClass.EnrollmentFailure]: {
    summary: 'Device enrollment was rejected by the platform.',
    steps: [
      'Check the serial number is registered in the enrollment program.',
      'Verify the device is not already enrolled in another tenant.',
      'Check Autopilot or ADE profile assignment.',
      'Retry the device run after resolving the enrollment issue.',
    ],
    requiresAdminAction: false,
  },
  [WhiteGloveFailureClass.ProfileAssignmentFailure]: {
    summary: 'Profile or group assignment failed.',
    steps: [
      'Verify the device is visible in Intune or ABM.',
      'Check the Autopilot or ADE profile exists and is valid.',
      'Verify group membership capacity and rules.',
      'Retry the device run after resolving the assignment issue.',
    ],
    requiresAdminAction: false,
  },
  [WhiteGloveFailureClass.StandardizationFailure]: {
    summary: 'Post-enrollment NinjaOne standardization failed.',
    steps: [
      'Check the NinjaOne agent is installed and reporting.',
      'Verify the software bundle or policy is valid in NinjaOne.',
      'Check NinjaOne API connectivity.',
      'Retry the device run — NinjaOne operations are generally idempotent.',
    ],
    requiresAdminAction: false,
  },
  [WhiteGloveFailureClass.ValidationFailure]: {
    summary: 'Post-action validation check failed.',
    steps: [
      'Review the validation check results for the specific failure.',
      'Verify the expected state was achieved on the target system.',
      'Retry the validation check.',
    ],
    requiresAdminAction: false,
  },
  [WhiteGloveFailureClass.OperatorCancellation]: {
    summary: 'The operator cancelled the run.',
    steps: [
      'Review any partially completed steps.',
      'Compensation actions will attempt to roll back changes.',
      'Launch a new package run if needed.',
    ],
    requiresAdminAction: false,
  },
  [WhiteGloveFailureClass.Transient]: {
    summary: 'A transient error occurred. This is usually self-resolving.',
    steps: [
      'Wait a few minutes and retry.',
      'If the error persists, check connector health.',
    ],
    requiresAdminAction: false,
  },
  [WhiteGloveFailureClass.PermissionDenied]: {
    summary: 'Insufficient permissions on the external system.',
    steps: [
      'Verify the service principal or app registration has the required permissions.',
      'Check admin consent has been granted.',
      'Contact a tenant administrator if consent is needed.',
    ],
    requiresAdminAction: true,
  },
};

/** Get operator-facing repair guidance for a failure class. */
export function getRepairGuidance(failureClass: WhiteGloveFailureClass): IRepairGuidance {
  return REPAIR_GUIDANCE[failureClass];
}

// ─── Failure Classification ────────────────────────────────────────────────────

type AdapterSource = 'microsoft' | 'apple' | 'ninjaone' | 'control-plane';

/** Classify an error into a white-glove failure class. */
export function classifyWhiteGloveFailure(
  error: Error,
  adapterSource: AdapterSource,
): WhiteGloveFailureClass {
  const msg = error.message.toLowerCase();

  // Permission errors
  if (msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('permission') || msg.includes('consent')) {
    return WhiteGloveFailureClass.PermissionDenied;
  }

  // Connector errors
  if (msg.includes('connection') || msg.includes('econnrefused') || msg.includes('timeout') || msg.includes('unreachable')) {
    return WhiteGloveFailureClass.ConnectorFailure;
  }

  // Platform-specific classification
  if (adapterSource === 'ninjaone') {
    if (msg.includes('bundle') || msg.includes('policy') || msg.includes('script')) {
      return WhiteGloveFailureClass.StandardizationFailure;
    }
  }

  if (msg.includes('enroll') || msg.includes('registration') || msg.includes('ade') || msg.includes('autopilot')) {
    return WhiteGloveFailureClass.EnrollmentFailure;
  }

  if (msg.includes('assign') || msg.includes('profile') || msg.includes('group')) {
    return WhiteGloveFailureClass.ProfileAssignmentFailure;
  }

  if (msg.includes('validat')) {
    return WhiteGloveFailureClass.ValidationFailure;
  }

  // Default to transient
  return WhiteGloveFailureClass.Transient;
}

import type { IProvisioningStatus, ISagaStepResult, ProvisioningFailureClass } from '@hbc/models';
import type { StatusVariant } from '@hbc/ui-kit';

/**
 * W0-G4-T02: Display constants for backend-assigned failure classifications.
 * These are display-only — failure class is NEVER inferred from error strings (spec §8.2).
 */

export const FAILURE_CLASS_LABELS: Record<ProvisioningFailureClass, string> = {
  transient: 'Transient Failure',
  structural: 'Structural Failure',
  permissions: 'Permissions Failure',
  repeated: 'Repeated Failure',
  'admin-class': 'Admin-Class Failure',
};

export const FAILURE_CLASS_DESCRIPTIONS: Record<ProvisioningFailureClass, string> = {
  transient: 'A temporary issue occurred during provisioning. A coordinator retry may resolve the problem.',
  structural: 'The provisioning configuration has a structural issue that requires Admin intervention to resolve.',
  permissions: 'The provisioning process lacks required permissions. An Admin must grant access before retrying.',
  repeated: 'This failure has occurred multiple times. Admin review is required to determine the root cause.',
  'admin-class': 'This failure requires Admin-level recovery. Please open an Admin Recovery request.',
};

export const FAILURE_CLASS_BADGE_VARIANT: Record<ProvisioningFailureClass, StatusVariant> = {
  transient: 'warning',
  structural: 'error',
  permissions: 'error',
  repeated: 'info',
  'admin-class': 'error',
};

const MAX_COORDINATOR_RETRIES = 2;

/**
 * W0-G4-T02: Determines whether a coordinator may retry provisioning.
 * Implements the exact 5-condition check from spec §8.3.
 * Returns `false` when `failureClass` is `undefined` (spec R1).
 */
export function canCoordinatorRetry(status: IProvisioningStatus): boolean {
  // Condition 1: Must be in Failed state
  if (status.overallStatus !== 'Failed') return false;
  // Condition 2: failureClass must be defined (spec R1)
  if (status.failureClass === undefined) return false;
  // Condition 3: Only transient failures are coordinator-retryable
  if (status.failureClass !== 'transient') return false;
  // Condition 4: Retry count must be below the bounded limit
  if (status.retryCount >= MAX_COORDINATOR_RETRIES) return false;
  // Condition 5: Must not already be escalated
  if (status.escalatedBy != null) return false;

  return true;
}

/**
 * W0-G4-T02: Finds the first failed step in a provisioning status.
 */
export function getFailedStep(status: IProvisioningStatus): ISagaStepResult | undefined {
  return status.steps.find((step) => step.status === 'Failed');
}

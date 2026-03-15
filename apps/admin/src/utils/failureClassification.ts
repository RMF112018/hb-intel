import type { IProvisioningStatus, ISagaStepResult, ProvisioningFailureClass } from '@hbc/models';
import type { StatusVariant } from '@hbc/ui-kit';

/**
 * W0-G4-T04: Display constants for backend-assigned failure classifications.
 * These are display-only — failure class is NEVER inferred from error strings.
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

/**
 * W0-G4-T04: Finds the first failed step in a provisioning status.
 */
export function getFailedStep(status: IProvisioningStatus): ISagaStepResult | undefined {
  return status.steps.find((step) => step.status === 'Failed');
}

import type { IProvisioningStatus } from '@hbc/models';
import type { StatusVariant } from '@hbc/ui-kit';

/**
 * W0-G4-T04: Display label mapping for provisioning overallStatus values.
 */
export const PROVISIONING_STATUS_LABELS: Record<IProvisioningStatus['overallStatus'], string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  BaseComplete: 'Base Complete',
  Completed: 'Completed',
  Failed: 'Failed',
  WebPartsPending: 'WebParts Pending',
};

/**
 * W0-G4-T04: Badge variant for provisioning overallStatus.
 * Escalated items get a separate indicator — this maps only the base status.
 */
export function getProvisioningStatusVariant(status: IProvisioningStatus): StatusVariant {
  if (status.overallStatus === 'Failed') return 'error';
  if (status.overallStatus === 'Completed') return 'completed';
  if (status.overallStatus === 'InProgress' || status.overallStatus === 'BaseComplete' || status.overallStatus === 'WebPartsPending') {
    return 'inProgress';
  }
  return 'neutral';
}

/**
 * W0-G4-T04: Provisioning status values allowed as manual state override targets.
 * Excludes the source status at call time. Expert-tier only.
 */
export const PROVISIONING_STATUS_VALUES: IProvisioningStatus['overallStatus'][] = [
  'NotStarted',
  'InProgress',
  'BaseComplete',
  'Completed',
  'Failed',
  'WebPartsPending',
];

/**
 * W0-G4-T04: Whether a provisioning run is stuck in a transitional (non-terminal) state.
 * Used to determine eligibility for manual state override.
 */
export function isStuckInTransitional(status: IProvisioningStatus): boolean {
  return status.overallStatus !== 'Completed' && status.overallStatus !== 'Failed';
}

/** Active provisioning status values for the Active Runs tab filter. */
export const ACTIVE_STATUS_VALUES: Set<string> = new Set([
  'NotStarted',
  'InProgress',
  'BaseComplete',
  'WebPartsPending',
]);

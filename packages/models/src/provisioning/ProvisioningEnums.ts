/**
 * Overall status of the provisioning saga orchestrator.
 */
export type ProvisioningOverallStatus =
  | 'NotStarted'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'RollingBack'
  | 'RolledBack'
  | 'Escalated';

/**
 * Execution status of an individual saga step.
 */
export type SagaStepStatus =
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Skipped'
  | 'RolledBack';

export type ProvisioningOverallStatus =
  | 'NotStarted'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'RollingBack'
  | 'RolledBack'
  | 'Escalated';

export type SagaStepStatus =
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Skipped'
  | 'RolledBack';

export interface ISagaStepResult {
  stepNumber: number;
  stepName: string;
  status: SagaStepStatus;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  completedCount?: number;
  totalCount?: number;
}

export interface IProvisioningStatus {
  projectCode: string;
  projectName: string;
  siteUrl?: string;
  currentStep: number;
  totalSteps: number;
  stepResults: ISagaStepResult[];
  overallStatus: ProvisioningOverallStatus;
  lastSuccessfulStep: number;
  escalated: boolean;
  escalatedAt?: string;
  escalatedBy?: string;
  triggeredBy: string;
  triggeredAt: string;
  completedAt?: string;
  fullSpecDeferred: boolean;
}

export interface IProvisionSiteRequest {
  projectCode: string;
  projectName: string;
  triggeredBy: string;
  templateId?: string;
  hubSiteUrl?: string;
}

export interface IProvisioningProgressEvent {
  projectCode: string;
  stepNumber: number;
  stepName: string;
  status: SagaStepStatus;
  timestamp: string;
  completedCount?: number;
  totalCount?: number;
  overallStatus: ProvisioningOverallStatus;
}

export interface IProvisioningEscalation {
  projectCode: string;
  escalatedBy: string;
  reason?: string;
}

export const SAGA_STEPS: readonly string[] = [
  'Create Site',
  'Document Library',
  'Template Files',
  'Data Lists',
  'Web Parts',
  'Permissions',
  'Hub Association',
] as const;

export const TOTAL_SAGA_STEPS = 7;

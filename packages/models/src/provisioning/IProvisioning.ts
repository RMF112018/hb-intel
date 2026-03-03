import type { SagaStepStatus, ProvisioningOverallStatus } from './ProvisioningEnums.js';

/**
 * Result of a single saga step execution.
 */
export interface ISagaStepResult {
  /** Step number in the saga sequence (1-based). */
  stepNumber: number;
  /** Human-readable step name. */
  stepName: string;
  /** Execution status of this step. */
  status: SagaStepStatus;
  /** ISO-8601 timestamp when step execution began. */
  startedAt?: string;
  /** ISO-8601 timestamp when step execution completed. */
  completedAt?: string;
  /** Error message if the step failed. */
  errorMessage?: string;
  /** Number of sub-tasks completed within this step. */
  completedCount?: number;
  /** Total number of sub-tasks within this step. */
  totalCount?: number;
}

/**
 * Full provisioning status for a project site.
 *
 * Tracks the saga orchestrator's progress through all provisioning steps.
 *
 * @example
 * ```ts
 * import type { IProvisioningStatus } from '@hbc/models';
 * ```
 */
export interface IProvisioningStatus {
  /** Project code identifier. */
  projectCode: string;
  /** Project display name. */
  projectName: string;
  /** SharePoint site URL once created. */
  siteUrl?: string;
  /** Current step number being executed. */
  currentStep: number;
  /** Total number of steps in the saga. */
  totalSteps: number;
  /** Results for each step executed so far. */
  stepResults: ISagaStepResult[];
  /** Overall saga execution status. */
  overallStatus: ProvisioningOverallStatus;
  /** Last step number that completed successfully. */
  lastSuccessfulStep: number;
  /** Whether the provisioning has been escalated. */
  escalated: boolean;
  /** ISO-8601 timestamp when escalation occurred. */
  escalatedAt?: string;
  /** User who triggered the escalation. */
  escalatedBy?: string;
  /** User who initiated the provisioning request. */
  triggeredBy: string;
  /** ISO-8601 timestamp when provisioning was initiated. */
  triggeredAt: string;
  /** ISO-8601 timestamp when provisioning completed. */
  completedAt?: string;
  /** Whether full-spec provisioning was deferred. */
  fullSpecDeferred: boolean;
}

/**
 * Request payload to initiate site provisioning.
 */
export interface IProvisionSiteRequest {
  /** Project code identifier. */
  projectCode: string;
  /** Project display name. */
  projectName: string;
  /** User initiating the request. */
  triggeredBy: string;
  /** SharePoint site template identifier. */
  templateId?: string;
  /** Hub site URL for association. */
  hubSiteUrl?: string;
}

/**
 * Real-time progress event pushed via SignalR during provisioning.
 */
export interface IProvisioningProgressEvent {
  /** Project code identifier. */
  projectCode: string;
  /** Current step number. */
  stepNumber: number;
  /** Human-readable step name. */
  stepName: string;
  /** Step execution status. */
  status: SagaStepStatus;
  /** ISO-8601 event timestamp. */
  timestamp: string;
  /** Number of sub-tasks completed within this step. */
  completedCount?: number;
  /** Total number of sub-tasks within this step. */
  totalCount?: number;
  /** Overall saga execution status. */
  overallStatus: ProvisioningOverallStatus;
}

/**
 * Payload for escalating a provisioning failure.
 */
export interface IProvisioningEscalation {
  /** Project code identifier. */
  projectCode: string;
  /** User triggering the escalation. */
  escalatedBy: string;
  /** Reason for the escalation. */
  reason?: string;
}

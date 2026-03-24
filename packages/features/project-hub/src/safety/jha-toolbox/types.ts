/**
 * P3-E8-T06 JHA, pre-task, toolbox prompt types.
 * Schedule risk mapping, validation results, work queue.
 */

// -- Schedule Risk Mapping (§4.2) -------------------------------------------

export interface IScheduleRiskMapping {
  readonly id: string;
  readonly projectId: string | null;
  readonly activityPattern: string;
  readonly associatedHazardCategories: readonly string[];
  readonly recommendedPromptIds: readonly string[];
  readonly isGoverned: boolean;
  readonly active: boolean;
}

// -- Validation Results -----------------------------------------------------

export interface IJhaApprovalResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPreTaskCompletionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPromptClosureResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// -- Work Queue (§5.5) ------------------------------------------------------

export interface IToolboxWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}

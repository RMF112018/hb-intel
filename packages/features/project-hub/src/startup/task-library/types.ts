/**
 * P3-E11-T10 Stage 2 Project Startup Task Library TypeScript contracts.
 * Governed template catalog, task instances, blockers.
 */

import type {
  StartupTaskCategory,
  StartupTaskDueTrigger,
  StartupTaskEvidenceType,
  StartupTaskGatingImpact,
  StartupTaskOwnerRole,
  StartupTaskResult,
  StartupTaskSectionCode,
  StartupTaskSeverity,
  TaskBlockerStatus,
  TaskBlockerType,
} from './enums.js';

// -- StartupTaskTemplate (T03 §2) — Org-governed ----------------------------

/** Org-governed task template per T03 §2. Owned by MOE. */
export interface IStartupTaskTemplate {
  readonly templateId: string;
  readonly taskNumber: string;
  readonly title: string;
  readonly sectionCode: StartupTaskSectionCode;
  readonly category: StartupTaskCategory;
  readonly severity: StartupTaskSeverity;
  readonly gatingImpact: StartupTaskGatingImpact;
  readonly ownerRoleCode: StartupTaskOwnerRole;
  readonly supportingRoleCodes: readonly string[];
  readonly dueTrigger: StartupTaskDueTrigger;
  readonly dueOffsetDays: number | null;
  readonly evidenceTypes: readonly StartupTaskEvidenceType[];
  readonly dependsOnTaskNumbers: readonly string[];
  readonly activeDuringStabilization: boolean;
  readonly applicabilityNote: string | null;
  readonly templateVersion: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly lastModifiedAt: string;
}

// -- StartupTaskInstance (T03 §2) — Per-project working copy ----------------

/** Per-project task instance per T03 §2. Template-inherited fields are immutable. */
export interface IStartupTaskInstance {
  readonly instanceId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly templateId: string;
  readonly templateVersion: number;
  // Immutable template-inherited fields (PATCH → HTTP 409)
  readonly taskNumber: string;
  readonly title: string;
  readonly sectionCode: StartupTaskSectionCode;
  readonly category: StartupTaskCategory;
  readonly severity: StartupTaskSeverity;
  readonly gatingImpact: StartupTaskGatingImpact;
  readonly ownerRoleCode: StartupTaskOwnerRole;
  readonly activeDuringStabilization: boolean;
  // Editable project-scoped fields
  readonly result: StartupTaskResult | null;
  readonly notes: string | null;
  readonly evidenceAttachmentIds: readonly string[];
  readonly evidenceNotes: string | null;
  readonly assignedUserId: string | null;
  readonly dueDate: string | null;
  // Calculated fields
  readonly isOverdue: boolean;
  readonly hasActiveBlocker: boolean;
  readonly publicationState: 'DRAFT' | 'CERTIFIED' | 'LOCKED';
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
}

// -- TaskBlocker (T03 §8) --------------------------------------------------

/** Task-level blocker per T03 §8. Tied to specific task instance. */
export interface ITaskBlocker {
  readonly blockerId: string;
  readonly instanceId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly blockerType: TaskBlockerType;
  readonly description: string;
  readonly responsibleParty: string | null;
  readonly dueDate: string | null;
  readonly blockerStatus: TaskBlockerStatus;
  readonly isAutoCreated: boolean;
  readonly linkedWaiverId: string | null;
  readonly resolvedAt: string | null;
  readonly resolvedBy: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
}

// -- Supporting Types -------------------------------------------------------

/** Task section definition per T03 §2. */
export interface IStartupTaskSectionDefinition {
  readonly sectionCode: StartupTaskSectionCode;
  readonly sectionNumber: number;
  readonly label: string;
  readonly taskCount: number;
}

/** Key dependency chain entry per T03 §5.2. */
export interface IStartupTaskDependency {
  readonly taskNumber: string;
  readonly dependsOn: readonly string[];
  readonly rationale: string;
}

/** Stage 2 Activity Spine event definition per T10 §2 Stage 2. */
export interface IStage2ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 2 Health Spine metric definition per T10 §2 Stage 2. */
export interface IStage2HealthMetricDef {
  readonly metric: string;
  readonly description: string;
}

/** Stage 2 Work Queue item definition per T10 §2 Stage 2. */
export interface IStage2WorkQueueItemDef {
  readonly item: string;
  readonly description: string;
}

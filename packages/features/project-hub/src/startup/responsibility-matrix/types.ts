/**
 * P3-E11-T10 Stage 6 Project Startup Responsibility Matrix TypeScript contracts.
 * Matrix header, task rows, assignment cells.
 */

import type {
  AssignmentValue,
  FieldTaskCategory,
  MatrixSheet,
  PMTaskCategory,
} from './enums.js';
import type { StartupCertificationStatus } from '../foundation/enums.js';

// -- ResponsibilityMatrix (T05 §3) — Header ---------------------------------

/** Responsibility matrix header per T05 §3. One per project. */
export interface IResponsibilityMatrix {
  readonly matrixId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly projectNumber: string;
  readonly matrixDate: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly pmRowsWithPrimaryCount: number;
  readonly fieldRowsWithPrimaryCount: number;
  readonly unacknowledgedCriticalCount: number;
  readonly certificationStatus: StartupCertificationStatus;
}

// -- ResponsibilityMatrixRow (T05 §4) — Task Row ----------------------------

/** Matrix task row per T05 §4. PM or Field sheet. */
export interface IResponsibilityMatrixRow {
  readonly rowId: string;
  readonly matrixId: string;
  readonly projectId: string;
  readonly sheet: MatrixSheet;
  readonly taskCategory: string;
  readonly taskDescription: string;
  readonly isCriticalCategory: boolean;
  readonly isCustomRow: boolean;
  readonly isReminderOnly: boolean;
  readonly sortOrder: number;
}

// -- ResponsibilityAssignment (T05 §5) — Cell --------------------------------

/** Responsibility assignment cell per T05 §5. One per role column per row. */
export interface IResponsibilityAssignment {
  readonly assignmentId: string;
  readonly rowId: string;
  readonly matrixId: string;
  readonly roleCode: string;
  readonly assignedPersonName: string | null;
  readonly assignedUserId: string | null;
  readonly value: AssignmentValue | null;
  readonly effectiveFrom: string | null;
  readonly acknowledgedAt: string | null;
  readonly acknowledgedBy: string | null;
  readonly lastModifiedAt: string | null;
  readonly lastModifiedBy: string | null;
}

// -- Supporting Types -------------------------------------------------------

/** PM task category definition per T05 §8. */
export interface IPMTaskCategoryDefinition {
  readonly category: PMTaskCategory;
  readonly label: string;
  readonly assignmentBearingRowCount: number;
  readonly reminderOnlyRowCount: number;
  readonly isCritical: boolean;
}

/** Field task category definition per T05 §10. */
export interface IFieldTaskCategoryDefinition {
  readonly category: FieldTaskCategory;
  readonly label: string;
  readonly assignmentBearingRowCount: number;
  readonly isCritical: boolean;
}

/** Stage 6 Activity Spine event definition. */
export interface IStage6ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 6 Health Spine metric definition. */
export interface IStage6HealthMetricDef {
  readonly metric: string;
  readonly description: string;
}

/** Stage 6 Work Queue item definition. */
export interface IStage6WorkQueueItemDef {
  readonly item: string;
  readonly description: string;
  readonly assignedTo: string;
}

/** Computed matrix readiness counts. */
export interface IMatrixReadiness {
  readonly pmRowsWithPrimaryCount: number;
  readonly fieldRowsWithPrimaryCount: number;
  readonly unacknowledgedCriticalCount: number;
}

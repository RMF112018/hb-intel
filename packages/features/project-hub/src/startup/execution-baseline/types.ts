/**
 * P3-E11-T10 Stage 7 Project Startup Execution Baseline (PM Plan) TypeScript contracts.
 * 11-section baseline, structured fields, assumptions, signatures.
 */

import type {
  AssumptionCategory,
  AssumptionRiskLevel,
  BaselineFieldType,
  BaselineStatus,
} from './enums.js';
import type { StartupCertificationStatus } from '../foundation/enums.js';

// -- ProjectExecutionBaseline (T06 §2) — Header ------------------------------

/** Project execution baseline header per T06 §2. One per project. */
export interface IProjectExecutionBaseline {
  readonly baselineId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly projectNumber: string;
  readonly submittedBy: string | null;
  readonly submittedByUserId: string | null;
  readonly approvedBy: string | null;
  readonly approvedByUserId: string | null;
  readonly planDate: string | null;
  readonly status: BaselineStatus;
  readonly lastModifiedAt: string;
  readonly createdAt: string;
  readonly distributionResidential: readonly string[];
  readonly distributionCommercial: readonly string[];
  readonly certificationStatus: StartupCertificationStatus;
}

// -- ExecutionBaselineSection (T06 §3) — Section Record ----------------------

/** Execution baseline section per T06 §3. 11 per baseline. */
export interface IExecutionBaselineSection {
  readonly sectionId: string;
  readonly baselineId: string;
  readonly sectionNumber: number;
  readonly sectionTitle: string;
  readonly content: string | null;
  readonly isComplete: boolean;
  readonly completedAt: string | null;
  readonly completedBy: string | null;
  readonly captureMode: string;
}

// -- BaselineSectionField (T06 §4) — Typed Commitment Field ------------------

/** Baseline section field per T06 §4. Typed commitment records. */
export interface IBaselineSectionField {
  readonly fieldId: string;
  readonly sectionId: string;
  readonly fieldKey: string;
  readonly fieldLabel: string;
  readonly fieldType: BaselineFieldType;
  readonly value: string | number | boolean | null;
  readonly sectionNumber: number;
  readonly isBaselineQueryable: boolean;
}

// -- ExecutionAssumption (T06 §7) — Critical Assumption Record ---------------

/** Execution assumption per T06 §7. 0+ per baseline. */
export interface IExecutionAssumption {
  readonly assumptionId: string;
  readonly baselineId: string;
  readonly projectId: string;
  readonly category: AssumptionCategory;
  readonly description: string;
  readonly rationale: string | null;
  readonly ownerRoleCode: string | null;
  readonly riskLevel: AssumptionRiskLevel | null;
  readonly closeoutVerificationNote: string | null;
  readonly isSuccessCriterion: boolean;
  readonly successMeasure: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
}

// -- PlanTeamSignature (T06 §2.2) — Signature Block --------------------------

/** Plan team signature per T06 §2.2. */
export interface IPlanTeamSignature {
  readonly signatureId: string;
  readonly memberName: string;
  readonly role: string;
  readonly signedAt: string | null;
  readonly userId: string | null;
}

// -- Supporting Types -------------------------------------------------------

/** Baseline section definition per T06 §3.1. */
export interface IBaselineSectionDefinition {
  readonly sectionNumber: number;
  readonly sectionTitle: string;
  readonly captureMode: string;
}

/** Critical baseline field definition for certification gate per T06 §2.3. */
export interface ICriticalBaselineField {
  readonly fieldKey: string;
  readonly fieldLabel: string;
  readonly sectionNumber: number;
}

/** Valid baseline status transition per T06 §2.1. */
export interface IBaselineStatusTransition {
  readonly from: BaselineStatus;
  readonly to: BaselineStatus;
  readonly description: string;
}

/** Assumption category definition per T06 §8. */
export interface IAssumptionCategoryDefinition {
  readonly category: AssumptionCategory;
  readonly label: string;
  readonly description: string;
}

/** Stage 7 Activity Spine event definition. */
export interface IStage7ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 7 Health Spine metric definition. */
export interface IStage7HealthMetricDef {
  readonly metric: string;
  readonly description: string;
}

/** Stage 7 Work Queue item definition. */
export interface IStage7WorkQueueItemDef {
  readonly item: string;
  readonly description: string;
  readonly assignedTo: string;
}

/**
 * P3-E11-T10 Stage 8 Project Startup Baseline Lock and Closeout Continuity TypeScript contracts.
 * StartupBaseline Tier 4 snapshot, nested sub-surface summaries, lock transaction.
 */

import type { BaselineAPIMethod } from './enums.js';

// -- Sub-Surface Snapshot Types -----------------------------------------------

/** Task library snapshot at baseline lock per T02 §7.2. */
export interface ITaskLibrarySnapshot {
  readonly totalTasks: number;
  readonly yesTasks: number;
  readonly noTasks: number;
  readonly naTasks: number;
  readonly unreviewedTasks: number;
  readonly openBlockers: number;
}

/** Safety readiness snapshot at baseline lock per T02 §7.2. */
export interface ISafetyReadinessSnapshot {
  readonly passCount: number;
  readonly failCount: number;
  readonly naCount: number;
  readonly openRemediations: number;
  readonly resolvedRemediations: number;
}

/** Permit posting snapshot item at baseline lock per T02 §7.2. */
export interface IPermitPostingSnapshotItem {
  readonly taskNumber: string;
  readonly description: string;
  readonly result: string | null;
}

/** Contract obligations snapshot at baseline lock per T02 §7.2. */
export interface IContractObligationsSnapshot {
  readonly totalObligations: number;
  readonly flaggedObligations: number;
  readonly openObligations: number;
  readonly satisfiedObligations: number;
}

/** Primary assignment snapshot entry per T02 §7.2. */
export interface IPrimaryAssignmentSnapshot {
  readonly sheet: string;
  readonly taskCategory: string;
  readonly roleCode: string;
  readonly assignedPersonName: string;
  readonly assignedUserId: string | null;
  readonly acknowledgedAt: string | null;
}

/** Responsibility matrix snapshot at baseline lock per T02 §7.2. */
export interface IResponsibilitySnapshot {
  readonly pmSheetAssigned: boolean;
  readonly fieldSheetAssigned: boolean;
  readonly unassignedCategories: readonly string[];
  readonly primaryAssignments: readonly IPrimaryAssignmentSnapshot[];
}

/** Certification summary entry at baseline lock per T02 §7.2. */
export interface ICertificationSummaryAtLock {
  readonly subSurface: string;
  readonly certStatus: string;
  readonly certVersion: number;
  readonly certifiedBy: readonly string[];
}

/** Approved waiver entry at baseline lock per T02 §7.2. */
export interface IApprovedWaiverAtLock {
  readonly waiverId: string;
  readonly subSurface: string;
  readonly waivedItemRef: string;
  readonly rationale: string;
  readonly plannedResolutionDate: string;
}

/** Open program blocker entry at baseline lock per T02 §7.2. */
export interface IOpenBlockerAtLock {
  readonly blockerId: string;
  readonly blockerType: string;
  readonly description: string;
  readonly escalatedToPE: boolean;
}

/** PE flag entry at baseline lock per T02 §7.2. */
export interface IPEFlagAtLock {
  readonly recordRef: string;
  readonly flagNote: string;
}

// -- StartupBaseline (T02 §7.2) — Tier 4 Immutable Snapshot ------------------

/** StartupBaseline Tier 4 immutable snapshot per T02 §7.2. One per project. Created atomically at BASELINE_LOCKED. */
export interface IStartupBaseline {
  readonly snapshotId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly lockedAt: string;
  readonly lockedBy: string;
  readonly programStateAtLock: 'BASELINE_LOCKED';
  readonly stabilizationWindowDays: number;
  readonly stabilizationActualDuration: number;
  readonly taskLibrarySnapshotAtLock: ITaskLibrarySnapshot;
  readonly safetyReadinessSnapshotAtLock: ISafetyReadinessSnapshot;
  readonly permitPostingSnapshotAtLock: readonly IPermitPostingSnapshotItem[];
  readonly contractObligationsSnapshotAtLock: IContractObligationsSnapshot;
  readonly responsibilitySnapshotAtLock: IResponsibilitySnapshot;
  readonly executionBaselineFieldsAtLock: Readonly<Record<string, string | number | boolean | null>>;
  readonly pmPlanStatusAtLock: string;
  readonly certificationSummaryAtLock: readonly ICertificationSummaryAtLock[];
  readonly approvedWaiversAtLock: readonly IApprovedWaiverAtLock[];
  readonly lapsedWaiversAtLock: readonly IApprovedWaiverAtLock[];
  readonly openProgramBlockersAtLock: readonly IOpenBlockerAtLock[];
  readonly peFlagsAtLock: readonly IPEFlagAtLock[];
  readonly authorizingPEUserId: string;
  readonly authorizationTimestamp: string;
}

// -- Supporting Types -------------------------------------------------------

/** Baseline lock transaction step per T01 §7.5. */
export interface IBaselineLockTransactionStep {
  readonly stepNumber: number;
  readonly description: string;
}

/** Closeout API contract definition per T02 §7.3. */
export interface ICloseoutAPIContract {
  readonly endpoint: string;
  readonly authorizedRoles: readonly string[];
  readonly responses: ReadonlyArray<{ method: BaselineAPIMethod; statusCode: number; description: string }>;
}

/** Closeout delta analysis mapping entry per T06 §9.2. */
export interface ICloseoutDeltaAnalysisEntry {
  readonly analysis: string;
  readonly sourceFields: readonly string[];
}

/** Stage 8 Activity Spine event definition. */
export interface IStage8ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

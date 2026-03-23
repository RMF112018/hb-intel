import type {
  IMilestoneRecord,
  IMilestoneThresholdConfig,
  IReconciliationRecord,
  IReconciliationStatusInput,
  MilestoneStatus,
  ReconciliationStatus,
  ReconciliationTrigger,
  ScheduleActivityType,
} from '../types/index.js';

/**
 * P3-E5-T02 commitment and milestone domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Reconciliation Status Resolution (§2.1) ──────────────────────────

/**
 * Resolve the reconciliation status between managed commitment and source truth.
 * Returns one of 7 statuses per §2.1 rules.
 */
export const resolveReconciliationStatus = (
  input: IReconciliationStatusInput,
): ReconciliationStatus => {
  const {
    committedStartDate,
    committedFinishDate,
    sourceStartDate,
    sourceFinishDate,
    finishVarianceDays,
    approvalRequired,
    approvedBy,
    rejectionReason,
  } = input;

  // Workflow terminal states take precedence
  if (rejectionReason) {
    return 'Rejected';
  }

  if (approvalRequired && approvedBy) {
    return 'Approved';
  }

  if (approvalRequired && !approvedBy) {
    return 'PendingApproval';
  }

  // No committed dates = using source truth = aligned
  if (committedStartDate === null && committedFinishDate === null) {
    return 'Aligned';
  }

  // Check if committed dates match source dates (aligned)
  if (committedStartDate === sourceStartDate && committedFinishDate === sourceFinishDate) {
    return 'Aligned';
  }

  // Source moved ahead of committed position
  if (finishVarianceDays !== null && finishVarianceDays < 0) {
    // Committed finish is earlier than source finish — source has slipped past
    return 'SourceAhead';
  }

  // PM has overridden — committed differs but source hasn't moved past
  if (committedFinishDate !== null && committedFinishDate !== sourceFinishDate) {
    // Large variance = conflict requiring review
    if (finishVarianceDays !== null && Math.abs(finishVarianceDays) > 60) {
      return 'ConflictRequiresReview';
    }
    return 'PMOverride';
  }

  return 'Aligned';
};

// ── Variance Calculation ─────────────────────────────────────────────

/**
 * Calculate variance in calendar days between committed and source dates.
 * Positive = committed is later than source. Null if no commitment.
 */
export const calculateVarianceDays = (
  committedDate: string | null,
  sourceDate: string,
): number | null => {
  if (committedDate === null) {
    return null;
  }

  const committed = new Date(committedDate);
  const source = new Date(sourceDate);
  const diffMs = committed.getTime() - source.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// ── Approval Threshold Check (§21.1) ─────────────────────────────────

/**
 * Determine whether PE approval is required based on governed variance threshold.
 * Returns true when the absolute variance exceeds the threshold.
 */
export const isApprovalRequired = (
  finishVarianceDays: number | null,
  governedThresholdDays: number,
): boolean => {
  if (finishVarianceDays === null) {
    return false;
  }
  return Math.abs(finishVarianceDays) > governedThresholdDays;
};

// ── Milestone Status Calculation (§4.3) ──────────────────────────────

/**
 * Calculate milestone status per the §4.3 algorithm.
 * Status is never stored — recalculated on each load.
 */
export const calculateMilestoneStatus = (
  milestone: Pick<IMilestoneRecord, 'actualDate' | 'varianceDays' | 'status'>,
  thresholds: IMilestoneThresholdConfig,
): MilestoneStatus => {
  // Achieved if actual date is set
  if (milestone.actualDate !== null) {
    return 'Achieved';
  }

  // Superseded is immutable once set
  if (milestone.status === 'Superseded') {
    return 'Superseded';
  }

  const { varianceDays } = milestone;
  const { atRiskThresholdDays, delayedThresholdDays } = thresholds;

  if (varianceDays <= 0) {
    return 'OnTrack';
  }

  if (varianceDays <= atRiskThresholdDays) {
    return 'AtRisk';
  }

  if (varianceDays <= delayedThresholdDays) {
    return 'Delayed';
  }

  return 'Critical';
};

// ── Forecast Date Calculation ────────────────────────────────────────

/**
 * Effective forecast date: committedFinishDate if set, else sourceFinishDate.
 */
export const calculateForecastDate = (
  committedFinishDate: string | null,
  sourceFinishDate: string,
): string => {
  return committedFinishDate ?? sourceFinishDate;
};

// ── Revised Baseline Date Calculation ────────────────────────────────

/**
 * Calculate revised baseline date by adding approved extension days.
 * Returns null if no baseline exists.
 */
export const calculateRevisedBaselineDate = (
  baselineFinishDate: string | null,
  approvedExtensionDays: number,
): string | null => {
  if (baselineFinishDate === null) {
    return null;
  }

  if (approvedExtensionDays === 0) {
    return baselineFinishDate;
  }

  const baseline = new Date(baselineFinishDate);
  baseline.setDate(baseline.getDate() + approvedExtensionDays);
  return baseline.toISOString().split('T')[0];
};

// ── Milestone Identification (§4.1) ──────────────────────────────────

/**
 * Determine whether an activity is treated as a milestone (§4.1).
 * True when activityType is TT_Mile or TT_FinMile, OR when PM sets override.
 */
export const isMilestoneActivity = (
  activityType: ScheduleActivityType,
  isMilestoneOverride: boolean,
): boolean => {
  if (isMilestoneOverride) {
    return true;
  }
  return activityType === 'TT_Mile' || activityType === 'TT_FinMile';
};

// ── Reconciliation Entry Factory (§2.2) ──────────────────────────────

/**
 * Create a reconciliation audit entry for a status transition.
 */
export const createReconciliationEntry = (
  commitmentId: string,
  priorStatus: ReconciliationStatus,
  newStatus: ReconciliationStatus,
  trigger: ReconciliationTrigger,
  context: {
    readonly projectId: string;
    readonly sourceVersionId: string;
    readonly priorCommittedFinish: string | null;
    readonly newCommittedFinish: string | null;
    readonly causationCode?: string | null;
    readonly explanation?: string | null;
    readonly createdBy: string;
  },
): IReconciliationRecord => ({
  reconciliationId: `recon-${Date.now()}`,
  commitmentId,
  projectId: context.projectId,
  priorStatus,
  newStatus,
  priorCommittedFinish: context.priorCommittedFinish,
  newCommittedFinish: context.newCommittedFinish,
  sourceVersionId: context.sourceVersionId,
  triggeredBy: trigger,
  causationCode: context.causationCode ?? null,
  explanation: context.explanation ?? null,
  createdAt: new Date().toISOString(),
  createdBy: context.createdBy,
});

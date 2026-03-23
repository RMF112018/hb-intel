import type {
  IMilestoneSummary,
  IMilestoneRecord,
  IMilestoneThresholdConfig,
  INextMilestoneRef,
  IPublicationRecord,
  IPublicationValidationResult,
  IPublishBlocker,
  IPublishedActivitySnapshot,
  IScheduleSummaryThresholdConfig,
  PublicationLifecycleStatus,
  ReconciliationStatus,
  ScheduleOverallStatus,
} from '../types/index.js';
import { calculateMilestoneStatus } from '../commitments/index.js';

/**
 * P3-E5-T03 publication layer domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Publication Lifecycle State Machine (§3.1) ───────────────────────

/** Valid lifecycle actions. */
export type PublicationAction = 'submit' | 'approve' | 'reject' | 'supersede';

/**
 * Transition publication lifecycle status per §3.1 state machine.
 * Throws on invalid transitions.
 */
export const transitionPublicationStatus = (
  current: PublicationLifecycleStatus,
  action: PublicationAction,
): PublicationLifecycleStatus => {
  switch (current) {
    case 'Draft':
      if (action === 'submit') return 'ReadyForReview';
      break;
    case 'ReadyForReview':
      if (action === 'approve') return 'Published';
      if (action === 'reject') return 'Draft';
      break;
    case 'Published':
      if (action === 'supersede') return 'Superseded';
      break;
    case 'Superseded':
      break;
  }

  throw new Error(
    `Invalid publication transition: cannot '${action}' from '${current}'.`,
  );
};

// ── Publication Advance Validation ───────────────────────────────────

/**
 * Validate whether a publication can advance to its next lifecycle stage.
 * Enforces blocker resolution and PE reviewer requirement.
 */
export const validatePublicationAdvance = (
  publication: IPublicationRecord,
  targetStatus: PublicationLifecycleStatus,
): IPublicationValidationResult => {
  const blockerMessages: string[] = [];

  if (publication.lifecycleStatus === 'Draft' && targetStatus === 'ReadyForReview') {
    // Draft → ReadyForReview: always allowed
    return { canAdvance: true, blockers: [] };
  }

  if (publication.lifecycleStatus === 'ReadyForReview' && targetStatus === 'Published') {
    // Check hard blockers
    const unresolvedHard = publication.blockers.filter(
      (b) => b.severity === 'Hard' && b.resolvedAt === null,
    );
    if (unresolvedHard.length > 0) {
      blockerMessages.push(
        ...unresolvedHard.map(
          (b) => `Unresolved hard blocker: ${b.blockerCode} — ${b.blockerDescription}`,
        ),
      );
    }

    // PE reviewer must be set
    if (!publication.reviewedBy) {
      blockerMessages.push('PE reviewer must be assigned before publication can be approved.');
    }

    return {
      canAdvance: blockerMessages.length === 0,
      blockers: blockerMessages,
    };
  }

  if (publication.lifecycleStatus === 'Published' && targetStatus === 'Superseded') {
    // Published → Superseded: always allowed (triggered by new publication entering Published)
    return { canAdvance: true, blockers: [] };
  }

  blockerMessages.push(
    `Invalid transition: ${publication.lifecycleStatus} → ${targetStatus}.`,
  );
  return { canAdvance: false, blockers: blockerMessages };
};

// ── Published Activity Snapshot Creation (§3.3) ──────────────────────

/**
 * Create a frozen published activity snapshot combining source truth and commitment.
 * publishedStartDate = committedStart ?? sourceStart; same for finish.
 */
export const createPublishedActivitySnapshot = (
  publicationId: string,
  source: {
    readonly externalActivityKey: string;
    readonly sourceActivityCode: string;
    readonly activityName: string;
    readonly targetStartDate: string;
    readonly targetFinishDate: string;
    readonly percentComplete: number;
    readonly totalFloatHrs: number;
    readonly activityType: string;
  },
  commitment: {
    readonly committedStartDate: string | null;
    readonly committedFinishDate: string | null;
    readonly reconciliationStatus: ReconciliationStatus;
  } | null,
  baselineFinishDate: string | null,
): IPublishedActivitySnapshot => {
  const publishedStartDate = commitment?.committedStartDate ?? source.targetStartDate;
  const publishedFinishDate = commitment?.committedFinishDate ?? source.targetFinishDate;

  let varianceFromBaselineDays = 0;
  if (baselineFinishDate) {
    const published = new Date(publishedFinishDate);
    const baseline = new Date(baselineFinishDate);
    varianceFromBaselineDays = Math.round(
      (published.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  const isMilestone =
    source.activityType === 'TT_Mile' || source.activityType === 'TT_FinMile';

  return {
    publishedSnapshotId: `pub-snap-${Date.now()}`,
    publicationId,
    externalActivityKey: source.externalActivityKey,
    sourceActivityCode: source.sourceActivityCode,
    activityName: source.activityName,
    publishedStartDate,
    publishedFinishDate,
    publishedPercentComplete: source.percentComplete,
    varianceFromBaselineDays,
    sourceFinishDate: source.targetFinishDate,
    committedFinishDate: commitment?.committedFinishDate ?? null,
    reconciliationStatus: commitment?.reconciliationStatus ?? 'Aligned',
    isCriticalPath: source.totalFloatHrs <= 0,
    isMilestone,
  };
};

// ── Schedule Overall Status (§19.2) ──────────────────────────────────

/**
 * Calculate overall schedule status from project-level variance and governed thresholds.
 */
export const calculateScheduleOverallStatus = (
  varianceDays: number,
  thresholds: IScheduleSummaryThresholdConfig,
): ScheduleOverallStatus => {
  if (varianceDays <= 0) {
    return 'OnTrack';
  }
  if (varianceDays <= thresholds.atRiskThresholdDays) {
    return 'AtRisk';
  }
  if (varianceDays <= thresholds.delayedThresholdDays) {
    return 'Delayed';
  }
  return 'Critical';
};

// ── Milestone Summary Builder ────────────────────────────────────────

/**
 * Build aggregate milestone status counts from a set of milestones.
 */
export const buildMilestoneSummary = (
  milestones: ReadonlyArray<Pick<IMilestoneRecord, 'actualDate' | 'varianceDays' | 'status'>>,
  thresholds: IMilestoneThresholdConfig,
): IMilestoneSummary => {
  const summary: {
    total: number;
    achieved: number;
    onTrack: number;
    atRisk: number;
    delayed: number;
    critical: number;
    notStarted: number;
  } = {
    total: milestones.length,
    achieved: 0,
    onTrack: 0,
    atRisk: 0,
    delayed: 0,
    critical: 0,
    notStarted: 0,
  };

  for (const milestone of milestones) {
    const status = calculateMilestoneStatus(milestone, thresholds);
    switch (status) {
      case 'Achieved':
        summary.achieved++;
        break;
      case 'OnTrack':
        summary.onTrack++;
        break;
      case 'AtRisk':
        summary.atRisk++;
        break;
      case 'Delayed':
        summary.delayed++;
        break;
      case 'Critical':
        summary.critical++;
        break;
      case 'NotStarted':
        summary.notStarted++;
        break;
      case 'Superseded':
        // Superseded milestones are counted in total but not in any status bucket
        break;
    }
  }

  return summary;
};

// ── Next Milestone Finder ────────────────────────────────────────────

/**
 * Find the next upcoming non-achieved milestone by forecastDate.
 * Returns null when all milestones are achieved or none exist.
 */
export const findNextMilestone = (
  milestones: ReadonlyArray<Pick<IMilestoneRecord, 'milestoneName' | 'forecastDate' | 'varianceDays' | 'status' | 'actualDate'>>,
): INextMilestoneRef | null => {
  const upcoming = milestones
    .filter((m) => m.actualDate === null && m.status !== 'Superseded')
    .sort((a, b) => new Date(a.forecastDate).getTime() - new Date(b.forecastDate).getTime());

  if (upcoming.length === 0) {
    return null;
  }

  const next = upcoming[0];
  return {
    milestoneName: next.milestoneName,
    publishedForecastDate: next.forecastDate,
    varianceDays: next.varianceDays,
    status: next.status,
  };
};

// ── Hard Blocker Check ───────────────────────────────────────────────

/**
 * Check if any unresolved Hard blockers exist.
 */
export const hasUnresolvedHardBlockers = (
  blockers: ReadonlyArray<IPublishBlocker>,
): boolean => {
  return blockers.some((b) => b.severity === 'Hard' && b.resolvedAt === null);
};

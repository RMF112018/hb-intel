import { BLOCKER_SEVERITIES, FIELD_COMMITMENT_STATUSES, OVERALL_READINESS_VALUES } from '../constants/index.js';
import type {
  BlockerSeverity,
  FieldCommitmentStatus,
  IBlockerRecord,
  IFieldCommitmentRecord,
  IFieldWorkPackage,
  IProgressClaimRecord,
  IProgressVerificationRecord,
  IReadinessRecord,
  OverallReadiness,
} from '../types/index.js';

/**
 * P3-E5-T05 field execution domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── PPC Calculation (§9) ─────────────────────────────────────────────

/**
 * Calculate Percent Plan Complete (PPC).
 * Returns 0 if denominator is 0 (no commitments).
 */
export const calculatePPC = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
};

// ── Blocker Severity Roll-Up (§9.1) ──────────────────────────────────

/**
 * Resolve highest blocker severity across all open blockers.
 * Returns null if no open blockers.
 */
export const resolveBlockerSeverityRollUp = (
  blockers: ReadonlyArray<IBlockerRecord>,
): BlockerSeverity | null => {
  const open = blockers.filter(
    (b) => b.status === 'Open' || b.status === 'InProgress' || b.status === 'Escalated',
  );

  if (open.length === 0) return null;

  // Severity order: Critical > Blocking > AtRisk > Informational
  const severityOrder = [...BLOCKER_SEVERITIES].reverse();
  for (const severity of severityOrder) {
    if (open.some((b) => b.severity === severity)) {
      return severity;
    }
  }

  return open[0].severity;
};

// ── Readiness Roll-Up (§9.1) ─────────────────────────────────────────

/**
 * Resolve lowest readiness level across active records.
 * Returns 'Unknown' if no records.
 */
export const resolveReadinessRollUp = (
  records: ReadonlyArray<IReadinessRecord>,
): OverallReadiness => {
  if (records.length === 0) return 'Unknown';

  // Readiness order: NotReady < ConditionallyReady < Ready < Unknown
  const readinessOrder: readonly OverallReadiness[] = OVERALL_READINESS_VALUES;
  // Lower index = better readiness, except Unknown is at end
  // Actual order should be: Ready (best) > ConditionallyReady > NotReady (worst) > Unknown
  // We want the worst (lowest), so: NotReady < ConditionallyReady < Ready
  const worstFirst: OverallReadiness[] = ['NotReady', 'ConditionallyReady', 'Ready', 'Unknown'];

  for (const level of worstFirst) {
    if (records.some((r) => r.overallReadiness === level)) {
      return level;
    }
  }

  return readinessOrder[readinessOrder.length - 1];
};

// ── Commitment Status Roll-Up (§9.1) ─────────────────────────────────

/**
 * Resolve worst active commitment status.
 * Returns null if no active commitments.
 */
export const resolveCommitmentStatusRollUp = (
  commitments: ReadonlyArray<IFieldCommitmentRecord>,
): FieldCommitmentStatus | null => {
  const active = commitments.filter(
    (c) => c.status !== 'Cancelled' && c.status !== 'Kept',
  );

  if (active.length === 0) return null;

  // Worst first: Missed > PartiallyKept > Declined > Reassigned > Requested > Acknowledged > Accepted
  const worstFirst: FieldCommitmentStatus[] = [
    'Missed', 'PartiallyKept', 'Declined', 'Reassigned',
    'Requested', 'Acknowledged', 'Accepted',
  ];

  for (const status of worstFirst) {
    if (active.some((c) => c.status === status)) {
      return status;
    }
  }

  return active[0].status;
};

// ── Weighted Progress Calculation (§9.1) ──────────────────────────────

/**
 * Calculate weighted average progress across work packages.
 * Weight = quantityPlanned. Packages without quantity are weighted equally at 1.
 */
export const calculateWeightedProgress = (
  packages: ReadonlyArray<Pick<IFieldWorkPackage, 'reportedProgressPct' | 'quantityPlanned'>>,
): number => {
  if (packages.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const pkg of packages) {
    const weight = pkg.quantityPlanned ?? 1;
    const progress = pkg.reportedProgressPct ?? 0;
    weightedSum += progress * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
};

// ── Verification Authority Check (§8.2) ──────────────────────────────

/**
 * Check if a progress claim has been verified and accepted per §8.2 authority chain.
 * Authoritative = verified + PM accepted, OR verification not required.
 */
export const isVerifiedAndAccepted = (
  claim: Pick<IProgressClaimRecord, 'verificationRequired' | 'verificationStatus'>,
  verification: Pick<IProgressVerificationRecord, 'verificationOutcome' | 'pmAcceptanceRequired' | 'pmAcceptedAt'> | null,
): boolean => {
  if (!claim.verificationRequired) {
    return true;
  }

  if (claim.verificationStatus !== 'Verified') {
    return false;
  }

  if (!verification) {
    return false;
  }

  if (verification.verificationOutcome === 'Rejected') {
    return false;
  }

  if (verification.pmAcceptanceRequired && !verification.pmAcceptedAt) {
    return false;
  }

  return true;
};

// ── Work Package Window Validation (§6.1) ────────────────────────────

/**
 * Validate that a work package falls within its parent activity's date window (§6.1).
 * Returns validity flag and optional warning message.
 */
export const isWorkPackageInParentWindow = (
  wp: Pick<IFieldWorkPackage, 'plannedStartDate' | 'plannedFinishDate'>,
  parentStartDate: string,
  parentFinishDate: string,
): { valid: boolean; warning?: string } => {
  const wpStart = new Date(wp.plannedStartDate);
  const wpFinish = new Date(wp.plannedFinishDate);
  const parentStart = new Date(parentStartDate);
  const parentFinish = new Date(parentFinishDate);

  const warnings: string[] = [];

  if (wpStart < parentStart) {
    warnings.push(`Work package start (${wp.plannedStartDate}) is before parent activity start (${parentStartDate}).`);
  }

  if (wpFinish > parentFinish) {
    warnings.push(`Work package finish (${wp.plannedFinishDate}) is after parent activity finish (${parentFinishDate}).`);
  }

  return {
    valid: warnings.length === 0,
    warning: warnings.length > 0 ? warnings.join(' ') : undefined,
  };
};

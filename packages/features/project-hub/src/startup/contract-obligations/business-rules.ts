/**
 * P3-E11-T10 Stage 5 Project Startup Contract Obligations Register business rules.
 * Lifecycle transitions, PX guards, monitoring, certification eligibility.
 */

import type {
  MonitoringPriority,
  ObligationCategory,
  ObligationStatus,
} from './enums.js';
import {
  MONITORING_PRIORITY_LEAD_DAYS,
  OBLIGATION_STATE_TRANSITIONS,
  TERMINAL_OBLIGATION_STATUSES,
} from './constants.js';

// -- Lifecycle Transitions (T04 §4) ------------------------------------------

/**
 * Returns true if the obligation status transition from→to is valid per T04 §4.
 */
export const isValidObligationTransition = (
  from: ObligationStatus,
  to: ObligationStatus,
): boolean =>
  OBLIGATION_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);

/**
 * Returns true if the transition requires PX role per T04 §4.
 * WAIVED transitions and terminal→OPEN reopens require PX.
 */
export const requiresPXForTransition = (
  from: ObligationStatus,
  to: ObligationStatus,
): boolean => {
  const transition = OBLIGATION_STATE_TRANSITIONS.find((t) => t.from === from && t.to === to);
  return transition?.requiresPX ?? false;
};

// -- Waiver and Evidence Guards (T04 §4) -------------------------------------

/**
 * Returns true if waiverNote is required for the target status.
 * Per T04 §4: required when transitioning to WAIVED.
 */
export const requiresWaiverNote = (toStatus: ObligationStatus): boolean =>
  toStatus === 'WAIVED';

/**
 * Returns true if the SATISFIED transition evidence guard is met.
 * Per T04 §4: evidenceAttachmentIds ≥ 1 OR notes populated.
 */
export const requiresEvidenceForSatisfied = (
  evidenceAttachmentIds: readonly string[],
  notes: string | null,
): boolean =>
  evidenceAttachmentIds.length > 0 || (notes !== null && notes !== '');

// -- Overdue Logic (T04 §6) --------------------------------------------------

/**
 * Returns true if the obligation is overdue per T04 §6.
 * Overdue when dueDate is past and status is not terminal.
 */
export const isObligationOverdue = (
  dueDate: string | null,
  status: ObligationStatus,
  now: Date = new Date(),
): boolean => {
  if (dueDate === null) return false;
  if (TERMINAL_OBLIGATION_STATUSES.includes(status)) return false;
  return now > new Date(dueDate);
};

// -- Monitoring (T04 §6.2) ---------------------------------------------------

/**
 * Returns the monitoring lead days for the given priority per T04 §6.2.
 */
export const getMonitoringLeadDays = (priority: MonitoringPriority): number => {
  const entry = MONITORING_PRIORITY_LEAD_DAYS.find((p) => p.priority === priority);
  return entry?.leadDays ?? 14;
};

/**
 * Returns true if the category should auto-flag for monitoring per T04 §5.
 * LIQUIDATED_DAMAGES auto-flags.
 */
export const shouldAutoFlagForMonitoring = (category: ObligationCategory): boolean =>
  category === 'LIQUIDATED_DAMAGES';

// -- Certification Eligibility (T04 §7) --------------------------------------

/** Minimal obligation shape for certification check. */
interface CertObligation {
  readonly obligationStatus: ObligationStatus;
  readonly flagForMonitoring: boolean;
  readonly notes: string | null;
  readonly dueDate: string | null;
  readonly category: ObligationCategory | null;
}

/**
 * Returns true if CONTRACT_OBLIGATIONS certification may be submitted per T04 §7.
 * Requirements:
 * 1. totalObligationCount ≥ 1
 * 2. All flagged obligations have notes documenting review position
 * 3. All obligations with dueDate within 30 days are addressed (not OPEN without notes+flag)
 * 4. All LIQUIDATED_DAMAGES obligations have dueDate populated
 * 5. All INSURANCE_REQUIREMENTS obligations have dueDate populated
 */
export const canSubmitContractObligationsCertification = (
  obligations: ReadonlyArray<CertObligation>,
  now: Date = new Date(),
): boolean => {
  // Rule 1: at least one obligation
  if (obligations.length === 0) return false;

  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  for (const obl of obligations) {
    // Rule 2: flagged obligations must have notes
    if (obl.flagForMonitoring && !TERMINAL_OBLIGATION_STATUSES.includes(obl.obligationStatus)) {
      if (!obl.notes) return false;
    }

    // Rule 3: near-due obligations must be addressed
    if (obl.dueDate && !TERMINAL_OBLIGATION_STATUSES.includes(obl.obligationStatus)) {
      const dueDate = new Date(obl.dueDate);
      if (dueDate <= thirtyDaysFromNow && obl.obligationStatus === 'OPEN') {
        if (!obl.notes || !obl.flagForMonitoring) return false;
      }
    }

    // Rule 4: LIQUIDATED_DAMAGES must have dueDate
    if (obl.category === 'LIQUIDATED_DAMAGES' && !obl.dueDate) return false;

    // Rule 5: INSURANCE_REQUIREMENTS must have dueDate
    if (obl.category === 'INSURANCE_REQUIREMENTS' && !obl.dueDate) return false;
  }

  return true;
};

// -- Obligation Counts --------------------------------------------------------

/** Computed obligation counts for the register header. */
export interface ObligationCounts {
  readonly totalObligationCount: number;
  readonly openObligationCount: number;
  readonly inProgressObligationCount: number;
  readonly flaggedObligationCount: number;
  readonly overdueObligationCount: number;
}

/**
 * Computes obligation counts from a list of obligations per T04 §2.
 */
export const computeObligationCounts = (
  obligations: ReadonlyArray<{
    obligationStatus: ObligationStatus;
    flagForMonitoring: boolean;
    dueDate: string | null;
  }>,
  now: Date = new Date(),
): ObligationCounts => ({
  totalObligationCount: obligations.length,
  openObligationCount: obligations.filter((o) => o.obligationStatus === 'OPEN').length,
  inProgressObligationCount: obligations.filter((o) => o.obligationStatus === 'IN_PROGRESS').length,
  flaggedObligationCount: obligations.filter(
    (o) => o.flagForMonitoring && !TERMINAL_OBLIGATION_STATUSES.includes(o.obligationStatus),
  ).length,
  overdueObligationCount: obligations.filter(
    (o) => o.dueDate !== null && !TERMINAL_OBLIGATION_STATUSES.includes(o.obligationStatus) && now > new Date(o.dueDate),
  ).length,
});

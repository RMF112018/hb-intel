/**
 * P3-E11-T10 Stage 3 Project Startup Safety Readiness business rules.
 * Remediation lifecycle, escalation, certification eligibility, non-interference.
 */

import type {
  EscalationLevel,
  RemediationStatus,
  SafetyReadinessResult,
} from './enums.js';
import { REMEDIATION_STATE_TRANSITIONS } from './constants.js';

// -- Remediation State Machine (T07 §5.0) ------------------------------------

/**
 * Returns true if the remediation status transition from→to is valid per T07 §5.0.
 */
export const isValidRemediationTransition = (
  from: RemediationStatus,
  to: RemediationStatus,
): boolean =>
  REMEDIATION_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- Auto-Creation (T07 §5.1) ------------------------------------------------

/**
 * Returns true if a SafetyRemediationRecord stub should be auto-created.
 * Per T07 §5.1: auto-create when result = Fail.
 */
export const shouldAutoCreateRemediation = (
  result: SafetyReadinessResult | null,
): boolean =>
  result === 'Fail';

// -- Remediation Documentation Check (T07 §7) --------------------------------

/** Minimal remediation shape for documentation check. */
interface RemediationDocCheck {
  readonly remediationNote: string | null;
  readonly assignedPersonName: string | null;
  readonly dueDate: string | null;
}

/**
 * Returns true if a remediation is fully documented per T07 §7:
 * remediationNote, assignedPersonName, and dueDate all populated.
 */
export const isRemediationDocumented = (
  remediation: RemediationDocCheck,
): boolean =>
  remediation.remediationNote !== null && remediation.remediationNote !== '' &&
  remediation.assignedPersonName !== null && remediation.assignedPersonName !== '' &&
  remediation.dueDate !== null && remediation.dueDate !== '';

// -- Certification Eligibility (T07 §7) --------------------------------------

/** Minimal item shape for certification eligibility check. */
interface CertEligibilityItem {
  readonly itemId: string;
  readonly result: SafetyReadinessResult | null;
}

/** Minimal remediation shape for certification eligibility check. */
interface CertEligibilityRemediation {
  readonly itemId: string;
  readonly remediationNote: string | null;
  readonly assignedPersonName: string | null;
  readonly dueDate: string | null;
  readonly escalationLevel: EscalationLevel;
  readonly programBlockerRef: string | null;
  readonly remediationStatus: RemediationStatus;
}

/**
 * Returns true if SAFETY_READINESS certification may be submitted per T07 §7.
 * Requirements:
 * 1. All 32 items assessed (no null results)
 * 2. All Fail items have remediation with remediationNote populated
 * 3. All Fail items have remediation with assignedPersonName populated
 * 4. All Fail items have remediation with dueDate populated
 * 5. No PX-escalated or blocker-active remediations without waiver
 */
export const canSubmitSafetyReadinessCertification = (
  items: ReadonlyArray<CertEligibilityItem>,
  remediations: ReadonlyArray<CertEligibilityRemediation>,
): boolean => {
  // Rule 1: all items assessed
  if (items.some((item) => item.result === null)) return false;

  // Rules 2-4: all Fail items documented
  const failItems = items.filter((item) => item.result === 'Fail');
  for (const failItem of failItems) {
    const rem = remediations.find((r) => r.itemId === failItem.itemId);
    if (!rem) return false;
    if (!rem.remediationNote) return false;
    if (!rem.assignedPersonName) return false;
    if (!rem.dueDate) return false;
  }

  // Rule 5: no PX-escalated or blocker-active without waiver
  const pxBlockedRemediations = remediations.filter(
    (r) => r.remediationStatus !== 'RESOLVED' && (r.escalationLevel === 'PX' || r.programBlockerRef !== null),
  );
  if (pxBlockedRemediations.length > 0) return false;

  return true;
};

// -- Escalation Level (T07 §5.2) ---------------------------------------------

/** Minimal remediation shape for escalation check. */
interface EscalationCheckRemediation {
  readonly remediationStatus: RemediationStatus;
  readonly assignedPersonName: string | null;
  readonly dueDate: string | null;
  readonly createdAt: string;
}

/**
 * Returns the applicable escalation level for a remediation per T07 §5.2.
 * Checks thresholds in order of severity (PX first, then PM, then NONE).
 */
export const getEscalationLevel = (
  remediation: EscalationCheckRemediation,
  now: Date = new Date(),
): EscalationLevel => {
  // Only applies to PENDING or IN_PROGRESS
  if (remediation.remediationStatus === 'RESOLVED') return 'NONE';

  // PX threshold: overdue by 3+ days
  if (remediation.dueDate) {
    const dueDate = new Date(remediation.dueDate);
    const threeDaysAfterDue = new Date(dueDate);
    threeDaysAfterDue.setDate(threeDaysAfterDue.getDate() + 3);
    if (now >= threeDaysAfterDue) return 'PX';
  }

  // PM threshold: overdue
  if (remediation.dueDate) {
    const dueDate = new Date(remediation.dueDate);
    if (now > dueDate) return 'PM';
  }

  // PM threshold: unassigned after 2 business days
  if (!remediation.assignedPersonName && remediation.remediationStatus === 'PENDING') {
    const createdDate = new Date(remediation.createdAt);
    const twoDaysAfterCreation = new Date(createdDate);
    twoDaysAfterCreation.setDate(twoDaysAfterCreation.getDate() + 2);
    if (now >= twoDaysAfterCreation) return 'PM';
  }

  return 'NONE';
};

// -- Program Blocker Creation (T07 §5.3) -------------------------------------

/**
 * Returns true if a ProgramBlocker should be created for this escalation level.
 * Per T07 §5.3: PX-level escalation generates a ProgramBlocker.
 */
export const shouldCreateProgramBlocker = (
  escalationLevel: EscalationLevel,
): boolean =>
  escalationLevel === 'PX';

// -- Safety Readiness Counts (T07 §3) ----------------------------------------

/** Computed safety readiness counts. */
export interface SafetyReadinessCounts {
  readonly passCount: number;
  readonly failCount: number;
  readonly naCount: number;
}

/**
 * Computes pass/fail/na counts from item results per T07 §3.
 * Null results are excluded from all counts.
 */
export const computeSafetyReadinessCounts = (
  results: ReadonlyArray<SafetyReadinessResult | null>,
): SafetyReadinessCounts => ({
  passCount: results.filter((r) => r === 'Pass').length,
  failCount: results.filter((r) => r === 'Fail').length,
  naCount: results.filter((r) => r === 'NA').length,
});

// -- Non-Interference (T07 §2.1) ---------------------------------------------

/**
 * Startup Safety Readiness never writes to the P3-E8 Safety module.
 * Always returns false. Per T07 §2.1 non-interference rule.
 */
export const canStartupSafetyWriteToSafetyModule = (): false => false;

/**
 * P3-E11-T10 Stage 7 Project Startup Execution Baseline (PM Plan) business rules.
 * Approval flow, critical fields, signatures, certification eligibility, assumptions.
 */

import type { AssumptionCategory, BaselineStatus } from './enums.js';
import type { IBaselineSectionField, ICriticalBaselineField, IPlanTeamSignature } from './types.js';
import { BASELINE_STATUS_TRANSITIONS, CRITICAL_BASELINE_FIELDS } from './constants.js';

// -- Approval Flow (T06 §2.1) ------------------------------------------------

/**
 * Returns true if the baseline status transition from→to is valid per T06 §2.1.
 */
export const isValidBaselineStatusTransition = (
  from: BaselineStatus,
  to: BaselineStatus,
): boolean =>
  BASELINE_STATUS_TRANSITIONS.some((t) => t.from === from && t.to === to);

/**
 * Returns true if the PM Plan can be submitted (Draft → Submitted).
 */
export const canSubmitPMPlan = (status: BaselineStatus): boolean =>
  status === 'Draft';

/**
 * Returns true if the PM Plan can be approved (Submitted → Approved).
 */
export const canApprovePMPlan = (status: BaselineStatus): boolean =>
  status === 'Submitted';

/**
 * Returns true if the PM Plan can be edited.
 * Per T06 §2.1: editable in Draft; Submitted requires revert to Draft.
 */
export const canEditPMPlan = (status: BaselineStatus): boolean =>
  status === 'Draft';

// -- Critical Fields (T06 §2.3) ----------------------------------------------

/**
 * Returns true if all 7 critical baseline fields have non-null, non-empty values.
 * Per T06 §2.3: required for EXECUTION_BASELINE certification.
 */
export const areCriticalFieldsPopulated = (
  fields: ReadonlyArray<Pick<IBaselineSectionField, 'fieldKey' | 'value'>>,
): boolean => {
  for (const critField of CRITICAL_BASELINE_FIELDS) {
    const field = fields.find((f) => f.fieldKey === critField.fieldKey);
    if (!field || field.value === null || field.value === '') return false;
  }
  return true;
};

// -- Signatures (T06 §2.2, T02 §3.8) ----------------------------------------

/**
 * Returns true if both PM and PX signatures have signedAt populated.
 * Per T02 §3.8: both PM and PX signatures required for EXECUTION_BASELINE certification.
 */
export const hasRequiredSignatures = (
  signatures: ReadonlyArray<Pick<IPlanTeamSignature, 'role' | 'signedAt'>>,
): boolean => {
  const pmSigned = signatures.some((s) => s.role === 'PM' && s.signedAt !== null);
  const pxSigned = signatures.some((s) => s.role === 'PX' && s.signedAt !== null);
  return pmSigned && pxSigned;
};

// -- Certification Eligibility (T06 §2.3, T02 §3.7) --------------------------

/**
 * Returns true if EXECUTION_BASELINE certification may be submitted per T06 §2.3.
 * Requirements:
 * 1. status = Approved
 * 2. All 7 critical fields populated
 * 3. PM + PX signatures present with signedAt
 */
export const canSubmitExecutionBaselineCertification = (
  status: BaselineStatus,
  fields: ReadonlyArray<Pick<IBaselineSectionField, 'fieldKey' | 'value'>>,
  signatures: ReadonlyArray<Pick<IPlanTeamSignature, 'role' | 'signedAt'>>,
): boolean =>
  status === 'Approved' &&
  areCriticalFieldsPopulated(fields) &&
  hasRequiredSignatures(signatures);

// -- Assumption Validation (T06 §7, T10 §5 Criterion 21) ---------------------

/** Minimal assumption shape for validation. */
interface AssumptionValidation {
  readonly category: AssumptionCategory | null;
  readonly description: string | null;
  readonly isSuccessCriterion: boolean | null;
  readonly successMeasure: string | null;
}

/**
 * Returns true if the assumption has all required fields populated per T06 §7.
 * Required: category, description, isSuccessCriterion.
 * When isSuccessCriterion = true, successMeasure is also required.
 */
export const isAssumptionValid = (assumption: AssumptionValidation): boolean => {
  if (!assumption.category) return false;
  if (!assumption.description) return false;
  if (assumption.isSuccessCriterion === null) return false;
  if (assumption.isSuccessCriterion && (!assumption.successMeasure || assumption.successMeasure === '')) {
    return false;
  }
  return true;
};

// -- Section Completeness (T06 §3) -------------------------------------------

/**
 * Computes the count of sections with isComplete = true out of 11.
 */
export const computeBaselineSectionCompleteness = (
  sections: ReadonlyArray<{ isComplete: boolean }>,
): number =>
  sections.filter((s) => s.isComplete).length;

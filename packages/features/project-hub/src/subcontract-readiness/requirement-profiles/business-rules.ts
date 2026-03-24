/**
 * P3-E13-T08 Stage 3 Subcontract Execution Readiness Module requirement-profiles business rules.
 * Dual-state validation, PM override doctrine, SDI outcomes, profile binding, renewal.
 */

import type {
  ArtifactState,
  BlockingSeverity,
  ComplianceEvaluationState,
  ProfileInputDimension,
  RenewalStatus,
  SDIPrequalificationOutcome,
} from './enums.js';
import {
  PROFILE_INPUT_DIMENSIONS,
  SDI_BLOCKING_OUTCOMES,
  SDI_SATISFIED_OUTCOMES,
} from './constants.js';

// -- Dual-State Consistency (T03 §5.2) ----------------------------------------

/**
 * Returns true if the artifact/evaluation state combination is valid per T03 §5.2.
 * Artifact state and evaluation state are independent by design.
 * The only invalid combinations are logical impossibilities.
 */
export const isDualStateConsistent = (
  artifactState: ArtifactState,
  evaluationState: ComplianceEvaluationState,
): boolean => {
  // Cannot have a specialist ruling if evaluation hasn't started,
  // unless the item is ruled not required by rule
  if (evaluationState === 'NOT_STARTED') {
    // Evaluation not started is valid with any artifact state
    return true;
  }

  // All other combinations are valid per T03 §5.2 —
  // artifact and evaluation state are intentionally independent
  return true;
};

// -- PM Override Doctrine (T03 §6) --------------------------------------------

/**
 * PM / APM / PA may NOT suppress requirements per T03 §6.
 * Always returns false. PM may request applicability review but not suppress.
 */
export const canPMSuppressRequirement = (): false => false;

/**
 * Returns true if the role is a specialist authorized to declare NOT_REQUIRED_BY_RULE per T03 §6.
 * Only Compliance / Risk specialists may issue this ruling.
 */
export const canSpecialistDeclareNotRequired = (
  role: string,
): boolean =>
  role === 'COMPLIANCE_RISK' || role.startsWith('Compliance') || role.startsWith('Risk');

// -- Blocking Severity (T03 §3.1) --------------------------------------------

/**
 * Returns true if the blocking severity blocks case readiness per T03 §3.1.
 */
export const isItemBlocking = (
  severity: BlockingSeverity,
): boolean =>
  severity === 'BLOCKER';

/**
 * Returns true if the blocking severity conditionally affects readiness per T03 §3.1.
 */
export const isItemConditional = (
  severity: BlockingSeverity,
): boolean =>
  severity === 'CONDITIONAL';

// -- Renewal Logic (T03 §3.1) ------------------------------------------------

/**
 * Returns true if a renewable item's expiration date has passed per T03.
 */
export const isRenewalDue = (
  expiresAt: string | null,
  now: Date = new Date(),
): boolean => {
  if (expiresAt === null) return false;
  const expDate = new Date(expiresAt);
  return now >= expDate;
};

/**
 * Returns true if the renewal status indicates the item needs attention.
 */
export const isRenewalActionRequired = (
  renewalStatus: RenewalStatus,
): boolean =>
  renewalStatus === 'DUE';

// -- SDI Prequalification Outcomes (T03 §7.1) ---------------------------------

/**
 * Returns true if the SDI outcome blocks readiness per T03 §7.1.
 */
export const isSDIOutcomeBlocking = (
  outcome: SDIPrequalificationOutcome,
): boolean =>
  (SDI_BLOCKING_OUTCOMES as readonly string[]).includes(outcome);

/**
 * Returns true if the SDI outcome satisfies readiness per T03 §7.1.
 */
export const isSDIOutcomeSatisfied = (
  outcome: SDIPrequalificationOutcome,
): boolean =>
  (SDI_SATISFIED_OUTCOMES as readonly string[]).includes(outcome);

// -- Profile Binding Validation (T03 §1.2) ------------------------------------

/**
 * Returns true if all 9 minimum profile input dimensions are provided per T03 §1.2.
 */
export const isProfileBindingComplete = (
  inputs: readonly ProfileInputDimension[],
): boolean => {
  const inputSet = new Set(inputs);
  return PROFILE_INPUT_DIMENSIONS.every((dim) => inputSet.has(dim));
};

/**
 * Returns the missing profile input dimensions per T03 §1.2.
 */
export const getMissingProfileInputs = (
  inputs: readonly ProfileInputDimension[],
): readonly ProfileInputDimension[] => {
  const inputSet = new Set(inputs);
  return PROFILE_INPUT_DIMENSIONS.filter((dim) => !inputSet.has(dim));
};

// -- Evaluation State Helpers -------------------------------------------------

/**
 * Returns true if the evaluation state indicates a blocking condition.
 */
export const isEvaluationBlocking = (
  state: ComplianceEvaluationState,
): boolean =>
  state === 'DEFICIENT' || state === 'EXCEPTION_REQUIRED' || state === 'REJECTED';

/**
 * Returns true if the evaluation state indicates the requirement is satisfied.
 */
export const isEvaluationSatisfied = (
  state: ComplianceEvaluationState,
): boolean =>
  state === 'SATISFIED' || state === 'SATISFIED_WITH_CONDITIONS' || state === 'NOT_REQUIRED_BY_RULE';

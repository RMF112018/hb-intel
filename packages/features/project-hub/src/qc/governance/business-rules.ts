/**
 * P3-E15-T10 Stage 2 Project QC Module governance business rules.
 */

import type { GovernedStandardState, QcKeyActor } from '../foundation/enums.js';
import type {
  BasisConflictOutcome,
  CandidateSubmissionState,
  ExtensionValidationResult,
  ProjectDecisionLatitude,
  QcGovernanceWriteAction,
} from './enums.js';
import {
  QC_CANDIDATE_VALID_TRANSITIONS,
  QC_GOVERNANCE_AUTHORITY_MATRIX,
  QC_GOVERNANCE_CONCERN_LATITUDES,
  QC_GOVERNED_CONTENT_VERSION_FIELDS,
} from './constants.js';

// -- T02 §4 — Governance authority matrix lookup ------------------------------

/** Returns true if the given role is permitted to perform the given governance action per T02 §4. */
export const canGovernanceRolePerformAction = (
  role: QcKeyActor,
  action: QcGovernanceWriteAction,
): boolean => {
  const entry = QC_GOVERNANCE_AUTHORITY_MATRIX.find((e) => e.action === action);
  if (!entry) return false;
  return (entry.allowedRoles as readonly string[]).includes(role);
};

// -- T02 §1 — Governed standard immutability ----------------------------------

/** Returns true if a governed standard is immutable (published, superseded, or retired) per T02 §1. */
export const isGovernedStandardImmutableOncePublished = (
  state: GovernedStandardState,
): boolean =>
  state === 'PUBLISHED' || state === 'SUPERSEDED' || state === 'RETIRED';

// -- T02 §2.1 — Extension validation -----------------------------------------

/** Returns true only if the extension validation result is VALID per T02 §2.1. */
export const isProjectExtensionValid = (
  result: ExtensionValidationResult,
): boolean => result === 'VALID';

/** Validates a project extension against T02 §2.1 rules. */
export const validateProjectExtension = (
  hasParent: boolean,
  weakensMinimum: boolean,
  hasProvenance: boolean,
  hasApproval: boolean,
): ExtensionValidationResult => {
  if (!hasParent) return 'MISSING_PARENT_CATEGORY';
  if (weakensMinimum) return 'WEAKENS_GOVERNED_MINIMUM';
  if (!hasProvenance) return 'MISSING_PROVENANCE';
  if (!hasApproval) return 'MISSING_APPROVAL';
  return 'VALID';
};

// -- T02 §3.1 — Promotion requires both reviewers ----------------------------

/** Promotion always requires both governance owner and discipline reviewer per T02 §3.1. */
export const isPromotionRequiresBothReviewers = (): true => true;

// -- T02 §3.2 — Resubmission -------------------------------------------------

/** Returns true if the candidate can be resubmitted per T02 §3.2. */
export const canCandidateBeResubmitted = (
  state: CandidateSubmissionState,
): boolean => state === 'RETURNED_FOR_REVISION';

// -- T02 §3 — Valid candidate state transition --------------------------------

/** Returns true if the transition from one candidate state to another is valid per T02 §3. */
export const isValidCandidateTransition = (
  from: CandidateSubmissionState,
  to: CandidateSubmissionState,
): boolean =>
  QC_CANDIDATE_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- T02 §6.3 — Adoption ownership -------------------------------------------

/** Adoption decisions are always PM-owned per T02 §6.3. */
export const isAdoptionDecisionPmOwned = (): true => true;

/** Returns true if the role can adopt an update notice per T02 §6.3. */
export const canAdoptUpdateNotice = (role: QcKeyActor): boolean =>
  role === 'PM_PE_PA';

// -- T02 §7.1 — Official source rules ----------------------------------------

/** Official source is the only acceptable basis per T02 §7.1. */
export const isOfficialSourceOnly = (): true => true;

/** Basis may never be silently replaced per T02 §7.1. */
export const canSilentlyReplaceBasis = (): false => false;

// -- T02 §7.2 — Conflict resolution ------------------------------------------

/** Returns true if the basis conflict has been resolved (outcome is non-null) per T02 §7.2. */
export const isBasisConflictResolved = (
  outcome: BasisConflictOutcome | null,
): boolean => outcome !== null;

// -- T02 §5.3 — Governed content versioning -----------------------------------

/** Returns true if the field is a governed content version field per T02 §5.3. */
export const isGovernedContentVersioned = (field: string): boolean =>
  (QC_GOVERNED_CONTENT_VERSION_FIELDS as readonly string[]).includes(field);

// -- T02 §8 — Override guards ------------------------------------------------

/** Projects may never override rollup formula semantics per T02 §8. */
export const canProjectOverrideRollupSemantics = (): false => false;

/** Projects may never override official-source currentness policy per T02 §8. */
export const canProjectOverrideCurrentnessPolicy = (): false => false;

// -- T02 §8 — Latitude lookup ------------------------------------------------

/** Returns the project decision latitude for a concern, or null if not found, per T02 §8. */
export const getProjectDecisionLatitude = (
  concern: string,
): ProjectDecisionLatitude | null => {
  const entry = QC_GOVERNANCE_CONCERN_LATITUDES.find((e) => e.concern === concern);
  return entry?.projectLatitude ?? null;
};

/**
 * P3-E15-T10 Stage 2 Project QC Module governance enumerations.
 */

// -- Governance Write Action (T02 §4) -----------------------------------------

/** QC governance write actions per T02 §4. */
export type QcGovernanceWriteAction =
  | 'AUTHOR_PROJECT_RECORDS'
  | 'AUTHOR_CANDIDATE_GOVERNED'
  | 'PUBLISH_GOVERNED_CORE'
  | 'REVIEW_HIGH_RISK'
  | 'VERIFY_COMPLETION'
  | 'CLOSE_VERIFIED_OBLIGATION'
  | 'APPROVE_DEVIATION'
  | 'DESIGNATE_VERIFIER'
  | 'PUBLISH_UPDATE_NOTICE'
  | 'SUBMIT_CANDIDATE_FOR_PROMOTION'
  | 'ADOPT_UPDATE_NOTICE'
  | 'RETAIN_PROJECT_BASIS'
  | 'APPROVE_ADOPTION_EXCEPTION'
  | 'CREATE_PROJECT_EXTENSION'
  | 'RETIRE_PROJECT_EXTENSION';

// -- Governed Standard Category (T02 §1) --------------------------------------

/** Governed standard categories per T02 §1. */
export type GovernedStandardCategory =
  | 'QUALITY_STANDARD'
  | 'BEST_PRACTICE_PACKET'
  | 'TAXONOMY_ENTRY'
  | 'PLAN_SET_TEMPLATE'
  | 'DOCUMENT_FAMILY_RULE'
  | 'MAPPING_ENGINE_RULE'
  | 'EVIDENCE_MINIMUM_RULE'
  | 'SLA_AGING_RULE'
  | 'ROOT_CAUSE_CATEGORY'
  | 'SCORECARD_FORMULA'
  | 'ROLLUP_RULE'
  | 'CURRENTNESS_RULE';

// -- Candidate Content Type (T02 §1.2) ----------------------------------------

/** Candidate content types per T02 §1.2. */
export type CandidateContentType =
  | 'CANDIDATE_STANDARD'
  | 'CANDIDATE_TAXONOMY_ADDITION'
  | 'CANDIDATE_PLAN_SET_CHANGE'
  | 'CANDIDATE_DOCUMENT_FAMILY_REQUIREMENT'
  | 'CANDIDATE_EVIDENCE_MINIMUM'
  | 'CANDIDATE_SCORECARD_REFINEMENT'
  | 'CANDIDATE_MAPPING_RULE'
  | 'CANDIDATE_ROOT_CAUSE_REFINEMENT';

// -- Extension Validation Result (T02 §2.1) -----------------------------------

/** Extension validation results per T02 §2.1. */
export type ExtensionValidationResult =
  | 'VALID'
  | 'MISSING_PARENT_CATEGORY'
  | 'WEAKENS_GOVERNED_MINIMUM'
  | 'MISSING_PROVENANCE'
  | 'MISSING_APPROVAL';

// -- Governed Content Version Field (T02 §5.3) --------------------------------

/** Governed content version fields per T02 §5.3. */
export type GovernedContentVersionField =
  | 'STANDARDS_LIBRARY'
  | 'TAXONOMY_FLOOR'
  | 'MANDATORY_PLAN_SETS'
  | 'DOCUMENT_FAMILY_REQUIREMENTS'
  | 'MAPPING_ENGINE_LOGIC'
  | 'EVIDENCE_MINIMUM_RULES'
  | 'SLA_AGING_MATRICES'
  | 'ROOT_CAUSE_SCHEMA'
  | 'SCORECARD_LOGIC'
  | 'RESPONSIBLE_ORG_ROLLUP_LOGIC'
  | 'OFFICIAL_SOURCE_CURRENTNESS_RULES';

// -- Update Notice Requirement (T02 §6) ---------------------------------------

/** Update notice requirement levels per T02 §6. */
export type UpdateNoticeRequirement =
  | 'MANDATORY'
  | 'ADVISORY';

// -- Adoption Decision Owner (T02 §6.3) ---------------------------------------

/** Adoption decision owners per T02 §6.3. */
export type AdoptionDecisionOwner =
  | 'PM_PE_PA'
  | 'QC_MANAGER_ADVISORY';

// -- Basis Conflict Outcome (T02 §7) ------------------------------------------

/** Basis conflict outcomes per T02 §7. */
export type BasisConflictOutcome =
  | 'ADOPT_NEW_BASIS'
  | 'RETAIN_APPROVED_BASIS'
  | 'APPROVED_EXCEPTION'
  | 'MANUAL_REVIEW_REQUIRED';

// -- Project Decision Latitude (T02 §8) ---------------------------------------

/** Project decision latitude levels per T02 §8. */
export type ProjectDecisionLatitude =
  | 'CONTROLLED_EXTENSION'
  | 'ADDITIVE_ONLY'
  | 'TIGHTEN_ONLY'
  | 'ADJUST_WITHIN_BOUNDS'
  | 'CLASSIFY_WITHIN_MODEL'
  | 'LIMITED_SELECTION'
  | 'NO_LOCAL_OVERRIDE';

// -- Candidate Submission State (T02 §3) --------------------------------------

/** Candidate submission states per T02 §3. */
export type CandidateSubmissionState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'RETURNED_FOR_REVISION';

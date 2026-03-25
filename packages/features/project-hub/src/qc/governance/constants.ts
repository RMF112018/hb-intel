/**
 * P3-E15-T10 Stage 2 Project QC Module governance constants.
 */

import type {
  AdoptionDecisionOwner,
  BasisConflictOutcome,
  CandidateContentType,
  CandidateSubmissionState,
  ExtensionValidationResult,
  GovernedContentVersionField,
  GovernedStandardCategory,
  ProjectDecisionLatitude,
  QcGovernanceWriteAction,
  UpdateNoticeRequirement,
} from './enums.js';
import type {
  IGovernanceConcernLatitude,
  IQcGovernanceAuthorityEntry,
} from './types.js';

// -- Enum Arrays ---------------------------------------------------------------

export const QC_GOVERNANCE_WRITE_ACTIONS = [
  'AUTHOR_PROJECT_RECORDS',
  'AUTHOR_CANDIDATE_GOVERNED',
  'PUBLISH_GOVERNED_CORE',
  'REVIEW_HIGH_RISK',
  'VERIFY_COMPLETION',
  'CLOSE_VERIFIED_OBLIGATION',
  'APPROVE_DEVIATION',
  'DESIGNATE_VERIFIER',
  'PUBLISH_UPDATE_NOTICE',
  'SUBMIT_CANDIDATE_FOR_PROMOTION',
  'ADOPT_UPDATE_NOTICE',
  'RETAIN_PROJECT_BASIS',
  'APPROVE_ADOPTION_EXCEPTION',
  'CREATE_PROJECT_EXTENSION',
  'RETIRE_PROJECT_EXTENSION',
] as const satisfies ReadonlyArray<QcGovernanceWriteAction>;

export const QC_GOVERNED_STANDARD_CATEGORIES = [
  'QUALITY_STANDARD',
  'BEST_PRACTICE_PACKET',
  'TAXONOMY_ENTRY',
  'PLAN_SET_TEMPLATE',
  'DOCUMENT_FAMILY_RULE',
  'MAPPING_ENGINE_RULE',
  'EVIDENCE_MINIMUM_RULE',
  'SLA_AGING_RULE',
  'ROOT_CAUSE_CATEGORY',
  'SCORECARD_FORMULA',
  'ROLLUP_RULE',
  'CURRENTNESS_RULE',
] as const satisfies ReadonlyArray<GovernedStandardCategory>;

export const QC_CANDIDATE_CONTENT_TYPES = [
  'CANDIDATE_STANDARD',
  'CANDIDATE_TAXONOMY_ADDITION',
  'CANDIDATE_PLAN_SET_CHANGE',
  'CANDIDATE_DOCUMENT_FAMILY_REQUIREMENT',
  'CANDIDATE_EVIDENCE_MINIMUM',
  'CANDIDATE_SCORECARD_REFINEMENT',
  'CANDIDATE_MAPPING_RULE',
  'CANDIDATE_ROOT_CAUSE_REFINEMENT',
] as const satisfies ReadonlyArray<CandidateContentType>;

export const QC_EXTENSION_VALIDATION_RESULTS = [
  'VALID',
  'MISSING_PARENT_CATEGORY',
  'WEAKENS_GOVERNED_MINIMUM',
  'MISSING_PROVENANCE',
  'MISSING_APPROVAL',
] as const satisfies ReadonlyArray<ExtensionValidationResult>;

export const QC_GOVERNED_CONTENT_VERSION_FIELDS = [
  'STANDARDS_LIBRARY',
  'TAXONOMY_FLOOR',
  'MANDATORY_PLAN_SETS',
  'DOCUMENT_FAMILY_REQUIREMENTS',
  'MAPPING_ENGINE_LOGIC',
  'EVIDENCE_MINIMUM_RULES',
  'SLA_AGING_MATRICES',
  'ROOT_CAUSE_SCHEMA',
  'SCORECARD_LOGIC',
  'RESPONSIBLE_ORG_ROLLUP_LOGIC',
  'OFFICIAL_SOURCE_CURRENTNESS_RULES',
] as const satisfies ReadonlyArray<GovernedContentVersionField>;

export const QC_UPDATE_NOTICE_REQUIREMENTS = [
  'MANDATORY',
  'ADVISORY',
] as const satisfies ReadonlyArray<UpdateNoticeRequirement>;

export const QC_ADOPTION_DECISION_OWNERS = [
  'PM_PE_PA',
  'QC_MANAGER_ADVISORY',
] as const satisfies ReadonlyArray<AdoptionDecisionOwner>;

export const QC_BASIS_CONFLICT_OUTCOMES = [
  'ADOPT_NEW_BASIS',
  'RETAIN_APPROVED_BASIS',
  'APPROVED_EXCEPTION',
  'MANUAL_REVIEW_REQUIRED',
] as const satisfies ReadonlyArray<BasisConflictOutcome>;

export const QC_PROJECT_DECISION_LATITUDES = [
  'CONTROLLED_EXTENSION',
  'ADDITIVE_ONLY',
  'TIGHTEN_ONLY',
  'ADJUST_WITHIN_BOUNDS',
  'CLASSIFY_WITHIN_MODEL',
  'LIMITED_SELECTION',
  'NO_LOCAL_OVERRIDE',
] as const satisfies ReadonlyArray<ProjectDecisionLatitude>;

export const QC_CANDIDATE_SUBMISSION_STATES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'RETURNED_FOR_REVISION',
] as const satisfies ReadonlyArray<CandidateSubmissionState>;

// -- Label Maps ----------------------------------------------------------------

export const QC_GOVERNANCE_WRITE_ACTION_LABELS: Readonly<Record<QcGovernanceWriteAction, string>> = {
  AUTHOR_PROJECT_RECORDS: 'Author project records',
  AUTHOR_CANDIDATE_GOVERNED: 'Author candidate governed content',
  PUBLISH_GOVERNED_CORE: 'Publish governed core',
  REVIEW_HIGH_RISK: 'Review high-risk',
  VERIFY_COMPLETION: 'Verify completion',
  CLOSE_VERIFIED_OBLIGATION: 'Close verified obligation',
  APPROVE_DEVIATION: 'Approve deviation',
  DESIGNATE_VERIFIER: 'Designate verifier',
  PUBLISH_UPDATE_NOTICE: 'Publish update notice',
  SUBMIT_CANDIDATE_FOR_PROMOTION: 'Submit candidate for promotion',
  ADOPT_UPDATE_NOTICE: 'Adopt update notice',
  RETAIN_PROJECT_BASIS: 'Retain project basis',
  APPROVE_ADOPTION_EXCEPTION: 'Approve adoption exception',
  CREATE_PROJECT_EXTENSION: 'Create project extension',
  RETIRE_PROJECT_EXTENSION: 'Retire project extension',
};

export const QC_GOVERNED_STANDARD_CATEGORY_LABELS: Readonly<Record<GovernedStandardCategory, string>> = {
  QUALITY_STANDARD: 'Quality standard',
  BEST_PRACTICE_PACKET: 'Best practice packet',
  TAXONOMY_ENTRY: 'Taxonomy entry',
  PLAN_SET_TEMPLATE: 'Plan set template',
  DOCUMENT_FAMILY_RULE: 'Document family rule',
  MAPPING_ENGINE_RULE: 'Mapping engine rule',
  EVIDENCE_MINIMUM_RULE: 'Evidence minimum rule',
  SLA_AGING_RULE: 'SLA aging rule',
  ROOT_CAUSE_CATEGORY: 'Root cause category',
  SCORECARD_FORMULA: 'Scorecard formula',
  ROLLUP_RULE: 'Rollup rule',
  CURRENTNESS_RULE: 'Currentness rule',
};

export const QC_BASIS_CONFLICT_OUTCOME_LABELS: Readonly<Record<BasisConflictOutcome, string>> = {
  ADOPT_NEW_BASIS: 'Adopt new basis',
  RETAIN_APPROVED_BASIS: 'Retain approved basis',
  APPROVED_EXCEPTION: 'Approved exception',
  MANUAL_REVIEW_REQUIRED: 'Manual review required',
};

export const QC_PROJECT_DECISION_LATITUDE_LABELS: Readonly<Record<ProjectDecisionLatitude, string>> = {
  CONTROLLED_EXTENSION: 'Controlled extension',
  ADDITIVE_ONLY: 'Additive only',
  TIGHTEN_ONLY: 'Tighten only',
  ADJUST_WITHIN_BOUNDS: 'Adjust within bounds',
  CLASSIFY_WITHIN_MODEL: 'Classify within model',
  LIMITED_SELECTION: 'Limited selection',
  NO_LOCAL_OVERRIDE: 'No local override',
};

// -- Governance Authority Matrix (T02 §4) -------------------------------------

export const QC_GOVERNANCE_AUTHORITY_MATRIX: ReadonlyArray<IQcGovernanceAuthorityEntry> = [
  {
    action: 'AUTHOR_PROJECT_RECORDS',
    allowedRoles: ['PM_PE_PA', 'SUPERINTENDENT', 'QC_MANAGER'],
    conditionalNotes: 'Superintendent limited to execution-readiness inputs and issue follow-up',
  },
  {
    action: 'AUTHOR_CANDIDATE_GOVERNED',
    allowedRoles: ['QC_MANAGER', 'MOE_ADMIN'],
    conditionalNotes: 'QC Manager candidate only; MOE/Admin publishes',
  },
  {
    action: 'PUBLISH_GOVERNED_CORE',
    allowedRoles: ['MOE_ADMIN'],
    conditionalNotes: 'MOE/Admin exclusive',
  },
  {
    action: 'REVIEW_HIGH_RISK',
    allowedRoles: ['PM_PE_PA', 'SUPERINTENDENT', 'QC_MANAGER', 'MOE_ADMIN', 'DISCIPLINE_REVIEWER'],
    conditionalNotes: 'PE/PM within project; field context; governance review',
  },
  {
    action: 'VERIFY_COMPLETION',
    allowedRoles: ['QC_MANAGER', 'AUTHORIZED_HB_VERIFIER'],
    conditionalNotes: 'QC Manager only if designated and eligible',
  },
  {
    action: 'CLOSE_VERIFIED_OBLIGATION',
    allowedRoles: ['QC_MANAGER', 'AUTHORIZED_HB_VERIFIER'],
    conditionalNotes: 'QC Manager only if acting as designated verifier',
  },
  {
    action: 'APPROVE_DEVIATION',
    allowedRoles: ['PM_PE_PA', 'MOE_ADMIN', 'DISCIPLINE_REVIEWER'],
    conditionalNotes: 'PE/designated per project policy; MOE for governed-core exceptions',
  },
  {
    action: 'DESIGNATE_VERIFIER',
    allowedRoles: ['PM_PE_PA', 'QC_MANAGER'],
    conditionalNotes: 'QC Manager concurrence required for high-risk packages',
  },
  {
    action: 'PUBLISH_UPDATE_NOTICE',
    allowedRoles: ['MOE_ADMIN'],
    conditionalNotes: 'MOE/Admin exclusive',
  },
  {
    action: 'SUBMIT_CANDIDATE_FOR_PROMOTION',
    allowedRoles: ['QC_MANAGER', 'PM_PE_PA'],
    conditionalNotes: 'May originate from extension or candidate submission',
  },
  {
    action: 'ADOPT_UPDATE_NOTICE',
    allowedRoles: ['PM_PE_PA'],
    conditionalNotes: 'PM/PE/PA owns adoption decisions per T02 §6.3',
  },
  {
    action: 'RETAIN_PROJECT_BASIS',
    allowedRoles: ['PM_PE_PA'],
    conditionalNotes: 'Records rationale and receives recheck obligations',
  },
  {
    action: 'APPROVE_ADOPTION_EXCEPTION',
    allowedRoles: ['PM_PE_PA'],
    conditionalNotes: 'Project records formal exception',
  },
  {
    action: 'CREATE_PROJECT_EXTENSION',
    allowedRoles: ['PM_PE_PA', 'QC_MANAGER'],
    conditionalNotes: 'Within governed taxonomy and promotion workflow',
  },
  {
    action: 'RETIRE_PROJECT_EXTENSION',
    allowedRoles: ['PM_PE_PA', 'MOE_ADMIN'],
    conditionalNotes: 'Project or MOE/Admin may retire',
  },
];

// -- Governance Concern Latitude Matrix (T02 §8) ------------------------------

export const QC_GOVERNANCE_CONCERN_LATITUDES: ReadonlyArray<IGovernanceConcernLatitude> = [
  {
    concern: 'Taxonomy',
    publisher: 'MOE/Admin',
    projectLatitude: 'CONTROLLED_EXTENSION',
    constraint: 'Controlled extension only',
  },
  {
    concern: 'Mandatory quality-plan set',
    publisher: 'MOE/Admin',
    projectLatitude: 'ADDITIVE_ONLY',
    constraint: 'Additive high-risk additions only',
  },
  {
    concern: 'Evidence minimums',
    publisher: 'MOE/Admin',
    projectLatitude: 'TIGHTEN_ONLY',
    constraint: 'May tighten; cannot weaken without deviation',
  },
  {
    concern: 'SLA / aging matrix',
    publisher: 'MOE/Admin',
    projectLatitude: 'ADJUST_WITHIN_BOUNDS',
    constraint: 'May adjust within governed bounds',
  },
  {
    concern: 'Root-cause model',
    publisher: 'MOE/Admin',
    projectLatitude: 'CLASSIFY_WITHIN_MODEL',
    constraint: 'Classify only within governed model',
  },
  {
    concern: 'Scorecard logic',
    publisher: 'MOE/Admin',
    projectLatitude: 'LIMITED_SELECTION',
    constraint: 'Drilldown selection and limited local thresholds where allowed',
  },
  {
    concern: 'Responsible-org rollup logic',
    publisher: 'MOE/Admin',
    projectLatitude: 'NO_LOCAL_OVERRIDE',
    constraint: 'No local override of formula semantics',
  },
  {
    concern: 'Official-source currentness rules',
    publisher: 'MOE/Admin',
    projectLatitude: 'NO_LOCAL_OVERRIDE',
    constraint: 'No local override of source policy',
  },
];

// -- Promotion Workflow Valid Transitions (T02 §3) ----------------------------

export const QC_CANDIDATE_VALID_TRANSITIONS: ReadonlyArray<{
  readonly from: CandidateSubmissionState;
  readonly to: CandidateSubmissionState;
}> = [
  { from: 'DRAFT', to: 'SUBMITTED' },
  { from: 'SUBMITTED', to: 'UNDER_REVIEW' },
  { from: 'UNDER_REVIEW', to: 'PUBLISHED' },
  { from: 'UNDER_REVIEW', to: 'REJECTED' },
  { from: 'UNDER_REVIEW', to: 'RETURNED_FOR_REVISION' },
  { from: 'RETURNED_FOR_REVISION', to: 'SUBMITTED' },
];

// -- Extension Validation Rule Descriptions (T02 §2.1) -----------------------

export const QC_EXTENSION_VALIDATION_RULE_DESCRIPTIONS: ReadonlyArray<{
  readonly ruleNumber: number;
  readonly condition: string;
}> = [
  { ruleNumber: 1, condition: 'the project need is real and bounded' },
  { ruleNumber: 2, condition: 'the extension attaches to a governed parent category' },
  { ruleNumber: 3, condition: 'the extension does not weaken governed minimums' },
  { ruleNumber: 4, condition: 'the extension carries provenance and approval metadata' },
  { ruleNumber: 5, condition: 'the extension is eligible for later promotion or retirement' },
];

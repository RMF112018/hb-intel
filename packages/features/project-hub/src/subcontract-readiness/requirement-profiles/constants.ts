/**
 * P3-E13-T08 Stage 3 Subcontract Execution Readiness Module requirement-profiles constants.
 * Governed profiles, dual-state model, SDI prequalification, typed metadata.
 */

import type {
  ArtifactState,
  BlockingSeverity,
  ComplianceEvaluationState,
  MetadataFieldType,
  ProfileInputDimension,
  RenewalStatus,
  SDIPrequalificationOutcome,
} from './enums.js';
import type {
  IDualStateExample,
  IProfileInputDimensionDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const ARTIFACT_STATES = [
  'NOT_PROVIDED', 'REQUESTED', 'RECEIVED_PENDING_REVIEW',
  'RECEIVED_ACCEPTED', 'RECEIVED_DEFICIENT', 'REPLACED',
  'EXTERNAL_REFERENCE_ONLY', 'NOT_REQUIRED_BY_RULE',
] as const satisfies ReadonlyArray<ArtifactState>;

export const COMPLIANCE_EVALUATION_STATES = [
  'NOT_STARTED', 'UNDER_REVIEW', 'SATISFIED',
  'SATISFIED_WITH_CONDITIONS', 'NOT_REQUIRED_BY_RULE',
  'DEFICIENT', 'EXCEPTION_REQUIRED', 'REJECTED',
] as const satisfies ReadonlyArray<ComplianceEvaluationState>;

export const SDI_PREQUALIFICATION_OUTCOMES = [
  'Qualified', 'NotRequiredByRule', 'AlternateRiskTreatmentApproved',
  'ExceptionRequired', 'Rejected',
] as const satisfies ReadonlyArray<SDIPrequalificationOutcome>;

export const BLOCKING_SEVERITIES = [
  'BLOCKER', 'CONDITIONAL', 'ADVISORY', 'NOT_REQUIRED',
] as const satisfies ReadonlyArray<BlockingSeverity>;

export const RENEWAL_STATUSES = [
  'NONE', 'ELIGIBLE', 'DUE', 'EXEMPTED', 'NOT_APPLICABLE',
] as const satisfies ReadonlyArray<RenewalStatus>;

export const METADATA_FIELD_TYPES = [
  'STRING', 'ENUM', 'DATE', 'NUMBER', 'BOOLEAN', 'REFERENCE',
] as const satisfies ReadonlyArray<MetadataFieldType>;

export const PROFILE_INPUT_DIMENSIONS = [
  'TRADE', 'SCOPE', 'LABOR_ON_SITE_POSTURE',
  'JURISDICTION', 'RISK_CLASS', 'POLICY_CONDITIONS',
  'INSURANCE_POSTURE', 'LICENSING_POSTURE', 'SDI_PREQUALIFICATION_POSTURE',
] as const satisfies ReadonlyArray<ProfileInputDimension>;

// -- Label Maps -----------------------------------------------------------------

export const ARTIFACT_STATE_LABELS: Readonly<Record<ArtifactState, string>> = {
  NOT_PROVIDED: 'Not Provided',
  REQUESTED: 'Requested',
  RECEIVED_PENDING_REVIEW: 'Received – Pending Review',
  RECEIVED_ACCEPTED: 'Received – Accepted',
  RECEIVED_DEFICIENT: 'Received – Deficient',
  REPLACED: 'Replaced',
  EXTERNAL_REFERENCE_ONLY: 'External Reference Only',
  NOT_REQUIRED_BY_RULE: 'Not Required by Rule',
};

export const COMPLIANCE_EVALUATION_STATE_LABELS: Readonly<Record<ComplianceEvaluationState, string>> = {
  NOT_STARTED: 'Not Started',
  UNDER_REVIEW: 'Under Review',
  SATISFIED: 'Satisfied',
  SATISFIED_WITH_CONDITIONS: 'Satisfied with Conditions',
  NOT_REQUIRED_BY_RULE: 'Not Required by Rule',
  DEFICIENT: 'Deficient',
  EXCEPTION_REQUIRED: 'Exception Required',
  REJECTED: 'Rejected',
};

export const SDI_PREQUALIFICATION_OUTCOME_LABELS: Readonly<Record<SDIPrequalificationOutcome, string>> = {
  Qualified: 'Qualified',
  NotRequiredByRule: 'Not Required by Rule',
  AlternateRiskTreatmentApproved: 'Alternate Risk Treatment Approved',
  ExceptionRequired: 'Exception Required',
  Rejected: 'Rejected',
};

export const BLOCKING_SEVERITY_LABELS: Readonly<Record<BlockingSeverity, string>> = {
  BLOCKER: 'Blocker — Case cannot proceed',
  CONDITIONAL: 'Conditional — Depends on other items',
  ADVISORY: 'Advisory — Information only',
  NOT_REQUIRED: 'Not Required',
};

export const RENEWAL_STATUS_LABELS: Readonly<Record<RenewalStatus, string>> = {
  NONE: 'None',
  ELIGIBLE: 'Eligible for Renewal',
  DUE: 'Renewal Due',
  EXEMPTED: 'Exempted',
  NOT_APPLICABLE: 'Not Applicable',
};

export const PROFILE_INPUT_DIMENSION_LABELS: Readonly<Record<ProfileInputDimension, string>> = {
  TRADE: 'Trade',
  SCOPE: 'Scope',
  LABOR_ON_SITE_POSTURE: 'Labor-on-site Posture',
  JURISDICTION: 'Jurisdiction',
  RISK_CLASS: 'Risk Class',
  POLICY_CONDITIONS: 'Policy Conditions',
  INSURANCE_POSTURE: 'Insurance Posture',
  LICENSING_POSTURE: 'Licensing Posture',
  SDI_PREQUALIFICATION_POSTURE: 'SDI / Prequalification Posture',
};

// -- Profile Input Dimension Definitions (T03 §1.2) ----------------------------

export const PROFILE_INPUT_DIMENSION_DEFINITIONS: ReadonlyArray<IProfileInputDimensionDef> = [
  { dimension: 'TRADE', description: 'Trade classification of the subcontractor' },
  { dimension: 'SCOPE', description: 'Scope of work for the subcontract' },
  { dimension: 'LABOR_ON_SITE_POSTURE', description: 'Whether labor will be on site' },
  { dimension: 'JURISDICTION', description: 'Jurisdiction governing the work' },
  { dimension: 'RISK_CLASS', description: 'Risk classification of the subcontract' },
  { dimension: 'POLICY_CONDITIONS', description: 'Applicable policy conditions' },
  { dimension: 'INSURANCE_POSTURE', description: 'Insurance requirements posture' },
  { dimension: 'LICENSING_POSTURE', description: 'Licensing requirements posture' },
  { dimension: 'SDI_PREQUALIFICATION_POSTURE', description: 'SDI / prequalification posture' },
];

// -- Dual-State Independence Examples (T03 §5.2) ------------------------------

export const DUAL_STATE_INDEPENDENCE_EXAMPLES: ReadonlyArray<IDualStateExample> = [
  { artifactState: 'RECEIVED_ACCEPTED', evaluationState: 'DEFICIENT', explanation: 'Artifact in acceptable receipt state but specialist evaluation finds it deficient' },
  { artifactState: 'NOT_PROVIDED', evaluationState: 'NOT_REQUIRED_BY_RULE', explanation: 'No uploaded artifact but specialist rules it not required' },
  { artifactState: 'RECEIVED_ACCEPTED', evaluationState: 'EXCEPTION_REQUIRED', explanation: 'Artifact received plus specialist determines exception is required' },
  { artifactState: 'RECEIVED_ACCEPTED', evaluationState: 'SATISFIED_WITH_CONDITIONS', explanation: 'Specialist issues conditional ruling without changing artifact record' },
];

// -- PM Override Doctrine (T03 §6) ---------------------------------------------

/** Actions explicitly prohibited for PM / APM / PA per T03 §6. */
export const PM_OVERRIDE_PROHIBITED_ACTIONS = [
  'SUPPRESS_REQUIREMENT_ITEM',
  'FORCE_NOT_REQUIRED',
  'SHRINK_REQUIREMENT_SET',
  'OVERRIDE_SPECIALIST_EVALUATION',
] as const;

// -- SDI Outcome Classification ------------------------------------------------

/** SDI outcomes that block readiness per T03 §7.1. */
export const SDI_BLOCKING_OUTCOMES = [
  'ExceptionRequired', 'Rejected',
] as const satisfies ReadonlyArray<SDIPrequalificationOutcome>;

/** SDI outcomes that satisfy readiness per T03 §7.1. */
export const SDI_SATISFIED_OUTCOMES = [
  'Qualified', 'NotRequiredByRule', 'AlternateRiskTreatmentApproved',
] as const satisfies ReadonlyArray<SDIPrequalificationOutcome>;

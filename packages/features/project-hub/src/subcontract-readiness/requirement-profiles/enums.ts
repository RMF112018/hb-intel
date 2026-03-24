/**
 * P3-E13-T08 Stage 3 Subcontract Execution Readiness Module requirement-profiles enumerations.
 * Governed profiles, dual-state item model, SDI prequalification, typed metadata.
 */

// -- Artifact State (T03 §4.1) ------------------------------------------------

/** Evidence receipt posture per T03 §4.1. Answers: "What evidence has been supplied?" */
export type ArtifactState =
  | 'NOT_PROVIDED'
  | 'REQUESTED'
  | 'RECEIVED_PENDING_REVIEW'
  | 'RECEIVED_ACCEPTED'
  | 'RECEIVED_DEFICIENT'
  | 'REPLACED'
  | 'EXTERNAL_REFERENCE_ONLY'
  | 'NOT_REQUIRED_BY_RULE';

// -- Compliance Evaluation State (T03 §5.1) -----------------------------------

/** Specialist ruling per T03 §5.1. Answers: "Does this satisfy the requirement?" */
export type ComplianceEvaluationState =
  | 'NOT_STARTED'
  | 'UNDER_REVIEW'
  | 'SATISFIED'
  | 'SATISFIED_WITH_CONDITIONS'
  | 'NOT_REQUIRED_BY_RULE'
  | 'DEFICIENT'
  | 'EXCEPTION_REQUIRED'
  | 'REJECTED';

// -- SDI Prequalification Outcome (T03 §7.1) ----------------------------------

/** Governed SDI outcome family per T03 §7.1. Not a binary Compass-only row. */
export type SDIPrequalificationOutcome =
  | 'Qualified'
  | 'NotRequiredByRule'
  | 'AlternateRiskTreatmentApproved'
  | 'ExceptionRequired'
  | 'Rejected';

// -- Blocking Severity (T03 §3.1) ---------------------------------------------

/** Blocking posture per T03 §3.1. */
export type BlockingSeverity =
  | 'BLOCKER'
  | 'CONDITIONAL'
  | 'ADVISORY'
  | 'NOT_REQUIRED';

// -- Renewal Status (T03 §3.1) ------------------------------------------------

/** Renewable posture per T03 §3.1. */
export type RenewalStatus =
  | 'NONE'
  | 'ELIGIBLE'
  | 'DUE'
  | 'EXEMPTED'
  | 'NOT_APPLICABLE';

// -- Metadata Field Type (T03 §3.2) -------------------------------------------

/** Typed metadata field classification per T03 §3.2. */
export type MetadataFieldType =
  | 'STRING'
  | 'ENUM'
  | 'DATE'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'REFERENCE';

// -- Profile Input Dimensions (T03 §1.2) --------------------------------------

/** Minimum profile binding inputs per T03 §1.2. */
export type ProfileInputDimension =
  | 'TRADE'
  | 'SCOPE'
  | 'LABOR_ON_SITE_POSTURE'
  | 'JURISDICTION'
  | 'RISK_CLASS'
  | 'POLICY_CONDITIONS'
  | 'INSURANCE_POSTURE'
  | 'LICENSING_POSTURE'
  | 'SDI_PREQUALIFICATION_POSTURE';

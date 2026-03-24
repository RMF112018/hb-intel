/**
 * P3-E13-T08 Stage 6 Subcontract Execution Readiness Module lanes-permissions enumerations.
 * Authority model, action types, annotation targets, lane depth, UX surfaces, visibility.
 */

// -- Authority Role (T06 §1.1) ------------------------------------------------

/** Role behavior classifications per T06 §1.1. */
export type ReadinessAuthorityRoleT06 =
  | 'PM_APM_PA'
  | 'COMPLIANCE_RISK'
  | 'PX'
  | 'CFO'
  | 'COMPLIANCE_MANAGER'
  | 'PER_REVIEW_ONLY'
  | 'READ_ONLY_CONSUMER';

// -- Distinct Action Type (T06 §2) --------------------------------------------

/** Four separate action types that must remain distinct per T06 §2. */
export type DistinctActionType =
  | 'ANNOTATION'
  | 'APPROVAL'
  | 'READINESS_ISSUANCE'
  | 'GATE_ENFORCEMENT';

// -- Annotation Target (T06 §3) -----------------------------------------------

/** Supported annotation targets per T06 §3. */
export type AnnotationTarget =
  | 'CASE_HEADER_SUMMARY'
  | 'REQUIREMENT_ITEM_DETAIL'
  | 'ITEM_EVALUATION_DETAIL'
  | 'EXCEPTION_ITERATION_DETAIL'
  | 'READINESS_DECISION_DETAIL'
  | 'LINEAGE_SUPERSESSION_SUMMARY';

// -- Application Lane (T06 §4) ------------------------------------------------

/** Application lane per T06 §4. */
export type ApplicationLane =
  | 'PWA'
  | 'SPFX';

// -- PWA Depth Capability (T06 §4.1) ------------------------------------------

/** Full-depth PWA capabilities per T06 §4.1. */
export type PWADepthCapability =
  | 'DENSE_EVALUATION'
  | 'EXCEPTION_HISTORY'
  | 'ITERATION_DIFF'
  | 'LINEAGE_INSPECTION'
  | 'CROSS_MODULE_ANALYSIS'
  | 'CASE_DETAIL_AUTHORING'
  | 'PRECEDENT_MANAGEMENT';

// -- SPFx Depth Capability (T06 §4.2) -----------------------------------------

/** Lighter SPFx capabilities per T06 §4.2. */
export type SPFxDepthCapability =
  | 'CASE_LIST_SUMMARY'
  | 'ITEM_DEFICIENCY_STATUS'
  | 'ASSEMBLY_SUBMISSION'
  | 'SIMPLE_APPROVAL_ACTIONS'
  | 'DECISION_POSTURE_READONLY';

// -- UX Surface Expectation (T06 §5) ------------------------------------------

/** Minimum UX expectations per T06 §5. */
export type UXSurfaceExpectation =
  | 'WORKSPACE_PAGE_SHELL'
  | 'DENSE_TABLE_LIST'
  | 'DUAL_STATE_DISTINCTION'
  | 'LINEAGE_INDICATORS'
  | 'ISSUANCE_STATUS_VISIBLE'
  | 'EXCEPTION_ITERATION_HISTORY'
  | 'RENEWAL_EXPIRATION_POSTURE'
  | 'SMART_EMPTY_STATE';

// -- Visibility Tier (T06 §6) -------------------------------------------------

/** Visibility tier per T06 §6. */
export type VisibilityTier =
  | 'OPERATIONAL'
  | 'SPECIALIST'
  | 'REVIEW';

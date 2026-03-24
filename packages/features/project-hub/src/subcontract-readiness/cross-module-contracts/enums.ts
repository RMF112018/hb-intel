/**
 * P3-E13-T08 Stage 7 Subcontract Execution Readiness Module cross-module-contracts enumerations.
 * Financial gate, Startup boundary, downstream consumers, related items, activity, future inputs.
 */

// -- Gate Projection Fields (T07 §1.2) ----------------------------------------

/** Required fields in the Financial gate projection per T07 §1.2. */
export type GateProjectionField =
  | 'LINKED_BUYOUT_LINE_ID'
  | 'READINESS_CASE_ID'
  | 'EXECUTION_READINESS_OUTCOME'
  | 'DECISION_ISSUED_AT'
  | 'DECISION_VERSION'
  | 'BLOCKING_REASON_CODE'
  | 'SUPERSEDED_BY_CASE_ID';

// -- Financial Prohibitions (T07 §1.3) ----------------------------------------

/** Actions Financial must not take per T07 §1.3. */
export type FinancialProhibition =
  | 'INFER_FROM_RAW_ITEMS'
  | 'WRITE_READINESS_RECORDS'
  | 'MUTATE_EXCEPTION_OUTCOMES'
  | 'BYPASS_SUPERSEDE_VOID_LINEAGE';

// -- Startup Consumption (T07 §2) ---------------------------------------------

/** What Startup may hold per T07 §2. */
export type StartupAllowedConsumption =
  | 'REFERENCE_LINKS'
  | 'SUMMARY_POSTURE'
  | 'DEPENDENCY_VISIBILITY';

/** What Startup may not hold per T07 §2. */
export type StartupProhibitedConsumption =
  | 'READINESS_WORKFLOW'
  | 'EVALUATION_LEDGERS'
  | 'EXCEPTION_ROUTING'
  | 'DECISION_ISSUANCE';

// -- Downstream Consumers (T07 §3) --------------------------------------------

/** Downstream projection consumers per T07 §3. */
export type DownstreamConsumer =
  | 'REPORTS'
  | 'HEALTH'
  | 'WORK_QUEUE';

// -- Related Item Pairs (T07 §4.1) --------------------------------------------

/** Required relationship pairs per T07 §4.1. */
export type ReadinessRelatedItemPair =
  | 'CASE_TO_BUYOUT_LINE'
  | 'DECISION_TO_BUYOUT_LINE'
  | 'EXCEPTION_PRECEDENT_TO_CASE'
  | 'SUPERSEDED_CASE_TO_SUCCESSOR';

// -- Cross-Module Activity Events (T07 §4.2) ----------------------------------

/** Required activity events per T07 §4.2. */
export type CrossModuleActivityEvent =
  | 'CASE_CREATED'
  | 'CASE_SUBMITTED'
  | 'DEFICIENCY_ISSUED'
  | 'DEFICIENCY_RESOLVED'
  | 'EXCEPTION_ITERATION_SUBMITTED'
  | 'EXCEPTION_ACTION_TAKEN'
  | 'READINESS_DECISION_ISSUED'
  | 'CASE_RENEWED'
  | 'CASE_SUPERSEDED'
  | 'CASE_VOIDED';

// -- Future External Inputs (T07 §5) ------------------------------------------

/** Future external input types per T07 §5. */
export type FutureExternalInputType =
  | 'ARTIFACT_REFERENCES'
  | 'EXTERNAL_FACTUAL_POSTURE'
  | 'PREQUALIFICATION_ADVISORIES'
  | 'IDENTITY_HYDRATION'
  | 'ALERTING_INPUTS';

/** What external systems cannot displace per T07 §5. */
export type ExternalDisplacementProhibition =
  | 'PARENT_READINESS_CASE'
  | 'SPECIALIST_EVALUATION_OWNERSHIP'
  | 'EXCEPTION_GOVERNANCE'
  | 'PROJECT_LEVEL_DECISION';

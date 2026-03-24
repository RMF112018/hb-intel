/**
 * P3-E13-T08 Stage 1 Subcontract Execution Readiness Module foundation enumerations.
 * Operating model, surfaces, layers, boundaries, ownership, activation, cross-contract.
 */

// -- Operating Surfaces (T01 §4.1) --------------------------------------------

/** The 6 primary user-facing surfaces per T01 §4.1. */
export type ReadinessSurfaceCode =
  | 'CASE_REGISTRY'
  | 'CASE_DETAIL_WORKSPACE'
  | 'REQUIREMENT_EVALUATION_WORKBENCH'
  | 'EXCEPTION_PACKET_WORKSPACE'
  | 'READINESS_DECISION_SURFACE'
  | 'REVIEW_OVERLAY_SURFACE';

// -- Operating Layers (T01 §4.2) ----------------------------------------------

/** The 3 architectural operating layers per T01 §4.2. */
export type ReadinessOperatingLayer =
  | 'PRIMARY_OPERATIONAL'
  | 'EXCEPTION_GOVERNANCE'
  | 'GATE_AND_PUBLICATION';

// -- Architecture Record Classes (P3-E13 Master Index) -------------------------

/** The 3 record classes per P3-E13 master index architecture model. */
export type ReadinessRecordClass =
  | 'CLASS_1_PRIMARY_OPERATIONAL'
  | 'CLASS_2_EXCEPTION_GOVERNANCE'
  | 'CLASS_3_GATE_AND_DOWNSTREAM';

// -- Adjacent Module Identifiers (T01 §5) -------------------------------------

/** Adjacent modules with explicit boundary declarations per T01 §5. */
export type AdjacentModuleCode =
  | 'FINANCIAL'
  | 'STARTUP'
  | 'REPORTS'
  | 'HEALTH'
  | 'WORK_QUEUE'
  | 'FUTURE_VENDOR_MASTER';

// -- Source-of-Truth Authority Rules (T01 §8) ---------------------------------

/** Authority rule classifications per T01 §8. */
export type ReadinessAuthorityRule =
  | 'CANONICAL_SOURCE'
  | 'SPECIALIST_GOVERNED'
  | 'CONSUMES_READINESS_OUTPUT'
  | 'SEPARATE_REVIEW_LAYER';

// -- Operating Ownership Roles (T01 §6) ---------------------------------------

/** Roles with operating ownership per T01 §6. */
export type ReadinessOwnerRole =
  | 'PM'
  | 'APM'
  | 'PA'
  | 'COMPLIANCE_RISK'
  | 'PX'
  | 'CFO'
  | 'COMPLIANCE_MANAGER';

// -- Case Activation Triggers (T01 §7) ----------------------------------------

/** Triggers that activate a SubcontractReadinessCase per T01 §7. */
export type CaseActivationTrigger =
  | 'BUYOUT_AWARD_PATH_CREATED'
  | 'PACKAGE_ASSEMBLED_FOR_EXECUTION'
  | 'RENEWAL_OR_RESUBMISSION_REQUIRED'
  | 'PROACTIVE_COMPLIANCE_GOVERNANCE';

// -- Cross-Contract Roles (T01 §9) --------------------------------------------

/** Cross-contract positioning roles per T01 §9. */
export type CrossContractRole =
  | 'GATE_SOURCE'
  | 'GATE_ENFORCER'
  | 'DOWNSTREAM_CONSUMER'
  | 'HISTORICAL_CONTEXT';

// -- Module Identity Exclusions (T01 §2) --------------------------------------

/** What the module explicitly is NOT per T01 §2. */
export type ModuleIdentityExclusion =
  | 'FLAT_CHECKLIST_MODULE'
  | 'WAIVER_ONLY_ROUTING_FORM'
  | 'VENDOR_MASTER_REPLACEMENT'
  | 'FINANCIAL_STATUS_TRACKER'
  | 'REPORTS_LEDGER'
  | 'WORK_QUEUE_PROCESS_MODEL';

// -- Business Concerns (T01 §3) -----------------------------------------------

/** The 5 distinct business concerns per T01 §3. */
export type ReadinessBusinessConcern =
  | 'PRE_AWARD_COMPLETENESS'
  | 'EXECUTION_READINESS'
  | 'DEFICIENCY_RESOLUTION'
  | 'EXCEPTION_HANDLING'
  | 'CONTRACT_GATING';

/**
 * P3-E15-T10 Stage 4 Project QC Module plans-reviews enumerations.
 */

// -- Control Gate Status (T04 §5) ---------------------------------------------

/** Control gate statuses per T04 §5. */
export type ControlGateStatus =
  | 'NOT_READY'
  | 'READY_WITH_CONDITIONS'
  | 'READY_FOR_REVIEW'
  | 'ACCEPTED'
  | 'BLOCKED'
  | 'ESCALATED';

// -- Plan Activation Depth (T04 §2) -------------------------------------------

/** Plan activation depths per T04 §2. */
export type PlanActivationDepth =
  | 'PRELIMINARY'
  | 'FULL';

// -- Coverage Rule Type (T04 §3) ----------------------------------------------

/** Coverage rule types per T04 §3. */
export type CoverageRuleType =
  | 'MANDATORY_FLOOR'
  | 'PROJECT_ADDITION';

// -- Addendum Type (T04 §6) ---------------------------------------------------

/** Addendum types per T04 §6. */
export type AddendumType =
  | 'EXTRA_GATE'
  | 'EXTRA_REVIEW'
  | 'EXTRA_EVIDENCE'
  | 'EXTRA_APPROVAL';

// -- Override Type (T04 §6) ---------------------------------------------------

/** Override types per T04 §6. */
export type OverrideType =
  | 'ADDITIVE_RIGOR'
  | 'EQUIVALENT_METHOD';

// -- Gate Failure Consequence (T04 §9) ----------------------------------------

/** Gate failure consequences per T04 §9. */
export type GateFailureConsequence =
  | 'SPAWN_ISSUE'
  | 'BLOCK_GATE'
  | 'ESCALATE'
  | 'DEGRADE_PLAN_READINESS';

// -- Finding To Issue Condition (T04 §8.3) ------------------------------------

/** Finding-to-issue spawn conditions per T04 §8.3. */
export type FindingToIssueCondition =
  | 'CREATES_OPERATIONAL_FOLLOWUP'
  | 'BLOCKS_GATE'
  | 'UNRESOLVABLE_IN_REVIEW'
  | 'REVIEWER_MARKS_TRACKED';

// -- Plan Readiness Level (T04 §2) --------------------------------------------

/** Plan readiness levels per T04 §2. */
export type PlanReadinessLevel =
  | 'COMPLETE'
  | 'GATES_READY'
  | 'PARTIALLY_READY'
  | 'BLOCKED'
  | 'NOT_STARTED';

// -- Review Phase Type (T04 §7) -----------------------------------------------

/** Review phase types per T04 §7. */
export type ReviewPhaseType =
  | 'PRECONSTRUCTION'
  | 'DESIGN_REVIEW'
  | 'SUBMITTAL_SUPPORT'
  | 'PRE_EXECUTION_READINESS'
  | 'TURNOVER_QUALITY_READINESS';

// -- Plan Coverage Action (T04 §3) --------------------------------------------

/** Plan coverage actions per T04 §3. */
export type PlanCoverageAction =
  | 'ADD_HIGH_RISK'
  | 'ADD_EXTRA_GATE'
  | 'ADD_EXTRA_EVIDENCE'
  | 'ADD_EXTRA_APPROVAL';

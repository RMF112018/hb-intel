/**
 * P3-E11-T10 Stage 7 Project Startup Execution Baseline (PM Plan) enumerations.
 * Approval flow, field types, assumption categories, spine events.
 */

// -- Baseline Status (T06 §2.1) ---------------------------------------------

/** PM Plan approval status per T06 §2.1. */
export type BaselineStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Archived';

// -- Baseline Field Type (T06 §4) -------------------------------------------

/** Typed field value types per T06 §4. */
export type BaselineFieldType =
  | 'Text'
  | 'Number'
  | 'Date'
  | 'Currency'
  | 'Boolean'
  | 'LongText';

// -- Assumption Category (T06 §8) -------------------------------------------

/** The 9 assumption categories per T06 §8. */
export type AssumptionCategory =
  | 'LOGISTICS'
  | 'SAFETY'
  | 'SCHEDULE'
  | 'PROCUREMENT_BUYOUT'
  | 'OWNER_COMMITMENT'
  | 'RISK'
  | 'CLOSEOUT_PREPARATION'
  | 'OPERATING_HYPOTHESIS'
  | 'SUCCESS_CRITERIA';

// -- Assumption Risk Level (T06 §7) -----------------------------------------

/** Assumption risk level per T06 §7. */
export type AssumptionRiskLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

// -- Stage 7 Activity Spine Events (T10 §2 Stage 7) -------------------------

/** Activity Spine events emitted by Stage 7. */
export type Stage7ActivityEvent =
  | 'PMPlanSubmitted'
  | 'PMPlanApproved'
  | 'ExecutionAssumptionAdded';

// -- Stage 7 Health Spine Metrics (T10 §2 Stage 7) --------------------------

/** Health Spine metrics published by Stage 7. */
export type Stage7HealthMetric =
  | 'pmPlanStatus';

// -- Stage 7 Work Queue Items (T10 §2 Stage 7) ------------------------------

/** Work Queue items raised by Stage 7. */
export type Stage7WorkQueueItem =
  | 'PMPlanPendingApproval';

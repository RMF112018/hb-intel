/**
 * P3-E15-T10 Stage 9 Project QC Module schedule-handoffs enumerations.
 */

// -- Quality Readiness Signal ---------------------------------------------------

/** Quality readiness signal for schedule-aware readiness publication. */
export type QualityReadinessSignal =
  | 'QUALITY_READY'
  | 'QUALITY_READY_WITH_CONDITIONS'
  | 'QUALITY_AT_RISK'
  | 'QUALITY_BLOCKED'
  | 'QUALITY_RECHECK_REQUIRED';

// -- Schedule Ref Type ----------------------------------------------------------

/** Schedule reference type indicating the kind of schedule linkage. */
export type ScheduleRefType =
  | 'ACTIVITY_REF'
  | 'MILESTONE_REF'
  | 'PHASE_REF'
  | 'LOOK_AHEAD_WINDOW_REF';

// -- Handoff Target -------------------------------------------------------------

/** Handoff target representing the downstream lifecycle recipient. */
export type HandoffTarget =
  | 'CLOSEOUT'
  | 'STARTUP'
  | 'WARRANTY'
  | 'FUTURE_SITE_CONTROLS';

// -- Handoff Content Type -------------------------------------------------------

/** Handoff content type describing the nature of content in a handoff payload. */
export type HandoffContentType =
  | 'TURNOVER_QUALITY_BASIS'
  | 'OPEN_ISSUE_POSTURE'
  | 'APPROVED_DEVIATIONS'
  | 'EVIDENCE_REFS'
  | 'EXTERNAL_APPROVALS'
  | 'RECURRENCE_HISTORY'
  | 'RESPONSIBLE_ORG_HISTORY'
  | 'ADVISORY_DRIFT_ALERTS'
  | 'GATE_EXPECTATIONS'
  | 'QUALITY_PLAN_SECTIONS'
  | 'UNRESOLVED_BLOCKERS';

// -- Baseline Visible Surface ---------------------------------------------------

/** Baseline visible surface exposed in Phase 3 for schedule-aware readiness. */
export type BaselineVisibleSurface =
  | 'MILESTONE_ALIGNMENT'
  | 'UPCOMING_WINDOW_READINESS'
  | 'HOLD_MOCKUP_TEST_DUE_POSTURE'
  | 'TURNOVER_QUALITY_READINESS';

// -- Schedule Aware Record Type -------------------------------------------------

/** Record types that participate in schedule-awareness within the QC module. */
export type ScheduleAwareRecordType =
  | 'WORK_PACKAGE_QUALITY_PLAN'
  | 'CONTROL_GATE'
  | 'PRECONSTRUCTION_REVIEW_PACKAGE'
  | 'REVIEW_FINDING'
  | 'QC_ISSUE'
  | 'CORRECTIVE_ACTION'
  | 'EXTERNAL_APPROVAL_DEPENDENCY'
  | 'SUBMITTAL_ITEM_RECORD'
  | 'ADVISORY_VERDICT'
  | 'VERSION_DRIFT_ALERT';

// -- Deferred Field Capability --------------------------------------------------

/** Field capabilities deferred to Phase 6 — Site Controls. */
export type DeferredFieldCapability =
  | 'DAILY_FIELD_EXECUTION'
  | 'SHORT_INTERVAL_COMMITMENT'
  | 'PPC_METRICS'
  | 'MOBILE_FIRST_CAPTURE'
  | 'OFFLINE_DEFERRED_SYNC'
  | 'FIELD_ORIGINATED_UPDATES';

// -- Handoff Lineage Preservation -----------------------------------------------

/** Handoff lineage preservation strategy for downstream traceability. */
export type HandoffLineagePreservation =
  | 'SNAPSHOT_BASED'
  | 'REFERENCE_BASED'
  | 'IDENTIFIER_BASED';

// -- Readiness Publication Scope ------------------------------------------------

/** Readiness publication scope determining where signals are surfaced. */
export type ReadinessPublicationScope =
  | 'PROJECT_HUB_CANVAS'
  | 'HEALTH_SPINE'
  | 'WORK_QUEUE_SPINE'
  | 'RELATED_ITEMS_SPINE';

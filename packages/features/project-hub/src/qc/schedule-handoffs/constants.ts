/**
 * P3-E15-T10 Stage 9 Project QC Module schedule-handoffs constants.
 */

import type {
  QualityReadinessSignal,
  ScheduleRefType,
  HandoffTarget,
  HandoffContentType,
  BaselineVisibleSurface,
  ScheduleAwareRecordType,
  DeferredFieldCapability,
  HandoffLineagePreservation,
  ReadinessPublicationScope,
} from './enums.js';
import type { IDeferredFieldCapabilityDef } from './types.js';

// -- Enum Arrays ---------------------------------------------------------------

export const QC_QUALITY_READINESS_SIGNALS = [
  'QUALITY_READY',
  'QUALITY_READY_WITH_CONDITIONS',
  'QUALITY_AT_RISK',
  'QUALITY_BLOCKED',
  'QUALITY_RECHECK_REQUIRED',
] as const satisfies ReadonlyArray<QualityReadinessSignal>;

export const QC_SCHEDULE_REF_TYPES = [
  'ACTIVITY_REF',
  'MILESTONE_REF',
  'PHASE_REF',
  'LOOK_AHEAD_WINDOW_REF',
] as const satisfies ReadonlyArray<ScheduleRefType>;

export const QC_HANDOFF_TARGETS = [
  'CLOSEOUT',
  'STARTUP',
  'WARRANTY',
  'FUTURE_SITE_CONTROLS',
] as const satisfies ReadonlyArray<HandoffTarget>;

export const QC_HANDOFF_CONTENT_TYPES = [
  'TURNOVER_QUALITY_BASIS',
  'OPEN_ISSUE_POSTURE',
  'APPROVED_DEVIATIONS',
  'EVIDENCE_REFS',
  'EXTERNAL_APPROVALS',
  'RECURRENCE_HISTORY',
  'RESPONSIBLE_ORG_HISTORY',
  'ADVISORY_DRIFT_ALERTS',
  'GATE_EXPECTATIONS',
  'QUALITY_PLAN_SECTIONS',
  'UNRESOLVED_BLOCKERS',
] as const satisfies ReadonlyArray<HandoffContentType>;

export const QC_BASELINE_VISIBLE_SURFACES = [
  'MILESTONE_ALIGNMENT',
  'UPCOMING_WINDOW_READINESS',
  'HOLD_MOCKUP_TEST_DUE_POSTURE',
  'TURNOVER_QUALITY_READINESS',
] as const satisfies ReadonlyArray<BaselineVisibleSurface>;

export const QC_SCHEDULE_AWARE_RECORD_TYPES = [
  'WORK_PACKAGE_QUALITY_PLAN',
  'CONTROL_GATE',
  'PRECONSTRUCTION_REVIEW_PACKAGE',
  'REVIEW_FINDING',
  'QC_ISSUE',
  'CORRECTIVE_ACTION',
  'EXTERNAL_APPROVAL_DEPENDENCY',
  'SUBMITTAL_ITEM_RECORD',
  'ADVISORY_VERDICT',
  'VERSION_DRIFT_ALERT',
] as const satisfies ReadonlyArray<ScheduleAwareRecordType>;

export const QC_DEFERRED_FIELD_CAPABILITIES = [
  'DAILY_FIELD_EXECUTION',
  'SHORT_INTERVAL_COMMITMENT',
  'PPC_METRICS',
  'MOBILE_FIRST_CAPTURE',
  'OFFLINE_DEFERRED_SYNC',
  'FIELD_ORIGINATED_UPDATES',
] as const satisfies ReadonlyArray<DeferredFieldCapability>;

export const QC_HANDOFF_LINEAGE_PRESERVATIONS = [
  'SNAPSHOT_BASED',
  'REFERENCE_BASED',
  'IDENTIFIER_BASED',
] as const satisfies ReadonlyArray<HandoffLineagePreservation>;

export const QC_READINESS_PUBLICATION_SCOPES = [
  'PROJECT_HUB_CANVAS',
  'HEALTH_SPINE',
  'WORK_QUEUE_SPINE',
  'RELATED_ITEMS_SPINE',
] as const satisfies ReadonlyArray<ReadinessPublicationScope>;

// -- Label Maps ----------------------------------------------------------------

export const QC_QUALITY_READINESS_SIGNAL_LABELS: Readonly<Record<QualityReadinessSignal, string>> = {
  QUALITY_READY: 'Quality ready',
  QUALITY_READY_WITH_CONDITIONS: 'Quality ready with conditions',
  QUALITY_AT_RISK: 'Quality at risk',
  QUALITY_BLOCKED: 'Quality blocked',
  QUALITY_RECHECK_REQUIRED: 'Quality recheck required',
};

export const QC_HANDOFF_TARGET_LABELS: Readonly<Record<HandoffTarget, string>> = {
  CLOSEOUT: 'Closeout',
  STARTUP: 'Startup',
  WARRANTY: 'Warranty',
  FUTURE_SITE_CONTROLS: 'Future site controls',
};

export const QC_BASELINE_VISIBLE_SURFACE_LABELS: Readonly<Record<BaselineVisibleSurface, string>> = {
  MILESTONE_ALIGNMENT: 'Milestone alignment',
  UPCOMING_WINDOW_READINESS: 'Upcoming window readiness',
  HOLD_MOCKUP_TEST_DUE_POSTURE: 'Hold mockup test due posture',
  TURNOVER_QUALITY_READINESS: 'Turnover quality readiness',
};

export const QC_SCHEDULE_REF_TYPE_LABELS: Readonly<Record<ScheduleRefType, string>> = {
  ACTIVITY_REF: 'Activity ref',
  MILESTONE_REF: 'Milestone ref',
  PHASE_REF: 'Phase ref',
  LOOK_AHEAD_WINDOW_REF: 'Look-ahead window ref',
};

// -- Definition Arrays ---------------------------------------------------------

export const SCHEDULE_AWARE_RECORD_TYPE_LIST: readonly ScheduleAwareRecordType[] = [
  'WORK_PACKAGE_QUALITY_PLAN',
  'CONTROL_GATE',
  'PRECONSTRUCTION_REVIEW_PACKAGE',
  'REVIEW_FINDING',
  'QC_ISSUE',
  'CORRECTIVE_ACTION',
  'EXTERNAL_APPROVAL_DEPENDENCY',
  'SUBMITTAL_ITEM_RECORD',
  'ADVISORY_VERDICT',
  'VERSION_DRIFT_ALERT',
];

export const HANDOFF_TARGET_CONTENT_MAP: ReadonlyArray<{
  readonly target: HandoffTarget;
  readonly expectedContentTypes: readonly HandoffContentType[];
}> = [
  {
    target: 'CLOSEOUT',
    expectedContentTypes: [
      'TURNOVER_QUALITY_BASIS',
      'OPEN_ISSUE_POSTURE',
      'APPROVED_DEVIATIONS',
      'EVIDENCE_REFS',
      'EXTERNAL_APPROVALS',
    ],
  },
  {
    target: 'STARTUP',
    expectedContentTypes: [
      'QUALITY_PLAN_SECTIONS',
      'GATE_EXPECTATIONS',
      'APPROVED_DEVIATIONS',
      'EVIDENCE_REFS',
      'UNRESOLVED_BLOCKERS',
    ],
  },
  {
    target: 'WARRANTY',
    expectedContentTypes: [
      'TURNOVER_QUALITY_BASIS',
      'EVIDENCE_REFS',
      'APPROVED_DEVIATIONS',
      'RECURRENCE_HISTORY',
      'RESPONSIBLE_ORG_HISTORY',
    ],
  },
  {
    target: 'FUTURE_SITE_CONTROLS',
    expectedContentTypes: [
      'UNRESOLVED_BLOCKERS',
      'ADVISORY_DRIFT_ALERTS',
      'GATE_EXPECTATIONS',
      'QUALITY_PLAN_SECTIONS',
    ],
  },
];

export const BASELINE_VISIBLE_SURFACE_DESCRIPTIONS: ReadonlyArray<{
  readonly surface: BaselineVisibleSurface;
  readonly description: string;
}> = [
  { surface: 'MILESTONE_ALIGNMENT', description: 'Quality obligations aligned to upcoming milestones' },
  { surface: 'UPCOMING_WINDOW_READINESS', description: 'Readiness signals for near-term work windows' },
  { surface: 'HOLD_MOCKUP_TEST_DUE_POSTURE', description: 'Hold point, mockup, and test due posture' },
  { surface: 'TURNOVER_QUALITY_READINESS', description: 'Pre-punch and turnover-quality readiness posture' },
];

export const DEFERRED_FIELD_CAPABILITY_DEFINITIONS: ReadonlyArray<IDeferredFieldCapabilityDef> = [
  {
    capability: 'DAILY_FIELD_EXECUTION',
    description: 'Daily field execution tracking and reporting',
    deferredTo: 'Phase 6 — Site Controls',
    rationale: 'QC owns control layer, not field execution',
  },
  {
    capability: 'SHORT_INTERVAL_COMMITMENT',
    description: 'Short interval commitment and look-ahead planning',
    deferredTo: 'Phase 6 — Site Controls',
    rationale: 'Field-level commitment cadence is a site controls concern',
  },
  {
    capability: 'PPC_METRICS',
    description: 'Percent plan complete metrics and tracking',
    deferredTo: 'Phase 6 — Site Controls',
    rationale: 'PPC measurement belongs to field execution governance',
  },
  {
    capability: 'MOBILE_FIRST_CAPTURE',
    description: 'Mobile-first data capture for field inspections',
    deferredTo: 'Phase 6 — Site Controls',
    rationale: 'Mobile capture requires site controls infrastructure',
  },
  {
    capability: 'OFFLINE_DEFERRED_SYNC',
    description: 'Offline data capture with deferred synchronization',
    deferredTo: 'Phase 6 — Site Controls',
    rationale: 'Offline sync requires site controls connectivity model',
  },
  {
    capability: 'FIELD_ORIGINATED_UPDATES',
    description: 'Field-originated record updates and corrections',
    deferredTo: 'Phase 6 — Site Controls',
    rationale: 'Field-originated writes require site controls authority model',
  },
];

export const HANDOFF_LINEAGE_REQUIREMENTS: ReadonlyArray<{
  readonly target: HandoffTarget;
  readonly lineagePreservation: HandoffLineagePreservation;
}> = [
  { target: 'CLOSEOUT', lineagePreservation: 'SNAPSHOT_BASED' },
  { target: 'STARTUP', lineagePreservation: 'SNAPSHOT_BASED' },
  { target: 'WARRANTY', lineagePreservation: 'SNAPSHOT_BASED' },
  { target: 'FUTURE_SITE_CONTROLS', lineagePreservation: 'REFERENCE_BASED' },
];

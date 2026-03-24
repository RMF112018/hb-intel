/**
 * P3-E8-T08 Readiness evaluation constants.
 * Blocker matrices, override rules, work queue triggers.
 */

import type {
  ReadinessEvaluationLevel,
  ReadinessDecision,
  ReadinessBlockerType,
  ExceptionStatus,
  OverrideStatus,
} from './enums.js';
import type { IReadinessBlockerDefinition, IReadinessWorkQueueTrigger } from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const READINESS_EVALUATION_LEVELS = [
  'PROJECT', 'SUBCONTRACTOR', 'ACTIVITY',
] as const satisfies ReadonlyArray<ReadinessEvaluationLevel>;

export const READINESS_DECISIONS = [
  'READY', 'READY_WITH_EXCEPTION', 'NOT_READY',
] as const satisfies ReadonlyArray<ReadinessDecision>;

export const READINESS_BLOCKER_TYPES = [
  'HARD', 'SOFT',
] as const satisfies ReadonlyArray<ReadinessBlockerType>;

export const EXCEPTION_STATUSES = [
  'ACTIVE', 'LAPSED', 'REVOKED',
] as const satisfies ReadonlyArray<ExceptionStatus>;

export const OVERRIDE_STATUSES = [
  'PENDING', 'ACKNOWLEDGED', 'LAPSED', 'REVOKED',
] as const satisfies ReadonlyArray<OverrideStatus>;

// -- Exception Validation ---------------------------------------------------

export const EXCEPTION_MIN_RATIONALE_LENGTH = 20;

// -- Override Required Acknowledgers (§8) -----------------------------------

export const OVERRIDE_REQUIRED_ACKNOWLEDGERS: Readonly<Record<ReadinessEvaluationLevel, readonly string[]>> = {
  PROJECT: ['SafetyManager', 'PM'],
  SUBCONTRACTOR: ['SafetyManager', 'PM'],
  ACTIVITY: ['SafetyManager', 'PM', 'Superintendent'],
};

// -- Project-Level Blocker Matrix (§4) --------------------------------------

export const PROJECT_BLOCKERS: ReadonlyArray<IReadinessBlockerDefinition> = [
  { id: 'BLK-PRJ-01', evaluationLevel: 'PROJECT', condition: 'No approved SSSP base plan exists', blockerType: 'HARD', excepable: false },
  { id: 'BLK-PRJ-02', evaluationLevel: 'PROJECT', condition: 'SSSP base plan PENDING_APPROVAL > 14 days', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-PRJ-03', evaluationLevel: 'PROJECT', condition: 'No ACTIVE inspection checklist template', blockerType: 'HARD', excepable: false },
  { id: 'BLK-PRJ-04', evaluationLevel: 'PROJECT', condition: 'No weekly inspection in last 14 calendar days (post-mobilization)', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-PRJ-05', evaluationLevel: 'PROJECT', condition: 'CRITICAL CA OPEN > 1 business day', blockerType: 'HARD', excepable: false },
  { id: 'BLK-PRJ-06', evaluationLevel: 'PROJECT', condition: 'CRITICAL CA OPEN > 24 hours', blockerType: 'HARD', excepable: false },
  { id: 'BLK-PRJ-07', evaluationLevel: 'PROJECT', condition: 'Latest inspection score < 70', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-PRJ-08', evaluationLevel: 'PROJECT', condition: '3+ MAJOR CAs overdue', blockerType: 'SOFT', excepable: true },
];

// -- Subcontractor-Level Blocker Matrix (§5) --------------------------------

export const SUBCONTRACTOR_BLOCKERS: ReadonlyArray<IReadinessBlockerDefinition> = [
  { id: 'BLK-SUB-01', evaluationLevel: 'SUBCONTRACTOR', condition: 'No COMPANY_SAFETY_PLAN submission APPROVED', blockerType: 'HARD', excepable: false },
  { id: 'BLK-SUB-02', evaluationLevel: 'SUBCONTRACTOR', condition: 'No PROJECT_SPECIFIC_APP submission APPROVED', blockerType: 'HARD', excepable: false },
  { id: 'BLK-SUB-03', evaluationLevel: 'SUBCONTRACTOR', condition: 'PROJECT_SPECIFIC_APP REVISION_REQUESTED > 7 days', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-SUB-04', evaluationLevel: 'SUBCONTRACTOR', condition: 'Workers on site with no orientation record', blockerType: 'HARD', excepable: false },
  { id: 'BLK-SUB-05', evaluationLevel: 'SUBCONTRACTOR', condition: 'Active scope requires competent person; none ACTIVE', blockerType: 'HARD', excepable: false },
  { id: 'BLK-SUB-06', evaluationLevel: 'SUBCONTRACTOR', condition: 'Competent-person designation has EXPIRED backing certification', blockerType: 'HARD', excepable: false },
  { id: 'BLK-SUB-07', evaluationLevel: 'SUBCONTRACTOR', condition: 'Chemical products on site with no SDS record', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-SUB-08', evaluationLevel: 'SUBCONTRACTOR', condition: 'Open CRITICAL CA assigned to this subcontractor', blockerType: 'HARD', excepable: false },
  { id: 'BLK-SUB-09', evaluationLevel: 'SUBCONTRACTOR', condition: 'COMPANY_SAFETY_PLAN PENDING_REVIEW > 5 business days', blockerType: 'SOFT', excepable: true },
];

// -- Activity-Level Blocker Matrix (§6) -------------------------------------

export const ACTIVITY_BLOCKERS: ReadonlyArray<IReadinessBlockerDefinition> = [
  { id: 'BLK-ACT-01', evaluationLevel: 'ACTIVITY', condition: 'No APPROVED JHA for this activity', blockerType: 'HARD', excepable: false },
  { id: 'BLK-ACT-02', evaluationLevel: 'ACTIVITY', condition: 'Activity requires competent person; none ACTIVE', blockerType: 'HARD', excepable: false },
  { id: 'BLK-ACT-03', evaluationLevel: 'ACTIVITY', condition: 'JHA references expired/revoked competent-person designation', blockerType: 'HARD', excepable: false },
  { id: 'BLK-ACT-04', evaluationLevel: 'ACTIVITY', condition: 'No Daily Pre-Task Plan completed today', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-ACT-04-HR', evaluationLevel: 'ACTIVITY', condition: 'No Daily Pre-Task Plan for OSHA high-risk activity today', blockerType: 'HARD', excepable: false },
  { id: 'BLK-ACT-05', evaluationLevel: 'ACTIVITY', condition: 'Open CRITICAL CA for this activity scope', blockerType: 'HARD', excepable: false },
  { id: 'BLK-ACT-06', evaluationLevel: 'ACTIVITY', condition: 'Required PPE (in JHA) not available on site', blockerType: 'SOFT', excepable: true },
  { id: 'BLK-ACT-07', evaluationLevel: 'ACTIVITY', condition: 'Toolbox talk for this scope not completed (when prompt issued)', blockerType: 'SOFT', excepable: true },
];

// -- Work Queue Triggers (§10) ----------------------------------------------

export const READINESS_WORK_QUEUE_TRIGGERS: ReadonlyArray<IReadinessWorkQueueTrigger> = [
  {
    trigger: 'Project NOT_READY (HARD blocker)',
    workQueueItem: 'Resolve safety readiness blocker',
    priority: 'CRITICAL',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Project READY_WITH_EXCEPTION (first occurrence or new exception)',
    workQueueItem: 'Review safety exceptions for project',
    priority: 'HIGH',
    assignee: 'Safety Manager + PM',
  },
  {
    trigger: 'Subcontractor NOT_READY with workers on site',
    workQueueItem: 'Subcontractor safety clearance required',
    priority: 'CRITICAL',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Activity-level HARD blocker (work scheduled to start)',
    workQueueItem: 'Activity blocked: resolve safety condition',
    priority: 'CRITICAL',
    assignee: 'Safety Manager + PM',
  },
  {
    trigger: 'Override approaching expiration (< 4 hours)',
    workQueueItem: 'Safety override expiring — review status',
    priority: 'HIGH',
    assignee: 'Safety Manager + PM',
  },
];

// -- Label Maps -------------------------------------------------------------

export const READINESS_EVALUATION_LEVEL_LABELS: Readonly<Record<ReadinessEvaluationLevel, string>> = {
  PROJECT: 'Project',
  SUBCONTRACTOR: 'Subcontractor',
  ACTIVITY: 'Activity',
};

export const READINESS_DECISION_LABELS: Readonly<Record<ReadinessDecision, string>> = {
  READY: 'Ready',
  READY_WITH_EXCEPTION: 'Ready with Exception',
  NOT_READY: 'Not Ready',
};

export const BLOCKER_TYPE_LABELS: Readonly<Record<ReadinessBlockerType, string>> = {
  HARD: 'Hard — must be resolved; cannot be excepted',
  SOFT: 'Soft — may be excepted by Safety Manager',
};

export const EXCEPTION_STATUS_LABELS: Readonly<Record<ExceptionStatus, string>> = {
  ACTIVE: 'Active',
  LAPSED: 'Lapsed',
  REVOKED: 'Revoked',
};

export const OVERRIDE_STATUS_LABELS: Readonly<Record<OverrideStatus, string>> = {
  PENDING: 'Pending Acknowledgment',
  ACKNOWLEDGED: 'Acknowledged',
  LAPSED: 'Lapsed',
  REVOKED: 'Revoked',
};

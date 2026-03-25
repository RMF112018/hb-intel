/**
 * P3-E15-T10 Stage 4 Project QC Module plans-reviews constants.
 */

import type {
  AddendumType,
  ControlGateStatus,
  CoverageRuleType,
  FindingToIssueCondition,
  GateFailureConsequence,
  OverrideType,
  PlanActivationDepth,
  PlanCoverageAction,
  PlanReadinessLevel,
  ReviewPhaseType,
} from './enums.js';
import type { WorkPackagePlanState } from '../foundation/enums.js';

// -- Enum Arrays --------------------------------------------------------------

export const QC_CONTROL_GATE_STATUSES = [
  'NOT_READY', 'READY_WITH_CONDITIONS', 'READY_FOR_REVIEW', 'ACCEPTED', 'BLOCKED', 'ESCALATED',
] as const satisfies ReadonlyArray<ControlGateStatus>;

export const QC_PLAN_ACTIVATION_DEPTHS = [
  'PRELIMINARY', 'FULL',
] as const satisfies ReadonlyArray<PlanActivationDepth>;

export const QC_COVERAGE_RULE_TYPES = [
  'MANDATORY_FLOOR', 'PROJECT_ADDITION',
] as const satisfies ReadonlyArray<CoverageRuleType>;

export const QC_ADDENDUM_TYPES = [
  'EXTRA_GATE', 'EXTRA_REVIEW', 'EXTRA_EVIDENCE', 'EXTRA_APPROVAL',
] as const satisfies ReadonlyArray<AddendumType>;

export const QC_OVERRIDE_TYPES = [
  'ADDITIVE_RIGOR', 'EQUIVALENT_METHOD',
] as const satisfies ReadonlyArray<OverrideType>;

export const QC_GATE_FAILURE_CONSEQUENCES = [
  'SPAWN_ISSUE', 'BLOCK_GATE', 'ESCALATE', 'DEGRADE_PLAN_READINESS',
] as const satisfies ReadonlyArray<GateFailureConsequence>;

export const QC_FINDING_TO_ISSUE_CONDITIONS = [
  'CREATES_OPERATIONAL_FOLLOWUP', 'BLOCKS_GATE', 'UNRESOLVABLE_IN_REVIEW', 'REVIEWER_MARKS_TRACKED',
] as const satisfies ReadonlyArray<FindingToIssueCondition>;

export const QC_PLAN_READINESS_LEVELS = [
  'COMPLETE', 'GATES_READY', 'PARTIALLY_READY', 'BLOCKED', 'NOT_STARTED',
] as const satisfies ReadonlyArray<PlanReadinessLevel>;

export const QC_REVIEW_PHASE_TYPES = [
  'PRECONSTRUCTION', 'DESIGN_REVIEW', 'SUBMITTAL_SUPPORT', 'PRE_EXECUTION_READINESS', 'TURNOVER_QUALITY_READINESS',
] as const satisfies ReadonlyArray<ReviewPhaseType>;

export const QC_PLAN_COVERAGE_ACTIONS = [
  'ADD_HIGH_RISK', 'ADD_EXTRA_GATE', 'ADD_EXTRA_EVIDENCE', 'ADD_EXTRA_APPROVAL',
] as const satisfies ReadonlyArray<PlanCoverageAction>;

// -- Label Maps ---------------------------------------------------------------

export const QC_CONTROL_GATE_STATUS_LABELS: Readonly<Record<ControlGateStatus, string>> = {
  NOT_READY: 'Not Ready',
  READY_WITH_CONDITIONS: 'Ready with Conditions',
  READY_FOR_REVIEW: 'Ready for Review',
  ACCEPTED: 'Accepted',
  BLOCKED: 'Blocked',
  ESCALATED: 'Escalated',
};

export const QC_PLAN_READINESS_LEVEL_LABELS: Readonly<Record<PlanReadinessLevel, string>> = {
  COMPLETE: 'Complete',
  GATES_READY: 'Gates Ready',
  PARTIALLY_READY: 'Partially Ready',
  BLOCKED: 'Blocked',
  NOT_STARTED: 'Not Started',
};

export const QC_REVIEW_PHASE_TYPE_LABELS: Readonly<Record<ReviewPhaseType, string>> = {
  PRECONSTRUCTION: 'Preconstruction',
  DESIGN_REVIEW: 'Design Review',
  SUBMITTAL_SUPPORT: 'Submittal Support',
  PRE_EXECUTION_READINESS: 'Pre-Execution Readiness',
  TURNOVER_QUALITY_READINESS: 'Turnover Quality Readiness',
};

export const QC_GATE_FAILURE_CONSEQUENCE_LABELS: Readonly<Record<GateFailureConsequence, string>> = {
  SPAWN_ISSUE: 'Spawn Issue',
  BLOCK_GATE: 'Block Gate',
  ESCALATE: 'Escalate',
  DEGRADE_PLAN_READINESS: 'Degrade Plan Readiness',
};

// -- State Transitions --------------------------------------------------------

export const CONTROL_GATE_VALID_TRANSITIONS: ReadonlyArray<{ readonly from: ControlGateStatus; readonly to: ControlGateStatus }> = [
  { from: 'NOT_READY', to: 'READY_WITH_CONDITIONS' },
  { from: 'NOT_READY', to: 'BLOCKED' },
  { from: 'READY_WITH_CONDITIONS', to: 'READY_FOR_REVIEW' },
  { from: 'READY_WITH_CONDITIONS', to: 'BLOCKED' },
  { from: 'READY_FOR_REVIEW', to: 'ACCEPTED' },
  { from: 'READY_FOR_REVIEW', to: 'BLOCKED' },
  { from: 'BLOCKED', to: 'NOT_READY' },
  { from: 'BLOCKED', to: 'ESCALATED' },
  { from: 'ESCALATED', to: 'NOT_READY' },
  { from: 'ESCALATED', to: 'BLOCKED' },
];

export const PLAN_ACTIVATION_VALID_TRANSITIONS: ReadonlyArray<{ readonly from: WorkPackagePlanState; readonly to: WorkPackagePlanState }> = [
  { from: 'DRAFT', to: 'IN_REVIEW' },
  { from: 'IN_REVIEW', to: 'PRELIMINARILY_ACTIVE' },
  { from: 'IN_REVIEW', to: 'ACTIVE' },
  { from: 'IN_REVIEW', to: 'DRAFT' },
  { from: 'PRELIMINARILY_ACTIVE', to: 'ACTIVE' },
  { from: 'ACTIVE', to: 'READY_FOR_CONTROL_GATES' },
  { from: 'ACTIVE', to: 'REVISED' },
  { from: 'ACTIVE', to: 'SUPERSEDED' },
  { from: 'ACTIVE', to: 'CLOSED' },
  { from: 'READY_FOR_CONTROL_GATES', to: 'REVISED' },
  { from: 'READY_FOR_CONTROL_GATES', to: 'SUPERSEDED' },
  { from: 'READY_FOR_CONTROL_GATES', to: 'CLOSED' },
  { from: 'REVISED', to: 'IN_REVIEW' },
];

// -- Terminal / Classification Constants --------------------------------------

export const CONTROL_GATE_TERMINAL_STATUSES = ['ACCEPTED'] as const satisfies ReadonlyArray<ControlGateStatus>;

export const PLAN_TERMINAL_STATES = ['SUPERSEDED', 'CLOSED'] as const satisfies ReadonlyArray<WorkPackagePlanState>;

export const FINDING_TO_ISSUE_SPAWN_CONDITIONS = [
  'CREATES_OPERATIONAL_FOLLOWUP', 'BLOCKS_GATE', 'UNRESOLVABLE_IN_REVIEW', 'REVIEWER_MARKS_TRACKED',
] as const satisfies ReadonlyArray<FindingToIssueCondition>;

export const MANDATORY_COVERAGE_FLOOR_ITEMS = [
  'GOVERNED_STANDARDS', 'BEST_PRACTICE_PACKETS', 'GATE_CLASSES', 'REVIEW_TYPES', 'EVIDENCE_MINIMUMS', 'VERIFIER_RULES',
] as const;

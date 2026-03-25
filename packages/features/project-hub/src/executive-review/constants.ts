/**
 * Stage 8.4 executive-review constants.
 * Push-to-team rules, closure loop, activity events.
 */

import type {
  ClosureLoopState,
  PushActivityEvent,
  PushAssigneeDefault,
  PushOriginRole,
  PushPayloadMode,
  PushPriority,
  PushVisibility,
  PushWorkItemStatus,
} from './enums.js';
import type { IPushAutoClosePreventionRule } from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const PUSH_PAYLOAD_MODES = [
  'CURATED_SUMMARY',
  'FULL_CONTEXT',
] as const satisfies ReadonlyArray<PushPayloadMode>;

export const PUSH_PRIORITIES = [
  'SOON',
  'NOW',
] as const satisfies ReadonlyArray<PushPriority>;

export const PUSH_WORK_ITEM_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSURE_REQUESTED',
  'CLOSURE_CONFIRMED',
] as const satisfies ReadonlyArray<PushWorkItemStatus>;

export const CLOSURE_LOOP_STATES = [
  'AWAITING_TEAM_RESPONSE',
  'TEAM_RESPONDED',
  'CLOSURE_CONFIRMATION_REQUESTED',
  'PER_CLOSURE_CONFIRMED',
  'AUTO_CLOSE_BLOCKED',
] as const satisfies ReadonlyArray<ClosureLoopState>;

export const PUSH_ORIGIN_ROLES = [
  'PORTFOLIO_EXECUTIVE_REVIEWER',
] as const satisfies ReadonlyArray<PushOriginRole>;

export const PUSH_ACTIVITY_EVENTS = [
  'PUSH_CREATED',
  'FOLLOW_UP_RESOLVED',
  'REVIEW_CLOSURE_CONFIRMED',
] as const satisfies ReadonlyArray<PushActivityEvent>;

export const PUSH_VISIBILITIES = [
  'REVIEW_CIRCLE_BEFORE_PUSH',
  'PROJECT_TEAM_AFTER_PUSH',
] as const satisfies ReadonlyArray<PushVisibility>;

export const PUSH_ASSIGNEE_DEFAULTS = [
  'PROJECT_MANAGER',
] as const satisfies ReadonlyArray<PushAssigneeDefault>;

// -- Label Maps -------------------------------------------------------------------

export const PUSH_WORK_ITEM_STATUS_LABELS: Readonly<Record<PushWorkItemStatus, string>> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CLOSURE_REQUESTED: 'Closure Requested',
  CLOSURE_CONFIRMED: 'Closure Confirmed',
};

export const CLOSURE_LOOP_STATE_LABELS: Readonly<Record<ClosureLoopState, string>> = {
  AWAITING_TEAM_RESPONSE: 'Awaiting Team Response',
  TEAM_RESPONDED: 'Team Responded',
  CLOSURE_CONFIRMATION_REQUESTED: 'Closure Confirmation Requested',
  PER_CLOSURE_CONFIRMED: 'PER Closure Confirmed',
  AUTO_CLOSE_BLOCKED: 'Auto-Close Blocked',
};

export const PUSH_ACTIVITY_EVENT_LABELS: Readonly<Record<PushActivityEvent, string>> = {
  PUSH_CREATED: 'Push Created',
  FOLLOW_UP_RESOLVED: 'Follow-Up Resolved',
  REVIEW_CLOSURE_CONFIRMED: 'Review Closure Confirmed',
};

// -- Closure Loop Transitions -----------------------------------------------------

export const PUSH_CLOSURE_LOOP_TRANSITIONS: ReadonlyArray<{ readonly from: ClosureLoopState; readonly to: ClosureLoopState }> = [
  { from: 'AWAITING_TEAM_RESPONSE', to: 'TEAM_RESPONDED' },
  { from: 'TEAM_RESPONDED', to: 'CLOSURE_CONFIRMATION_REQUESTED' },
  { from: 'CLOSURE_CONFIRMATION_REQUESTED', to: 'PER_CLOSURE_CONFIRMED' },
  { from: 'CLOSURE_CONFIRMATION_REQUESTED', to: 'AUTO_CLOSE_BLOCKED' },
  { from: 'AUTO_CLOSE_BLOCKED', to: 'CLOSURE_CONFIRMATION_REQUESTED' },
];

// -- Auto-Close Prevention Rules --------------------------------------------------

export const PUSH_AUTO_CLOSE_PREVENTION_RULES: ReadonlyArray<IPushAutoClosePreventionRule> = [
  { ruleId: 'no-auto-close', description: 'Work queue item MUST NOT auto-close review artifact without PER confirmation', autoCloseAllowed: false, requiresPerConfirmation: true },
  { ruleId: 'no-artifact-conversion', description: 'Push creates separate work item; original review thread is not converted or absorbed', autoCloseAllowed: false, requiresPerConfirmation: true },
  { ruleId: 'no-thread-absorption', description: 'Original executive review thread remains a separate artifact after push', autoCloseAllowed: false, requiresPerConfirmation: true },
];

// -- Activity Spine Event Definitions ---------------------------------------------

export const PUSH_ACTIVITY_SPINE_EVENT_DEFINITIONS: ReadonlyArray<{ readonly event: PushActivityEvent; readonly description: string }> = [
  { event: 'PUSH_CREATED', description: 'PER pushed review item to project team work queue' },
  { event: 'FOLLOW_UP_RESOLVED', description: 'Project team marked pushed follow-up item as resolved' },
  { event: 'REVIEW_CLOSURE_CONFIRMED', description: 'PER confirmed closure of originating review artifact' },
];

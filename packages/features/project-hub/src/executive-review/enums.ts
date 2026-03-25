/**
 * Stage 8.4 executive-review enumerations.
 * Push-to-Project-Team action, closure loop, activity events.
 */

// -- Push Payload Mode ------------------------------------------------------------

export type PushPayloadMode = 'CURATED_SUMMARY' | 'FULL_CONTEXT';

// -- Push Priority ----------------------------------------------------------------

export type PushPriority = 'SOON' | 'NOW';

// -- Push Work Item Status --------------------------------------------------------

export type PushWorkItemStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSURE_REQUESTED'
  | 'CLOSURE_CONFIRMED';

// -- Closure Loop State -----------------------------------------------------------

export type ClosureLoopState =
  | 'AWAITING_TEAM_RESPONSE'
  | 'TEAM_RESPONDED'
  | 'CLOSURE_CONFIRMATION_REQUESTED'
  | 'PER_CLOSURE_CONFIRMED'
  | 'AUTO_CLOSE_BLOCKED';

// -- Push Origin Role -------------------------------------------------------------

export type PushOriginRole = 'PORTFOLIO_EXECUTIVE_REVIEWER';

// -- Push Activity Event ----------------------------------------------------------

export type PushActivityEvent =
  | 'PUSH_CREATED'
  | 'FOLLOW_UP_RESOLVED'
  | 'REVIEW_CLOSURE_CONFIRMED';

// -- Push Visibility --------------------------------------------------------------

export type PushVisibility = 'REVIEW_CIRCLE_BEFORE_PUSH' | 'PROJECT_TEAM_AFTER_PUSH';

// -- Push Assignee Default --------------------------------------------------------

export type PushAssigneeDefault = 'PROJECT_MANAGER';

// -- Stage 8.5 Lane Depth Enforcement Enums --------------------------------------

/** Review lane depth per P3-G1 §4.9. */
export type ReviewLaneDepth = 'PWA_FULL' | 'SPFX_BROAD' | 'SPFX_ESCALATE_TO_PWA';

/** Review capability per P3-G1 §4.9. */
export type ReviewCapability =
  | 'VIEW_SURFACES'
  | 'PLACE_ANNOTATIONS'
  | 'GENERATE_REVIEWER_RUNS'
  | 'PUSH_TO_TEAM'
  | 'CONFIRM_CLOSURE'
  | 'THREAD_MANAGEMENT'
  | 'MULTI_RUN_COMPARISON'
  | 'REVIEW_HISTORY_BROWSING'
  | 'EXECUTIVE_REVIEW_CATALOG';

/** SPFx escalation trigger cases per P3-G2 §8.8. */
export type EscalationTriggerCase =
  | 'THREAD_MANAGEMENT'
  | 'MULTI_RUN_COMPARISON'
  | 'FULL_HISTORY_BROWSING';

/** Escalation deep-link view per P3-G2 §8.8. */
export type EscalationDeepLinkView = 'THREAD' | 'COMPARE' | 'HISTORY';

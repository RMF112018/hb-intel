import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  PUSH_PAYLOAD_MODES,
  PUSH_PRIORITIES,
  PUSH_WORK_ITEM_STATUSES,
  CLOSURE_LOOP_STATES,
  PUSH_ORIGIN_ROLES,
  PUSH_ACTIVITY_EVENTS,
  PUSH_VISIBILITIES,
  PUSH_ASSIGNEE_DEFAULTS,
  // Label maps
  PUSH_WORK_ITEM_STATUS_LABELS,
  CLOSURE_LOOP_STATE_LABELS,
  PUSH_ACTIVITY_EVENT_LABELS,
  // Definition arrays
  PUSH_CLOSURE_LOOP_TRANSITIONS,
  PUSH_AUTO_CLOSE_PREVENTION_RULES,
  PUSH_ACTIVITY_SPINE_EVENT_DEFINITIONS,
  // Business rules
  canPerPushToTeam,
  canWorkQueueAutoCloseReviewArtifact,
  isReviewArtifactConvertedByPush,
  isPushItemSeparateFromReviewThread,
  getDefaultPushAssignee,
  getDefaultPushPriority,
  isClosureLoopRequired,
  canTeamResponseAutoCloseReview,
  isValidClosureLoopTransition,
  requiresPerConfirmationForClosure,
  isPushProvenanceComplete,
  getWorkItemClassForPush,
  getWorkItemSourceForPush,
  getOriginatingModuleForPush,
} from '../index.js';

import type {
  IPushToTeamAction,
  IPushWorkItem,
  IClosureLoopRecord,
  IPushProvenanceContract,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('Stage 8.4 executive-review — contract stability', () => {
  // -- Enum array lengths -------------------------------------------------------

  it('PUSH_PAYLOAD_MODES has 2 entries', () => {
    expect(PUSH_PAYLOAD_MODES).toHaveLength(2);
  });

  it('PUSH_PRIORITIES has 2 entries', () => {
    expect(PUSH_PRIORITIES).toHaveLength(2);
  });

  it('PUSH_WORK_ITEM_STATUSES has 5 entries', () => {
    expect(PUSH_WORK_ITEM_STATUSES).toHaveLength(5);
  });

  it('CLOSURE_LOOP_STATES has 5 entries', () => {
    expect(CLOSURE_LOOP_STATES).toHaveLength(5);
  });

  it('PUSH_ORIGIN_ROLES has 1 entry', () => {
    expect(PUSH_ORIGIN_ROLES).toHaveLength(1);
  });

  it('PUSH_ACTIVITY_EVENTS has 3 entries', () => {
    expect(PUSH_ACTIVITY_EVENTS).toHaveLength(3);
  });

  it('PUSH_VISIBILITIES has 2 entries', () => {
    expect(PUSH_VISIBILITIES).toHaveLength(2);
  });

  it('PUSH_ASSIGNEE_DEFAULTS has 1 entry', () => {
    expect(PUSH_ASSIGNEE_DEFAULTS).toHaveLength(1);
  });

  // -- Label map key counts -----------------------------------------------------

  it('PUSH_WORK_ITEM_STATUS_LABELS has 5 keys', () => {
    expect(Object.keys(PUSH_WORK_ITEM_STATUS_LABELS)).toHaveLength(5);
  });

  it('CLOSURE_LOOP_STATE_LABELS has 5 keys', () => {
    expect(Object.keys(CLOSURE_LOOP_STATE_LABELS)).toHaveLength(5);
  });

  it('PUSH_ACTIVITY_EVENT_LABELS has 3 keys', () => {
    expect(Object.keys(PUSH_ACTIVITY_EVENT_LABELS)).toHaveLength(3);
  });

  // -- Definition array lengths -------------------------------------------------

  it('PUSH_CLOSURE_LOOP_TRANSITIONS has 5 entries', () => {
    expect(PUSH_CLOSURE_LOOP_TRANSITIONS).toHaveLength(5);
  });

  it('PUSH_AUTO_CLOSE_PREVENTION_RULES has 3 entries', () => {
    expect(PUSH_AUTO_CLOSE_PREVENTION_RULES).toHaveLength(3);
  });

  it('PUSH_ACTIVITY_SPINE_EVENT_DEFINITIONS has 3 entries', () => {
    expect(PUSH_ACTIVITY_SPINE_EVENT_DEFINITIONS).toHaveLength(3);
  });

  // -- Auto-close rules enforcement ---------------------------------------------

  it('all auto-close prevention rules have autoCloseAllowed false and requiresPerConfirmation true', () => {
    for (const rule of PUSH_AUTO_CLOSE_PREVENTION_RULES) {
      expect(rule.autoCloseAllowed).toBe(false);
      expect(rule.requiresPerConfirmation).toBe(true);
    }
  });

  // -- Type checks (compile-time + runtime shape) -------------------------------

  it('IPushToTeamAction shape is assignable', () => {
    const action: IPushToTeamAction = {
      pushActionId: 'pa-1',
      projectId: 'proj-1',
      pusherId: 'user-1',
      originAnnotationId: 'ann-1',
      originReviewRunId: null,
      pushTimestamp: '2026-03-25T00:00:00Z',
      payloadMode: 'CURATED_SUMMARY',
      priority: 'SOON',
      curatedSummary: 'Summary text',
      fullContextIncluded: false,
      assigneeUserId: 'user-2',
      assigneeRole: 'PM',
      visibility: 'PROJECT_TEAM_AFTER_PUSH',
    };
    expect(action.pushActionId).toBe('pa-1');
  });

  it('IPushWorkItem shape is assignable', () => {
    const item: IPushWorkItem = {
      workItemId: 'wi-1',
      pushActionId: 'pa-1',
      projectId: 'proj-1',
      workItemClass: 'queued-follow-up',
      workItemSource: 'module',
      originatingModule: 'executive-review',
      status: 'OPEN',
      assignedToUserId: 'user-2',
      createdAt: '2026-03-25T00:00:00Z',
      resolvedAt: null,
    };
    expect(item.workItemClass).toBe('queued-follow-up');
  });

  it('IClosureLoopRecord shape is assignable', () => {
    const record: IClosureLoopRecord = {
      closureLoopId: 'cl-1',
      pushWorkItemId: 'wi-1',
      originAnnotationId: null,
      state: 'AWAITING_TEAM_RESPONSE',
      teamRespondedAt: null,
      teamRespondedByUserId: null,
      closureRequestedAt: null,
      perConfirmedAt: null,
      perConfirmedByUserId: null,
      autoCloseBlocked: false,
    };
    expect(record.state).toBe('AWAITING_TEAM_RESPONSE');
  });

  it('IPushProvenanceContract shape is assignable', () => {
    const provenance: IPushProvenanceContract = {
      originRole: 'PORTFOLIO_EXECUTIVE_REVIEWER',
      originAnnotationId: 'ann-1',
      originReviewRunId: null,
      pushTimestamp: '2026-03-25T00:00:00Z',
      isSeparateArtifact: true,
      isReviewArtifactConverted: false,
    };
    expect(provenance.originRole).toBe('PORTFOLIO_EXECUTIVE_REVIEWER');
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('Stage 8.4 executive-review — business rules', () => {
  it('canPerPushToTeam returns true', () => {
    expect(canPerPushToTeam()).toBe(true);
  });

  it('canWorkQueueAutoCloseReviewArtifact returns false', () => {
    expect(canWorkQueueAutoCloseReviewArtifact()).toBe(false);
  });

  it('isReviewArtifactConvertedByPush returns false', () => {
    expect(isReviewArtifactConvertedByPush()).toBe(false);
  });

  it('isPushItemSeparateFromReviewThread returns true', () => {
    expect(isPushItemSeparateFromReviewThread()).toBe(true);
  });

  it('getDefaultPushAssignee returns PROJECT_MANAGER', () => {
    expect(getDefaultPushAssignee()).toBe('PROJECT_MANAGER');
  });

  it('getDefaultPushPriority returns SOON', () => {
    expect(getDefaultPushPriority()).toBe('SOON');
  });

  it('isClosureLoopRequired returns true', () => {
    expect(isClosureLoopRequired()).toBe(true);
  });

  it('canTeamResponseAutoCloseReview returns false', () => {
    expect(canTeamResponseAutoCloseReview()).toBe(false);
  });

  it('requiresPerConfirmationForClosure returns true', () => {
    expect(requiresPerConfirmationForClosure()).toBe(true);
  });

  it('getWorkItemClassForPush returns queued-follow-up', () => {
    expect(getWorkItemClassForPush()).toBe('queued-follow-up');
  });

  it('getWorkItemSourceForPush returns module', () => {
    expect(getWorkItemSourceForPush()).toBe('module');
  });

  it('getOriginatingModuleForPush returns executive-review', () => {
    expect(getOriginatingModuleForPush()).toBe('executive-review');
  });

  // -- Closure loop transitions -------------------------------------------------

  it('AWAITING_TEAM_RESPONSE -> TEAM_RESPONDED is valid', () => {
    expect(isValidClosureLoopTransition('AWAITING_TEAM_RESPONSE', 'TEAM_RESPONDED')).toBe(true);
  });

  it('TEAM_RESPONDED -> CLOSURE_CONFIRMATION_REQUESTED is valid', () => {
    expect(isValidClosureLoopTransition('TEAM_RESPONDED', 'CLOSURE_CONFIRMATION_REQUESTED')).toBe(true);
  });

  it('CLOSURE_CONFIRMATION_REQUESTED -> PER_CLOSURE_CONFIRMED is valid', () => {
    expect(isValidClosureLoopTransition('CLOSURE_CONFIRMATION_REQUESTED', 'PER_CLOSURE_CONFIRMED')).toBe(true);
  });

  it('AWAITING_TEAM_RESPONSE -> PER_CLOSURE_CONFIRMED is invalid', () => {
    expect(isValidClosureLoopTransition('AWAITING_TEAM_RESPONSE', 'PER_CLOSURE_CONFIRMED')).toBe(false);
  });

  it('PER_CLOSURE_CONFIRMED -> AWAITING_TEAM_RESPONSE is invalid', () => {
    expect(isValidClosureLoopTransition('PER_CLOSURE_CONFIRMED', 'AWAITING_TEAM_RESPONSE')).toBe(false);
  });

  // -- Provenance completeness --------------------------------------------------

  it('isPushProvenanceComplete returns true for valid provenance', () => {
    const provenance: IPushProvenanceContract = {
      originRole: 'PORTFOLIO_EXECUTIVE_REVIEWER',
      originAnnotationId: 'ann-1',
      originReviewRunId: null,
      pushTimestamp: '2026-03-25T00:00:00Z',
      isSeparateArtifact: true,
      isReviewArtifactConverted: false,
    };
    expect(isPushProvenanceComplete(provenance)).toBe(true);
  });

  it('isPushProvenanceComplete returns false when originRole is missing', () => {
    const provenance = {
      originRole: '' as 'PORTFOLIO_EXECUTIVE_REVIEWER',
      originAnnotationId: null,
      originReviewRunId: null,
      pushTimestamp: '2026-03-25T00:00:00Z',
      isSeparateArtifact: true,
      isReviewArtifactConverted: false,
    } as IPushProvenanceContract;
    expect(isPushProvenanceComplete(provenance)).toBe(false);
  });

  it('isPushProvenanceComplete returns false when pushTimestamp is empty', () => {
    const provenance: IPushProvenanceContract = {
      originRole: 'PORTFOLIO_EXECUTIVE_REVIEWER',
      originAnnotationId: null,
      originReviewRunId: null,
      pushTimestamp: '',
      isSeparateArtifact: true,
      isReviewArtifactConverted: false,
    };
    expect(isPushProvenanceComplete(provenance)).toBe(false);
  });

  it('isPushProvenanceComplete returns false when isReviewArtifactConverted is true', () => {
    const provenance: IPushProvenanceContract = {
      originRole: 'PORTFOLIO_EXECUTIVE_REVIEWER',
      originAnnotationId: null,
      originReviewRunId: null,
      pushTimestamp: '2026-03-25T00:00:00Z',
      isSeparateArtifact: true,
      isReviewArtifactConverted: true,
    };
    expect(isPushProvenanceComplete(provenance)).toBe(false);
  });
});

/**
 * Domain queryFn implementations for BIC source registrations.
 *
 * P2-C1 "Publishing" band requires sources to "emit real hub items into
 * @hbc/my-work-feed on at least one real route." These queryFns produce
 * representative mock items using each source's BIC item shape so the
 * hub feed is exercisable in development. Each queryFn is a clear seam
 * for real domain API integration — replace the mock data with actual
 * API calls when the domain clients are ready.
 *
 * Pattern: Each queryFn returns IBicRegisteredItem[] with correct
 * itemKey, moduleKey, moduleLabel, state, href, and title.
 */
import type { IBicRegisteredItem, IBicNextMoveState } from '@hbc/bic-next-move';

function buildState(overrides: Partial<IBicNextMoveState> = {}): IBicNextMoveState {
  return {
    currentOwner: { userId: 'current-user', displayName: 'Current User', role: 'Owner' },
    expectedAction: 'Review and take action',
    dueDate: null,
    isOverdue: false,
    isBlocked: false,
    blockedReason: null,
    previousOwner: null,
    nextOwner: null,
    escalationOwner: null,
    transferHistory: [],
    urgencyTier: 'watch',
    ...overrides,
  };
}

/** Estimating Bid Readiness — pursuits needing readiness attention. */
export function createEstimatingQueryFn(): (userId: string) => Promise<IBicRegisteredItem[]> {
  return async (_userId) => [
    {
      itemKey: 'estimating-pursuit::pursuit-001',
      moduleKey: 'estimating-pursuit',
      moduleLabel: 'Estimating Bid Readiness',
      title: 'Harbor View Medical Center — Bid Readiness',
      href: '/estimating?itemId=pursuit-001',
      state: buildState({
        expectedAction: 'Resolve 2 readiness blockers before bid deadline',
        urgencyTier: 'immediate',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      }),
    },
    {
      itemKey: 'estimating-pursuit::pursuit-002',
      moduleKey: 'estimating-pursuit',
      moduleLabel: 'Estimating Bid Readiness',
      title: 'Riverside Office Complex — Bid Readiness',
      href: '/estimating?itemId=pursuit-002',
      state: buildState({
        expectedAction: 'Review cost section completeness',
        urgencyTier: 'watch',
      }),
    },
  ];
}

/** BD Score Benchmark — scorecards needing review or consensus. */
export function createBdScoreBenchmarkQueryFn(): (userId: string) => Promise<IBicRegisteredItem[]> {
  return async (_userId) => [
    {
      itemKey: 'bd-scorecard::sc-001',
      moduleKey: 'bd-scorecard',
      moduleLabel: 'BD Score Benchmark',
      title: 'Downtown Transit Hub — Score Review',
      href: '/scorecard?itemId=sc-001',
      state: buildState({
        expectedAction: 'Review updated consensus score',
        urgencyTier: 'watch',
      }),
    },
    {
      itemKey: 'bd-scorecard::sc-002',
      moduleKey: 'bd-scorecard',
      moduleLabel: 'BD Score Benchmark',
      title: 'Airport Terminal Expansion — No-Bid Decision',
      href: '/scorecard?itemId=sc-002',
      state: buildState({
        expectedAction: 'Acknowledge no-bid recommendation',
        urgencyTier: 'immediate',
        isBlocked: true,
        blockedReason: 'Awaiting VP approval for no-bid decision',
      }),
    },
  ];
}

/** BD Strategic Intelligence — entries needing approval or review. */
export function createBdStrategicIntelligenceQueryFn(): (userId: string) => Promise<IBicRegisteredItem[]> {
  return async (_userId) => [
    {
      itemKey: 'bd-department-sections::si-001',
      moduleKey: 'bd-department-sections',
      moduleLabel: 'BD Strategic Intelligence',
      title: 'Healthcare Market Entry Strategy — Approval Needed',
      href: '/business-development?itemId=si-001',
      state: buildState({
        expectedAction: 'Approve strategic intelligence entry',
        urgencyTier: 'immediate',
      }),
    },
  ];
}

/** Project Health Pulse — projects requiring health attention. */
export function createHealthPulseQueryFn(): (userId: string) => Promise<IBicRegisteredItem[]> {
  return async (_userId) => [
    {
      itemKey: 'project-hub-pmp::proj-001',
      moduleKey: 'project-hub-pmp',
      moduleLabel: 'Project Health Pulse',
      title: 'Harbor View Medical Center — Health Pulse',
      href: '/project-hub?projectId=proj-001&view=health',
      state: buildState({
        expectedAction: 'Review critical cost dimension and compound risk',
        urgencyTier: 'immediate',
        isBlocked: true,
        blockedReason: 'Compound risk affecting office dimension',
      }),
    },
    {
      itemKey: 'project-hub-pmp::proj-002',
      moduleKey: 'project-hub-pmp',
      moduleLabel: 'Project Health Pulse',
      title: 'Riverside Office Complex — Health Pulse',
      href: '/project-hub?projectId=proj-002&view=health',
      state: buildState({
        expectedAction: 'Monitor field dimension trend',
        urgencyTier: 'watch',
      }),
    },
    {
      itemKey: 'project-hub-pmp::proj-003',
      moduleKey: 'project-hub-pmp',
      moduleLabel: 'Project Health Pulse',
      title: 'Downtown Transit Hub — Health Pulse',
      href: '/project-hub?projectId=proj-003&view=health',
      state: buildState({
        expectedAction: 'No action needed — all dimensions healthy',
        urgencyTier: 'upcoming',
      }),
    },
  ];
}

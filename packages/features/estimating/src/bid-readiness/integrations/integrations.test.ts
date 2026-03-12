import { describe, expect, it } from 'vitest';

import {
  mapHealthIndicatorStateToBidReadinessView,
  mapPursuitToHealthIndicatorItem,
} from '../adapters/index.js';
import {
  createBidReadinessReferenceIntegrations,
  createBidReadinessVersionedSnapshot,
  gateBidReadinessByComplexity,
  projectBidReadinessToBicNextMove,
  resolveBidReadinessApprovalAuthority,
  resolveBidReadinessNotifications,
} from './index.js';

function createViewState() {
  const state = mapPursuitToHealthIndicatorItem({
    pursuitId: 'p-t07',
    dueAt: '2026-03-13T00:00:00.000Z',
    costSectionsPopulated: false,
    bidBondConfirmed: true,
    addendaAcknowledged: false,
    subcontractorCoverageMet: false,
    bidDocumentsAttached: true,
    ceSignOff: false,
    version: {
      recordId: 'p-t07',
      version: 7,
      updatedAt: '2026-03-12T00:00:00.000Z',
      updatedBy: 'estimator@example.com',
      source: 'unit-test',
      correlationId: 'corr-t07',
    },
  });

  return mapHealthIndicatorStateToBidReadinessView(state);
}

describe('sf18T07Integrations', () => {
  it('initializes deterministic integration adapter registry shape', () => {
    const registry = createBidReadinessReferenceIntegrations();

    expect(typeof registry.projectToBicNextMove).toBe('function');
    expect(typeof registry.resolveNotifications).toBe('function');
    expect(typeof registry.createVersionedSnapshot).toBe('function');
    expect(typeof registry.applyComplexityGating).toBe('function');
    expect(typeof registry.resolveApprovalAuthority).toBe('function');
  });

  it('projects deterministic BIC next-move outputs and includes readiness recommendations', () => {
    const viewState = createViewState();
    const projection = projectBidReadinessToBicNextMove({
      pursuitId: 'p-t07',
      viewState,
      generatedAt: '2026-03-12T10:00:00.000Z',
      maxActions: 4,
    });

    expect(projection.reason).toBe('derived');
    expect(projection.actions.length).toBeGreaterThan(0);
    expect(projection.actions[0].sourceType).toBe('blocker');
    expect(
      projection.actions.some((action) => action.sourceType === 'recommendation'),
    ).toBe(true);
  });

  it('covers BIC comparator tie-breaks and max-action clamping branch', () => {
    const base = createViewState();
    const viewState = {
      ...base,
      criteria: base.criteria.map((entry, index) => ({
        ...entry,
        criterion: {
          ...entry.criterion,
          isBlocker: index < 2 ? true : entry.criterion.isBlocker,
          weight: index < 2 ? 20 : entry.criterion.weight,
          label: index === 0 ? 'A blocker' : index === 1 ? 'B blocker' : entry.criterion.label,
        },
        isComplete: index < 2 ? false : entry.isComplete,
      })),
      summary: {
        ...base.summary,
        recommendations: [
          {
            recommendationId: 'r1',
            category: 'coverage-improvement',
            priority: 'high',
            title: 'Alpha',
            summary: 'alpha',
            actions: [{ actionId: 'same-action', label: 'Alpha action', actionHref: '/a' }],
          },
          {
            recommendationId: 'r2',
            category: 'coverage-improvement',
            priority: 'high',
            title: 'Beta',
            summary: 'beta',
            actions: [{ actionId: 'same-action', label: 'Beta action', actionHref: '/b' }],
          },
        ],
      },
    };

    const projection = projectBidReadinessToBicNextMove({
      pursuitId: 'p-tie-break',
      viewState,
      generatedAt: '2026-03-12T10:00:00.000Z',
      maxActions: -1,
    });

    expect(projection.actions).toHaveLength(0);
  });

  it('returns error-safe fallback outputs for missing view state', () => {
    const bic = projectBidReadinessToBicNextMove({
      pursuitId: 'p-none',
      viewState: null,
      generatedAt: '2026-03-12T10:00:00.000Z',
    });
    const notifications = resolveBidReadinessNotifications({
      pursuitId: 'p-none',
      nextViewState: null,
      createdAt: '2026-03-12T10:00:00.000Z',
    });
    const snapshot = createBidReadinessVersionedSnapshot({
      pursuitId: 'p-none',
      viewState: null,
      createdAt: '2026-03-12T10:00:00.000Z',
    });
    const approval = resolveBidReadinessApprovalAuthority(null);

    expect(bic.reason).toBe('no-view-state');
    expect(bic.actions).toHaveLength(0);
    expect(notifications).toHaveLength(0);
    expect(snapshot.payload.status).toBe('unavailable');
    expect(snapshot.snapshotId).toContain('unavailable');
    expect(approval.decision).toBe('pending');
  });

  it('applies governance filtering and complexity gating deterministically', () => {
    const viewState = createViewState();
    const draftView = {
      ...viewState,
      summary: {
        ...viewState.summary,
        governance: {
          ...viewState.summary.governance,
          governanceState: 'draft' as const,
        },
      },
    };

    const essential = gateBidReadinessByComplexity({
      viewState: draftView,
      complexity: 'Essential',
      audience: 'canvas',
    });

    const standard = gateBidReadinessByComplexity({
      viewState: draftView,
      complexity: 'Standard',
      audience: 'governance',
    });

    expect(essential.criteria).toHaveLength(0);
    expect(essential.recommendations).toHaveLength(0);
    expect(standard.governanceFiltered).toBe(true);
    expect(standard.recommendations).toHaveLength(0);
    expect(standard.hiddenCriteriaCount).toBeGreaterThanOrEqual(0);
  });

  it('covers additional complexity gating branches (null, standard, expert, admin)', () => {
    const viewState = createViewState();
    const allCompleteNonBlockers = {
      ...viewState,
      criteria: viewState.criteria.map((entry) => ({
        ...entry,
        isComplete: true,
        criterion: {
          ...entry.criterion,
          isBlocker: false,
        },
      })),
    };

    const none = gateBidReadinessByComplexity({
      viewState: null,
      complexity: 'Standard',
    });
    const standard = gateBidReadinessByComplexity({
      viewState,
      complexity: 'Standard',
      audience: 'canvas',
    });
    const expert = gateBidReadinessByComplexity({
      viewState,
      complexity: 'Expert',
      audience: 'admin',
    });
    const standardAllComplete = gateBidReadinessByComplexity({
      viewState: allCompleteNonBlockers,
      complexity: 'Standard',
      audience: 'admin',
    });

    expect(none.criteria).toHaveLength(0);
    expect(standard.criteria.length).toBeLessThanOrEqual(viewState.criteria.length);
    expect(expert.criteria.length).toBe(viewState.criteria.length);
    expect(standardAllComplete.criteria).toHaveLength(0);
    expect(standardAllComplete.governanceFiltered).toBe(false);
  });

  it('resolves transition notifications and approval authority from readiness state', () => {
    const previous = createViewState();
    const next = {
      ...previous,
      status: 'ready' as const,
      score: 96,
      criteria: previous.criteria.map((item) => ({
        ...item,
        isComplete: true,
      })),
    };

    const notifications = resolveBidReadinessNotifications({
      pursuitId: 'p-t07',
      previousViewState: previous,
      nextViewState: next,
      createdAt: '2026-03-12T10:00:00.000Z',
    });
    const approval = resolveBidReadinessApprovalAuthority(next);
    const snapshot = createBidReadinessVersionedSnapshot({
      pursuitId: 'p-t07',
      viewState: next,
      createdAt: '2026-03-12T10:00:00.000Z',
    });

    expect(notifications.some((item) => item.type === 'state-transition')).toBe(true);
    expect(notifications.every((item) => item.traceId === next.summary.governance.traceId)).toBe(true);
    expect(snapshot.governanceTraceId).toBe(next.summary.governance.traceId);
    expect(approval.requirements.length).toBe(3);
    expect(['approved', 'pending', 'blocked']).toContain(approval.decision);
  });

  it('covers non-near-term notification and approval branch paths', () => {
    const viewState = createViewState();
    const readyNoBlockers = {
      ...viewState,
      status: 'ready' as const,
      isOverdue: false,
      daysUntilDue: 20,
      criteria: viewState.criteria.map((entry) => ({ ...entry, isComplete: true })),
    };

    const notifications = resolveBidReadinessNotifications({
      pursuitId: 'p-t07',
      previousViewState: readyNoBlockers,
      nextViewState: readyNoBlockers,
      createdAt: '2026-03-12T10:00:00.000Z',
    });
    const approval = resolveBidReadinessApprovalAuthority(readyNoBlockers);

    expect(notifications).toHaveLength(0);
    expect(approval.decision).toBe('approved');
    expect(approval.requirements.every((requirement) => requirement.satisfied)).toBe(true);
  });

  it('covers overdue and no-daysUntilDue notification branches', () => {
    const viewState = createViewState();
    const overdue = {
      ...viewState,
      isOverdue: true,
      daysUntilDue: -1,
    };
    const unknownDue = {
      ...viewState,
      isOverdue: false,
      daysUntilDue: null,
    };

    const overdueNotifications = resolveBidReadinessNotifications({
      pursuitId: 'p-overdue',
      previousViewState: null,
      nextViewState: overdue,
      createdAt: '2026-03-12T10:00:00.000Z',
    });
    const unknownDueNotifications = resolveBidReadinessNotifications({
      pursuitId: 'p-unknown-due',
      previousViewState: null,
      nextViewState: unknownDue,
      createdAt: '2026-03-12T10:00:00.000Z',
    });

    expect(overdueNotifications.some((item) => item.type === 'due-window')).toBe(true);
    expect(unknownDueNotifications.some((item) => item.type === 'due-window')).toBe(false);
  });
});

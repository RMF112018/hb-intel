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

    expect(notifications.some((item) => item.type === 'state-transition')).toBe(true);
    expect(approval.requirements.length).toBe(3);
    expect(['approved', 'pending', 'blocked']).toContain(approval.decision);
  });
});

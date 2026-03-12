import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import { useBenchmarkDecisionSupport, useScoreBenchmarkState } from './index.js';
import {
  createMockBenchmarkFilterContext,
  createMockScoreGhostOverlayState,
  mockScoreBenchmarkStates,
} from '../../testing/index.js';

const reviewerContext = {
  reviewerId: 'edge-reviewer',
  role: 'business-development' as const,
};

describe('score benchmark state edge cases', () => {
  it('returns error state and saved-local badge when API throws', () => {
    const state = useScoreBenchmarkState(
      {
        entityId: 'entity-error',
        filterContext: createMockBenchmarkFilterContext(),
        reviewerContext,
      },
      {
        api: {
          getOverlayState: () => {
            throw new Error('mock failure');
          },
        } as unknown as ScoreBenchmarkApi,
      }
    );

    expect(state.status).toBe('error');
    expect(state.sync.badgeLabel).toBe('Saved locally');
    const replayed = state.actions.replayQueuedMutations();
    expect(replayed.status).toBe('error');
  });

  it('queues no-bid rationale and recommendation override with replay-safe sync flow', () => {
    const overlay = {
      ...mockScoreBenchmarkStates.recommendationNoBid,
      version: {
        ...mockScoreBenchmarkStates.recommendationNoBid.version,
        snapshotId: 'entity-no-bid',
      },
    };
    const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default'] });

    const decisionSupport = useBenchmarkDecisionSupport(
      {
        entityId: 'entity-no-bid',
        filterContext: createMockBenchmarkFilterContext(),
        reviewerContext,
      },
      { api }
    );

    expect(() => decisionSupport.actions.queueNoBidRationaleSave('approver-1')).toThrow(/cannot be empty/);

    decisionSupport.actions.setNoBidRationaleDraft('Governed rationale text with citations.');
    const saved = decisionSupport.actions.queueNoBidRationaleSave('approver-1');
    expect(saved.entityId).toBe('entity-no-bid');

    const queuedState = decisionSupport.actions.queueRecommendationOverride('Escalate due to overlap.');
    expect(queuedState.sync.badgeLabel).toBe('Queued to sync');
    const replayed = queuedState.actions.replayQueuedMutations();
    expect(replayed.sync.badgeLabel).toBe('Synced');
  });

  it('computes stale and governance-warning metadata from canonical states', () => {
    const staleOverlay = {
      ...mockScoreBenchmarkStates.staleBenchmarkTimestamp,
      version: {
        ...mockScoreBenchmarkStates.staleBenchmarkTimestamp.version,
        snapshotId: 'entity-stale',
      },
    };
    const warningOverlay = {
      ...createMockScoreGhostOverlayState(),
      filterGovernanceEvents: mockScoreBenchmarkStates.filterGovernanceWarningTriggered.filterGovernanceEvents,
      version: {
        ...createMockScoreGhostOverlayState().version,
        snapshotId: 'entity-warning',
      },
    };

    const staleApi = new ScoreBenchmarkApi({ overlays: [staleOverlay], approvedCohorts: ['default'] });
    const warningApi = new ScoreBenchmarkApi({ overlays: [warningOverlay], approvedCohorts: ['default'] });

    const stale = useScoreBenchmarkState(
      {
        entityId: 'entity-stale',
        filterContext: createMockBenchmarkFilterContext(),
        reviewerContext,
      },
      { api: staleApi }
    );

    const warning = useScoreBenchmarkState(
      {
        entityId: 'entity-warning',
        filterContext: createMockBenchmarkFilterContext(),
        reviewerContext,
      },
      { api: warningApi }
    );

    expect(stale.stale.isStale).toBe(false);
    expect(stale.stale.staleMs).toBeGreaterThanOrEqual(0);
    expect(warning.governanceWarning.triggered).toBe(true);
  });
});

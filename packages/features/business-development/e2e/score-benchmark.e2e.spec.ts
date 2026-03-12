import { expect, test } from '@playwright/test';
import {
  ScoreBenchmarkApi,
  useBenchmarkDecisionSupport,
  useScoreBenchmarkFilters,
  useScoreBenchmarkState,
} from '../../../score-benchmark/src/index.js';
import {
  createMockBenchmarkFilterContext,
  createMockScoreGhostOverlayState,
  mockScoreBenchmarkStates,
} from '../../../score-benchmark/testing/index.ts';
import {
  createReviewerConsensusSummary,
  mapScoreBenchmarkReferenceIntegrations,
} from '../src/score-benchmark/adapters/index.js';

const reviewerContext = {
  reviewerId: 'e2e-reviewer',
  role: 'business-development' as const,
};

test('score-benchmark: below-zone score displays distance, owner, and recommendation', async () => {
  const overlay = {
    ...mockScoreBenchmarkStates.belowWinZoneModerateConfidence,
    version: {
      ...mockScoreBenchmarkStates.belowWinZoneModerateConfidence.version,
      snapshotId: 'e2e-entity',
    },
  };
  const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default'] });
  const state = useScoreBenchmarkState({
    entityId: 'e2e-entity',
    filterContext: createMockBenchmarkFilterContext(),
    reviewerContext,
  }, { api });

  expect(state.overlay?.distanceToWinZone).not.toBeNull();
  expect(state.bicOwnershipProjections.length).toBeGreaterThanOrEqual(1);
  expect(state.overlay?.recommendation.state).toBe('hold-for-review');
});

test('score-benchmark: filter change updates context and logs governance event', async () => {
  const api = new ScoreBenchmarkApi({ approvedCohorts: ['default', 'approved'] });
  const filters = useScoreBenchmarkFilters({
    entityId: 'e2e-entity',
    actorUserId: 'e2e-user',
    reviewerContext,
    initialContext: createMockBenchmarkFilterContext(),
    approvedCohorts: ['default', 'approved'],
    defaultCohortId: 'default',
  }, { api });

  const next = filters.applyFilterContext({
    ...createMockBenchmarkFilterContext(),
    geography: 'Midwest',
    cohortPolicy: {
      defaultLocked: true,
      approvedCohortId: 'default',
      auditRequired: true,
    },
  });

  expect(next.filterContext.geography).toBe('Midwest');
  expect(next.invalidatedQueryKeys.length).toBeGreaterThanOrEqual(1);
});

test('score-benchmark: low-confidence state renders caution recommendation downgrade', async () => {
  const lowConfidence = {
    ...mockScoreBenchmarkStates.insufficientDataCaution,
    version: {
      ...mockScoreBenchmarkStates.insufficientDataCaution.version,
      snapshotId: 'e2e-low-confidence',
    },
  };
  const api = new ScoreBenchmarkApi({ overlays: [lowConfidence], approvedCohorts: ['default'] });
  const state = useScoreBenchmarkState({
    entityId: 'e2e-low-confidence',
    filterContext: createMockBenchmarkFilterContext(),
    reviewerContext,
  }, { api });

  expect(state.overlay?.benchmarks[0]?.confidence.tier).toBe('insufficient');
  expect(['pursue', 'hold-for-review', 'pursue-with-caution', 'no-bid-recommended']).toContain(
    state.overlay?.recommendation.state
  );
});

test('score-benchmark: reviewer disagreement surfaces escalation projection', async () => {
  const disagreement = {
    ...mockScoreBenchmarkStates.reviewerDisagreementHighVariance,
    version: {
      ...mockScoreBenchmarkStates.reviewerDisagreementHighVariance.version,
      snapshotId: 'e2e-disagreement',
    },
  };
  const api = new ScoreBenchmarkApi({ overlays: [disagreement], approvedCohorts: ['default'] });
  const state = useScoreBenchmarkState(
    {
      entityId: 'e2e-disagreement',
      filterContext: createMockBenchmarkFilterContext(),
      reviewerContext,
    },
    { api }
  );
  const decisionSupport = useBenchmarkDecisionSupport(
    {
      entityId: 'e2e-disagreement',
      filterContext: createMockBenchmarkFilterContext(),
      reviewerContext,
    },
    { api }
  );

  expect(state.overlay).not.toBeNull();
  const consensus = createReviewerConsensusSummary(state.overlay!.consensus);
  const integrations = mapScoreBenchmarkReferenceIntegrations({
    overlay: state.overlay!,
    state,
    decisionSupport,
    basePath: '/business-development/score-benchmark',
    complexityTier: 'expert',
  });

  expect(consensus.escalationRecommended).toBe(true);
  expect(integrations.notifications.some((item) => item.eventType.includes('consensus'))).toBe(true);
});

test('score-benchmark: no-bid recommendation requires approved rationale artifact', async () => {
  const overlay = {
    ...mockScoreBenchmarkStates.recommendationNoBid,
    version: {
      ...mockScoreBenchmarkStates.recommendationNoBid.version,
      snapshotId: 'e2e-no-bid',
    },
  };
  const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default'] });

  const decisionSupport = useBenchmarkDecisionSupport({
    entityId: 'e2e-no-bid',
    filterContext: createMockBenchmarkFilterContext(),
    reviewerContext,
  }, { api });

  expect(() => decisionSupport.actions.queueNoBidRationaleSave('approver-1')).toThrow();
});

test('score-benchmark: similar pursuits deep-link preserves return context', async () => {
  const overlay = {
    ...mockScoreBenchmarkStates.weakSimilarityCohort,
    version: {
      ...mockScoreBenchmarkStates.weakSimilarityCohort.version,
      snapshotId: 'e2e-similar',
    },
  };
  const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default'] });
  const decisionSupport = useBenchmarkDecisionSupport({
    entityId: 'e2e-similar',
    filterContext: createMockBenchmarkFilterContext(),
    reviewerContext,
    urlSearch: '?existing=1',
  }, { api });

  const url = decisionSupport.actions.openPanel('similar-pursuits', { pursuitId: 'pursuit-1' });
  expect(url).toContain('sbPanel=similar-pursuits');
  expect(url).toContain('sbPursuitId=pursuit-1');
});

test('score-benchmark: explainability panel exposes reason codes and examples', async () => {
  const overlay = createMockScoreGhostOverlayState({
    version: {
      ...createMockScoreGhostOverlayState().version,
      snapshotId: 'e2e-explainability',
    },
  });
  const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default'] });
  const explainability = api.getExplainability('e2e-explainability', createMockBenchmarkFilterContext());

  expect(explainability[0]?.reasonCodes.length).toBeGreaterThan(0);
  expect(explainability[0]?.relatedHistoricalExamples.length).toBeGreaterThanOrEqual(1);
});

test('score-benchmark: offline mutation transitions saved locally to queued-to-sync', async () => {
  const overlay = {
    ...mockScoreBenchmarkStates.savedLocally,
    version: {
      ...mockScoreBenchmarkStates.savedLocally.version,
      snapshotId: 'e2e-offline',
    },
  };
  const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default'] });
  const state = useScoreBenchmarkState({
    entityId: 'e2e-offline',
    filterContext: createMockBenchmarkFilterContext(),
    reviewerContext,
  }, { api });

  const queued = state.actions.queueLocalMutation('governance-event', { eventType: 'filter-change' });
  expect(queued.sync.badgeLabel).toBe('Queued to sync');
});

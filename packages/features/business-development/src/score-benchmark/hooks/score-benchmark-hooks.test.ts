import { describe, expect, it } from 'vitest';
import { useScoreBenchmark } from './useScoreBenchmark.js';

describe('BD score benchmark hook projections', () => {
  it('maps primitive hook state into BD projection contracts', () => {
    const result = useScoreBenchmark({
      entityId: 'entity-1',
      actorUserId: 'actor-1',
      reviewerContext: {
        reviewerId: 'reviewer-1',
        role: 'business-development',
      },
      filterContext: {
        cohortPolicy: {
          defaultLocked: false,
          approvedCohortId: 'default',
          auditRequired: true,
        },
      },
      approvedCohorts: ['default'],
      defaultCohortId: 'default',
      basePath: '/bd/score-benchmark',
    });

    expect(result.viewModel).not.toBeNull();
    expect(result.panelRoutes.similarPursuitsHref.startsWith('/bd/score-benchmark?')).toBe(true);
    expect(result.myWorkPlacement.tileKey).toBe('bic-my-items');
    expect(result.myWorkPlacement.recommendationSignal).toBe('usage-history');
    expect(result.integrations).not.toBeNull();
    expect(result.integrations?.complexity.mode).toBe('standard');
  });
});

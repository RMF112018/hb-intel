import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import { useScoreBenchmarkFilters } from './useScoreBenchmarkFilters.js';

describe('score benchmark filters', () => {
  it('normalizes value ranges and invalidates the state query key in one cycle', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['default', 'approved'] });
    const filters = useScoreBenchmarkFilters(
      {
        entityId: 'entity-1',
        actorUserId: 'actor-1',
        reviewerContext: {
          reviewerId: 'reviewer-1',
          role: 'business-development',
        },
        approvedCohorts: ['default', 'approved'],
        initialContext: {
          cohortPolicy: {
            defaultLocked: false,
            approvedCohortId: 'default',
            auditRequired: true,
          },
        },
      },
      { api },
    );

    const updated = filters.applyFilterContext({
      valueRange: [400, 100],
      cohortPolicy: {
        defaultLocked: false,
        approvedCohortId: 'approved',
        auditRequired: true,
      },
    });

    expect(updated.filterContext.valueRange).toEqual([100, 400]);
    expect(updated.invalidatedQueryKeys.length).toBe(1);
    expect(updated.invalidatedQueryKeys[0]?.[0]).toBe('score-benchmark');
  });
});

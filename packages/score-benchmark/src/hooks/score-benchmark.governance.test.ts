import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import { useScoreBenchmarkFilters } from './useScoreBenchmarkFilters.js';

describe('score benchmark governance', () => {
  it('blocks silent default cohort changes when lock policy is enabled', () => {
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
            defaultLocked: true,
            approvedCohortId: 'default',
            auditRequired: true,
          },
        },
      },
      { api },
    );

    expect(() =>
      filters.applyFilterContext({
        cohortPolicy: {
          defaultLocked: true,
          approvedCohortId: 'approved',
          auditRequired: true,
        },
      }),
    ).toThrow(/Default cohort cannot be silently changed/);
  });
});

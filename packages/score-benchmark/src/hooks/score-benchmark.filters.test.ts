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

  it('enforces approved cohort constraints and supports reset-to-default behavior', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['default', 'approved'] });
    const filters = useScoreBenchmarkFilters(
      {
        entityId: 'entity-2',
        actorUserId: 'actor-2',
        reviewerContext: {
          reviewerId: 'reviewer-2',
          role: 'operations',
        },
        approvedCohorts: ['default', 'approved'],
        defaultCohortId: 'default',
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

    expect(() =>
      filters.applyFilterContext({
        cohortPolicy: {
          defaultLocked: false,
          approvedCohortId: 'not-approved',
          auditRequired: true,
        },
      }),
    ).toThrow(/Approved cohort constraint violated/);

    const reset = filters.resetToDefaultCohort();
    expect(reset.filterContext.cohortPolicy?.approvedCohortId).toBe('default');
  });

  it('normalizes non-finite ranges and preserves update behavior for unchanged dimensions', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['default'] });
    const filters = useScoreBenchmarkFilters(
      {
        entityId: 'entity-3',
        actorUserId: 'actor-3',
        reviewerContext: {
          reviewerId: 'reviewer-3',
          role: 'operations',
        },
        approvedCohorts: ['default'],
        defaultCohortId: 'default',
        initialContext: {
          projectType: 'office',
          ownerType: 'private',
          valueRange: [100, Number.NaN],
          cohortPolicy: {
            defaultLocked: false,
            approvedCohortId: 'default',
            auditRequired: true,
          },
        },
      },
      { api },
    );

    expect(filters.filterContext.valueRange).toEqual([0, 100]);

    const unchanged = filters.applyFilterContext({
      ...filters.filterContext,
      valueRange: [0, 100],
    });
    expect(unchanged.filterContext.valueRange).toEqual([0, 100]);
    expect(unchanged.invalidatedQueryKeys.length).toBeGreaterThan(0);
  });

  it('supports default API dependency path with zero-delta governance projection', () => {
    const filters = useScoreBenchmarkFilters({
      entityId: 'entity-4',
      actorUserId: 'actor-4',
      reviewerContext: {
        reviewerId: 'reviewer-4',
        role: 'executive',
      },
      initialContext: {
        projectType: 'office',
        ownerType: 'private',
        cohortPolicy: {
          defaultLocked: false,
          approvedCohortId: 'default',
          auditRequired: true,
        },
      },
      approvedCohorts: ['default'],
      defaultCohortId: 'default',
    });

    const next = filters.applyFilterContext({
      projectType: 'office',
      ownerType: 'private',
      cohortPolicy: {
        defaultLocked: false,
        approvedCohortId: 'default',
        auditRequired: true,
      },
    });

    expect(next.filterContext.projectType).toBe('office');
    expect(next.invalidatedQueryKeys.length).toBeGreaterThan(0);
  });

  it('projects similarity and win-rate governance deltas for semantic filter changes', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['default'] });
    const filters = useScoreBenchmarkFilters(
      {
        entityId: 'entity-5',
        actorUserId: 'actor-5',
        reviewerContext: {
          reviewerId: 'reviewer-5',
          role: 'business-development',
        },
        approvedCohorts: ['default'],
        defaultCohortId: 'default',
        initialContext: {
          projectType: 'office',
          ownerType: 'private',
          valueRange: [Number.NaN, 50],
          cohortPolicy: {
            defaultLocked: false,
            approvedCohortId: 'default',
            auditRequired: true,
          },
        },
      },
      { api },
    );

    expect(filters.filterContext.valueRange).toEqual([0, 50]);
    const changed = filters.applyFilterContext({
      ...filters.filterContext,
      projectType: 'healthcare',
      ownerType: 'public',
    });

    expect(changed.filterContext.projectType).toBe('healthcare');
    expect(changed.filterContext.ownerType).toBe('public');
  });
});

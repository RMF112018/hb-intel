import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkApi } from './ScoreBenchmarkApi.js';
import {
  createMockBenchmarkFilterContext,
  createMockFilterGovernanceEvent,
  createMockScoreGhostOverlayState,
} from '../../testing/index.js';

describe('ScoreBenchmarkApi coverage scenarios', () => {
  it('returns criterion benchmarks, summary, similar pursuits, and explainability', () => {
    const overlay = createMockScoreGhostOverlayState({
      version: {
        ...createMockScoreGhostOverlayState().version,
        snapshotId: 'entity-coverage',
      },
    });
    const api = new ScoreBenchmarkApi({ overlays: [overlay], approvedCohorts: ['default', 'approved'] });

    const criteria = api.getCriterionBenchmarks(createMockBenchmarkFilterContext());
    expect(criteria.length).toBeGreaterThan(0);

    const summary = api.getOverallSummary(createMockBenchmarkFilterContext());
    expect(summary.criterionCount).toBeGreaterThan(0);

    const similar = api.getMostSimilarPursuits('entity-coverage', createMockBenchmarkFilterContext());
    expect(similar.length).toBeGreaterThan(0);

    const explainability = api.getExplainability('entity-coverage', createMockBenchmarkFilterContext());
    expect(explainability[0]?.reasonCodes.length).toBeGreaterThan(0);
  });

  it('queues mutations and appends governance events with guardrails', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['default', 'approved'] });

    const queue = api.queueBenchmarkMutation({
      mutationId: 'mutation-1',
      mutationType: 'governance-event',
      entityId: 'entity-queue',
      payload: { reason: 'test' },
      queuedAt: '2026-03-12T00:00:00.000Z',
      replaySafe: true,
    });
    expect(queue.queuedCount).toBe(1);

    const event = createMockFilterGovernanceEvent({
      actorUserId: 'entity-queue',
      fromContext: createMockBenchmarkFilterContext({
        cohortPolicy: {
          defaultLocked: false,
          approvedCohortId: 'default',
          auditRequired: true,
        },
      }),
      toContext: createMockBenchmarkFilterContext({
        cohortPolicy: {
          defaultLocked: false,
          approvedCohortId: 'approved',
          auditRequired: true,
        },
      }),
      approvedCohortId: 'approved',
      warningTriggered: true,
      deltaImpact: {
        sampleSizeDeltaPct: 0.4,
        similarityDeltaPct: 0.05,
        winRateDeltaPct: 0.01,
      },
    });

    expect(api.appendFilterGovernanceEvent(event).totalEvents).toBe(1);

    expect(() =>
      api.appendFilterGovernanceEvent(
        createMockFilterGovernanceEvent({
          actorUserId: 'entity-queue',
          warningTriggered: false,
          deltaImpact: {
            sampleSizeDeltaPct: 0.3,
            similarityDeltaPct: 0.01,
            winRateDeltaPct: 0.01,
          },
        })
      )
    ).toThrow(/warning confirmation/i);

    expect(() =>
      api.appendFilterGovernanceEvent(
        createMockFilterGovernanceEvent({
          actorUserId: 'entity-queue',
          warningTriggered: true,
          toContext: createMockBenchmarkFilterContext({
            cohortPolicy: {
              defaultLocked: false,
              approvedCohortId: 'unapproved',
              auditRequired: true,
            },
          }),
          approvedCohortId: 'unapproved',
        })
      )
    ).toThrow(/admin-approved cohort/i);

    expect(() =>
      api.appendFilterGovernanceEvent(
        createMockFilterGovernanceEvent({
          actorUserId: 'entity-queue',
          eventType: 'filter-change',
          warningTriggered: true,
          fromContext: createMockBenchmarkFilterContext({
            cohortPolicy: {
              defaultLocked: true,
              approvedCohortId: 'default',
              auditRequired: true,
            },
          }),
          toContext: {
            cohortPolicy: {
              defaultLocked: true,
              auditRequired: true,
            },
          },
        })
      )
    ).toThrow(/Default cohort lock prevents silent cohort change/);
  });

  it('saves no-bid rationale with immutable artifact requirements', () => {
    const api = new ScoreBenchmarkApi();

    expect(() =>
      api.saveNoBidRationale(
        'entity-1',
        {
          artifactId: ' ',
          rationale: 'Need more confidence',
          citations: [],
          approvedAt: '2026-03-12T00:00:00.000Z',
        },
        'approver-1'
      )
    ).toThrow(/persisted artifact/i);

    expect(() =>
      api.saveNoBidRationale(
        'entity-1',
        {
          artifactId: 'artifact-1',
          rationale: 'Need more confidence',
          citations: [],
          approvedAt: '',
        },
        ' '
      )
    ).toThrow(/approval metadata/i);

    const saved = api.saveNoBidRationale(
      'entity-1',
      {
        artifactId: 'artifact-1',
        rationale: 'Need more confidence',
        citations: ['source-1'],
        approvedAt: '2026-03-12T00:00:00.000Z',
      },
      'approver-1'
    );

    expect(saved.entityId).toBe('entity-1');
    expect(saved.payload.artifactId).toBe('artifact-1');
  });
});

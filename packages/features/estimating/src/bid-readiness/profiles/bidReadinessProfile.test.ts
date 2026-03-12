import { describe, expect, it } from 'vitest';

import {
  estimatingBidReadinessProfile,
  buildReadinessSummary,
} from './index.js';

describe('bidReadinessProfile', () => {
  it('locks six baseline criteria and canonical thresholds', () => {
    expect(estimatingBidReadinessProfile.criteria).toHaveLength(6);
    expect(estimatingBidReadinessProfile.thresholds).toEqual({
      readyMinScore: 90,
      nearlyReadyMinScore: 70,
      attentionNeededMinScore: 50,
    });
  });

  it('produces deterministic summaries from identical inputs', () => {
    const criteria = estimatingBidReadinessProfile.criteria.map((criterion, index) => ({
      ...criterion,
      isComplete: index < 3,
    }));

    const governance = {
      governanceState: 'approved' as const,
      recordedAt: '2026-01-01T00:00:00.000Z',
      recordedBy: 'test:user',
      traceId: 'trace-1',
      immutableSnapshotId: 'snapshot-1',
      telemetryKeys: [
        'time-to-readiness',
        'blocker-resolution-latency',
        'ready-to-bid-rate',
        'submission-error-rate-reduction',
        'checklist-ces',
      ] as const,
    };

    const left = buildReadinessSummary(
      criteria,
      {
        profile: estimatingBidReadinessProfile,
        governance,
      },
      '2026-01-01T00:00:00.000Z',
    );

    const right = buildReadinessSummary(
      criteria,
      {
        profile: estimatingBidReadinessProfile,
        governance,
      },
      '2026-01-01T00:00:00.000Z',
    );

    expect(left).toEqual(right);
    expect(left.score.value).toBeGreaterThanOrEqual(0);
    expect(left.score.value).toBeLessThanOrEqual(100);
  });
});

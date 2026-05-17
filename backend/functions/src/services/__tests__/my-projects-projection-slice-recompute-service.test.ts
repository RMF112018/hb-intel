import { describe, expect, it } from 'vitest';
import { NoopProjectionSliceRecomputeService } from '../my-projects-projection/delta/projection-slice-recompute-service.js';

describe('NoopProjectionSliceRecomputeService', () => {
  it('returns ok with all-zero counts for any input', async () => {
    const service = new NoopProjectionSliceRecomputeService();
    const outcome = await service.recompute({
      sourceListKind: 'Projects',
      changedItemIds: ['1', '2', '3'],
      deletedItemIds: ['4'],
      projectionBatchId: 'batch-1',
      correlationId: 'corr-1',
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.counts).toEqual({
        helperRowsInserted: 0,
        helperRowsUpdated: 0,
        helperRowsReactivated: 0,
        helperRowsDeactivated: 0,
        helperRowsPurged: 0,
      });
    }
  });

  it('returns ok with all-zero counts when inputs are empty', async () => {
    const service = new NoopProjectionSliceRecomputeService();
    const outcome = await service.recompute({
      sourceListKind: 'LegacyRegistry',
      changedItemIds: [],
      deletedItemIds: [],
      projectionBatchId: 'batch-2',
      correlationId: 'corr-2',
    });
    expect(outcome.ok).toBe(true);
  });
});

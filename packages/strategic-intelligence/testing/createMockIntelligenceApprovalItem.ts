import type { IStrategicIntelligenceApprovalQueueItem } from '../src/types/index.js';

const merge = <T extends object>(base: T, overrides?: Partial<T>): T => ({
  ...base,
  ...(overrides ?? {}),
});

export const createMockIntelligenceApprovalItem = (
  overrides?: Partial<IStrategicIntelligenceApprovalQueueItem>
): IStrategicIntelligenceApprovalQueueItem =>
  merge(
    {
      queueItemId: 'approval-item-mock',
      entryId: 'living-entry-mock',
      submittedBy: 'author-mock',
      submittedAt: '2026-03-12T00:00:00.000Z',
      approvalStatus: 'pending',
    },
    overrides
  );

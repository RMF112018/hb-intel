import type { IReconciliationRecord } from '../src/schedule/types/index.js';

export const createMockReconciliationRecord = (
  overrides?: Partial<IReconciliationRecord>,
): IReconciliationRecord => ({
  reconciliationId: 'recon-001',
  commitmentId: 'commit-001',
  projectId: 'proj-001',
  priorStatus: 'Aligned',
  newStatus: 'PMOverride',
  priorCommittedFinish: null,
  newCommittedFinish: '2026-04-15T00:00:00Z',
  sourceVersionId: 'ver-001',
  triggeredBy: 'PMEdit',
  causationCode: null,
  explanation: null,
  createdAt: '2026-03-16T09:00:00Z',
  createdBy: 'user-001',
  ...overrides,
});

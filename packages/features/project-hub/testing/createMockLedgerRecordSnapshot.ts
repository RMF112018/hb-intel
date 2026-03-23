import type { ILedgerRecordSnapshot } from '../src/constraints/publication/types.js';

export const createMockLedgerRecordSnapshot = (
  overrides?: Partial<ILedgerRecordSnapshot>,
): ILedgerRecordSnapshot => ({
  snapshotId: 'snap-001',
  projectId: 'proj-001',
  ledgerType: 'Constraint',
  recordId: 'con-003',
  recordNumber: 'CON-003',
  snapshotData: { title: 'City permit review in progress', status: 'Pending', priority: 2 },
  publishedAt: '2026-03-15T14:00:00Z',
  publishedBy: 'user-pm-001',
  supersededAt: null,
  supersededBy: null,
  ...overrides,
});

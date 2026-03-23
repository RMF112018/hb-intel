import type { ICrossLedgerLink } from '../src/constraints/lineage/types.js';

export const createMockCrossLedgerLink = (
  overrides?: Partial<ICrossLedgerLink>,
): ICrossLedgerLink => ({
  linkId: 'link-001',
  projectId: 'proj-001',
  sourceRecordId: 'del-003',
  sourceLedger: 'Delay',
  targetRecordId: 'ce-004',
  targetLedger: 'Change',
  linkedAt: '2026-03-15T10:00:00Z',
  linkedBy: 'user-001',
  ...overrides,
});

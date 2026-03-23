import type { IProcoreMappingRecord } from '../src/constraints/change-ledger/types.js';

export const createMockProcoreMappingRecord = (
  overrides?: Partial<IProcoreMappingRecord>,
): IProcoreMappingRecord => ({
  procoreChangeEventId: 'procore-ce-001',
  procoreChangeEventNumber: 'PCE-001',
  procoreStatus: 'Open',
  procoreStatusMappedTo: 'Identified',
  procoreProjectId: 'procore-proj-001',
  syncState: 'Synced',
  lastSyncedAt: '2026-03-15T10:00:00Z',
  procoreWritePathEnabled: false,
  syncConflictDetails: null,
  procoreLineItemSyncState: 'NotSynced',
  promotedFromManualAt: '2026-03-15T09:00:00Z',
  promotedBy: 'user-admin',
  ...overrides,
});

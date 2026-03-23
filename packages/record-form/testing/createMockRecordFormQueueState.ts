/**
 * SF23-T08 — Mock factory for pending record form queue state.
 */
import type { IRecordFormStorageRecord } from '../src/storage/IRecordFormStorageAdapter.js';
import { createMockRecordFormState } from './createMockRecordFormState.js';

export function createMockRecordFormQueueState(count: number = 2): IRecordFormStorageRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const state = createMockRecordFormState({
      draft: {
        draftId: `queued-${i + 1}`,
        recordId: null,
        projectId: 'proj-001',
        moduleKey: 'financial',
        mode: 'create',
        isDirty: true,
        lastSavedAtIso: '2026-03-23T14:00:00.000Z',
        createdAtIso: '2026-03-23T14:00:00.000Z',
        authorUpn: 'pm@example.com',
        schemaVersion: '1.0',
      },
      sync: { state: i === 0 ? 'saved-locally' : 'queued-to-sync', queuePosition: i, lastSyncAttemptIso: null },
    });
    return {
      draftId: state.draft.draftId,
      state,
      storedAtIso: '2026-03-23T14:00:00.000Z',
      updatedAtIso: '2026-03-23T14:00:00.000Z',
      storageSystem: 'in-memory',
      auditTrail: [],
    };
  });
}

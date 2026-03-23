/**
 * SF23-T08 — Mock factory for IRecordRecoveryState.
 */
import type { IRecordRecoveryState } from '../src/types/index.js';

export function createMockRecordRecoveryState(
  overrides?: Partial<IRecordRecoveryState>,
): IRecordRecoveryState {
  return {
    reasonCode: 'offline-draft-restored',
    recoveredAtIso: '2026-03-23T14:00:00.000Z',
    hasConflicts: false,
    conflictFields: [],
    userMessage: 'Draft recovered from offline storage',
    ...overrides,
  };
}

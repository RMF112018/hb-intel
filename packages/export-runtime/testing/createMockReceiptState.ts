/**
 * SF24-T08 — Mock factory for IExportReceiptState.
 */
import type { IExportReceiptState } from '../src/types/index.js';

export function createMockReceiptState(
  overrides?: Partial<IExportReceiptState>,
): IExportReceiptState {
  return {
    receiptId: 'rct-mock-001',
    status: 'saved-locally',
    confidence: 'queued-local-only',
    createdAtIso: '2026-03-23T14:00:00.000Z',
    completedAtIso: null,
    artifactUrl: null,
    restoredFromCache: false,
    ...overrides,
  };
}

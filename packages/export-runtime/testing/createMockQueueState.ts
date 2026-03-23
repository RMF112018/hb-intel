/**
 * SF24-T08 — Mock factory for pending export queue state.
 */
import type { IExportStorageRecord } from '../src/storage/IExportStorageAdapter.js';
import { createMockExportRequest } from './createMockExportRequest.js';

export function createMockQueueState(
  count: number = 2,
): IExportStorageRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const request = createMockExportRequest({
      requestId: `queued-${i + 1}`,
      receipt: {
        receiptId: `rct-queued-${i + 1}`,
        status: i === 0 ? 'saved-locally' : 'queued-to-sync',
        confidence: 'queued-local-only',
        createdAtIso: '2026-03-23T14:00:00.000Z',
        completedAtIso: null,
        artifactUrl: null,
        restoredFromCache: false,
      },
    });
    return {
      requestId: request.requestId,
      request,
      storedAtIso: '2026-03-23T14:00:00.000Z',
      updatedAtIso: '2026-03-23T14:00:00.000Z',
      storageSystem: 'in-memory',
      auditTrail: [],
    };
  });
}

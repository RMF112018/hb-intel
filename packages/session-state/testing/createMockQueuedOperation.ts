import type { IQueuedOperation } from '../src/types/ISessionState.js';

/**
 * Creates a mock queued operation for testing.
 */
export function createMockQueuedOperation(
  overrides: Partial<IQueuedOperation> = {},
): IQueuedOperation {
  return {
    operationId: 'op-1',
    type: 'upload',
    target: '/api/records',
    payload: {},
    retryCount: 0,
    maxRetries: 5,
    createdAt: new Date().toISOString(),
    lastAttemptAt: null,
    lastError: null,
    ...overrides,
  };
}

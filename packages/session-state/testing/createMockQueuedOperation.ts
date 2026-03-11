/**
 * Creates a mock queued operation for testing — SF12-T01 placeholder.
 * Types will be tightened in T02 when proper interfaces land.
 */
export function createMockQueuedOperation(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: 'op-1',
    type: 'create',
    entity: 'record',
    payload: {},
    createdAt: new Date().toISOString(),
    status: 'pending',
    ...overrides,
  };
}

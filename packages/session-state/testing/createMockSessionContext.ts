/**
 * Creates a mock session context for testing — SF12-T01 placeholder.
 * Types will be tightened in T02 when proper interfaces land.
 */
export function createMockSessionContext(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    isOnline: true,
    connectivity: 'online',
    pendingOperations: 0,
    drafts: [],
    syncStatus: 'idle',
    ...overrides,
  };
}

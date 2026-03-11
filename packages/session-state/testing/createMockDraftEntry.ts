/**
 * Creates a mock draft entry for testing — SF12-T01 placeholder.
 * Types will be tightened in T02 when proper interfaces land.
 */
export function createMockDraftEntry(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: 'draft-1',
    entityType: 'record',
    data: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ttl: 86400000,
    ...overrides,
  };
}

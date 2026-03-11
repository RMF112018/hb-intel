/**
 * createMockSourceRecord — D-SF14-T08, D-06, D-10 (testing sub-path)
 *
 * Factory for mock source record objects used by resolveRelatedIds()
 * and useRelatedItems integration tests.
 */
export function createMockSourceRecord(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: 'mock-source-001',
    type: 'project',
    title: 'Mock Source Record',
    status: 'Active',
    ...overrides,
  };
}

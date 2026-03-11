/**
 * Factory stub for creating mock empty state contexts in tests.
 * Will be expanded in later tasks.
 */
export function createMockEmptyStateContext(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    moduleId: 'test-module',
    hasData: false,
    hasFilters: false,
    isConfigured: false,
    ...overrides,
  };
}

import type { ISmartEmptyStateConfig } from '../src/types/ISmartEmptyState.js';

/**
 * Factory stub for creating mock empty state configs in tests.
 * Will be expanded in later tasks.
 */
export function createMockEmptyStateConfig(overrides: Partial<ISmartEmptyStateConfig> = {}): ISmartEmptyStateConfig {
  return {
    moduleId: 'test-module',
    enableFirstVisit: true,
    ...overrides,
  };
}

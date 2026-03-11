import type { IEmptyStateContext } from '../src/types/ISmartEmptyState.js';

/**
 * Factory stub for creating mock empty state contexts in tests.
 */
export function createMockEmptyStateContext(overrides: Partial<IEmptyStateContext> = {}): IEmptyStateContext {
  return {
    module: 'test-module',
    view: 'test-view',
    hasActiveFilters: false,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'user',
    isLoadError: false,
    ...overrides,
  };
}

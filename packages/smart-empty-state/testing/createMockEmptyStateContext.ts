import type { IEmptyStateContext } from '../src/types/ISmartEmptyState.js';

/**
 * Factory for creating mock empty state contexts in tests.
 * Defaults match the canonical estimating/pursuits module per D-09.
 *
 * @see SF11-T08 — canonical testing factory
 */
export function createMockEmptyStateContext(overrides: Partial<IEmptyStateContext> = {}): IEmptyStateContext {
  return {
    module: 'estimating',
    view: 'pursuits',
    hasActiveFilters: false,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'Estimator',
    isLoadError: false,
    ...overrides,
  };
}

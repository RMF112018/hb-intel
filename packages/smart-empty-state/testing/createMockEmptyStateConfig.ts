import type { ISmartEmptyStateConfig, IEmptyStateContext, IEmptyStateConfig } from '../src/types/ISmartEmptyState.js';

/**
 * Factory stub for creating mock empty state configs in tests.
 */
export function createMockEmptyStateConfig(
  resolveFn?: (context: IEmptyStateContext) => IEmptyStateConfig,
): ISmartEmptyStateConfig {
  return {
    resolve: resolveFn ?? ((_context: IEmptyStateContext): IEmptyStateConfig => ({
      module: 'test-module',
      view: 'test-view',
      classification: 'truly-empty',
      heading: 'No data yet',
      description: 'There is nothing to display.',
    })),
  };
}

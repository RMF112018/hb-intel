import type { IEmptyStateConfig } from '../src/types/ISmartEmptyState.js';

/**
 * Factory for creating mock empty state configs in tests.
 * Returns a flat IEmptyStateConfig per D-02 resolver output contract.
 *
 * @see SF11-T08 — canonical testing factory
 */
export function createMockEmptyStateConfig(
  overrides: Partial<IEmptyStateConfig> = {},
): IEmptyStateConfig {
  return {
    module: 'estimating',
    view: 'pursuits',
    classification: 'truly-empty',
    heading: 'No items yet',
    description: 'Create your first record to get started.',
    primaryAction: { label: 'Create', href: '/new' },
    ...overrides,
  };
}

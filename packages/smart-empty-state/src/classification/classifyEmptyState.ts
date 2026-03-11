import type { EmptyStateClassification, ISmartEmptyStateConfig } from '../types/ISmartEmptyState.js';

/**
 * Classifies the empty state for a given module context.
 * Stub implementation — returns 'truly-empty'. Will be expanded in T03.
 */
export function classifyEmptyState(_config: ISmartEmptyStateConfig): EmptyStateClassification {
  return 'truly-empty';
}

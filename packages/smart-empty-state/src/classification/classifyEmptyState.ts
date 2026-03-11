import type { EmptyStateClassification } from '../types/ISmartEmptyState.js';
import type { IEmptyStateContext } from '../types/ISmartEmptyState.js';

/**
 * Classifies the empty state for a given module context.
 * Stub implementation — returns 'truly-empty'. Will be expanded in T03.
 */
export function classifyEmptyState(_context: IEmptyStateContext): EmptyStateClassification {
  return 'truly-empty';
}

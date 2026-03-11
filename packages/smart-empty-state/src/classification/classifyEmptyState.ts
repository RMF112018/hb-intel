import type { EmptyStateClassification, IEmptyStateContext } from '../types/ISmartEmptyState.js';

/**
 * Classifies an empty state using locked D-01 precedence order.
 * Precedence: loading-failed > permission-empty > filter-empty > first-use > truly-empty
 */
export function classifyEmptyState(context: IEmptyStateContext): EmptyStateClassification {
  if (context.isLoadError) return 'loading-failed';
  if (!context.hasPermission) return 'permission-empty';
  if (context.hasActiveFilters) return 'filter-empty';
  if (context.isFirstVisit) return 'first-use';
  return 'truly-empty';
}

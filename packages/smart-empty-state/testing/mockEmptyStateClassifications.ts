import type { EmptyStateClassification } from '../src/types/ISmartEmptyState.js';

/**
 * All possible empty state classification values for exhaustive testing.
 */
export const mockEmptyStateClassifications: readonly EmptyStateClassification[] = [
  'first-use',
  'truly-empty',
  'filter-empty',
  'permission-empty',
  'loading-failed',
] as const;

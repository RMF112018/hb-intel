import type { EmptyStateClassification } from '../src/types/ISmartEmptyState.js';

/**
 * All possible empty state classification values for exhaustive testing.
 */
export const mockEmptyStateClassifications: readonly EmptyStateClassification[] = [
  'truly-empty',
  'not-yet-configured',
  'filtered-to-zero',
  'error',
  'loading',
] as const;

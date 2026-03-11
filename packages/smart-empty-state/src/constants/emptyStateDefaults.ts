import type { EmptyStateClassification } from '../types/ISmartEmptyState.js';

export const EMPTY_STATE_VISIT_KEY_PREFIX = 'hbc::empty-state::visited';
export const EMPTY_STATE_COACHING_COLLAPSE_LABEL = 'Need help getting started?';

export const emptyStateClassificationLabel: Record<EmptyStateClassification, string> = {
  'first-use': 'First Use',
  'truly-empty': 'No Data',
  'filter-empty': 'No Filter Matches',
  'permission-empty': 'No Access',
  'loading-failed': 'Load Failed',
};

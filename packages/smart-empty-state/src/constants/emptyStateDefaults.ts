import type { ISmartEmptyStateConfig } from '../types/ISmartEmptyState.js';

/**
 * Default configuration values for smart empty state classification.
 */
export const EMPTY_STATE_DEFAULTS: Readonly<Required<ISmartEmptyStateConfig>> = {
  moduleId: 'unknown',
  enableFirstVisit: true,
} as const;

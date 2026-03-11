import type { EmptyStateClassification } from '../types/ISmartEmptyState.js';

export interface UseEmptyStateResult {
  readonly classification: EmptyStateClassification;
}

/**
 * Combined empty state hook.
 * Stub implementation — returns 'truly-empty'. Will be expanded in T04.
 */
export function useEmptyState(_moduleId: string): UseEmptyStateResult {
  return { classification: 'truly-empty' };
}

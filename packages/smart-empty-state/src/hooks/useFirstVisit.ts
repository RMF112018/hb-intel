import type { IUseFirstVisitResult } from '../types/ISmartEmptyState.js';

/**
 * Hook to detect first visit for a module context.
 * Stub implementation — returns isFirstVisit: true. Will be expanded in T04.
 */
export function useFirstVisit(_module: string, _view: string): IUseFirstVisitResult {
  return {
    isFirstVisit: true,
    markVisited: () => {},
  };
}

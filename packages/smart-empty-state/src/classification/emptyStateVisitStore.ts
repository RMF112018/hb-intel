import type { IEmptyStateVisitStore } from '../types/ISmartEmptyState.js';

/**
 * No-op visit store implementation.
 * Always reports not visited and discards mark calls.
 */
export const noopVisitStore: IEmptyStateVisitStore = {
  hasVisited: (_module: string, _view: string): boolean => false,
  markVisited: (_module: string, _view: string): void => {},
};

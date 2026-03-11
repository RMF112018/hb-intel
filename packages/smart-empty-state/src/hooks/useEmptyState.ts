import type { IUseEmptyStateResult, IEmptyStateConfig } from '../types/ISmartEmptyState.js';

const defaultResolved: IEmptyStateConfig = {
  module: '',
  view: '',
  classification: 'truly-empty',
  heading: '',
  description: '',
};

/**
 * Combined empty state hook.
 * Stub implementation — returns 'truly-empty' with default resolved config. Will be expanded in T04.
 */
export function useEmptyState(_module: string, _view: string): IUseEmptyStateResult {
  return {
    classification: 'truly-empty',
    resolved: defaultResolved,
  };
}

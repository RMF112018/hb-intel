/**
 * Adapter interface for visit tracking storage (D-04: no session-state dependency).
 * Consumers inject their own store implementation via this contract.
 */
export interface IEmptyStateVisitStore {
  /** Returns true if this is the first visit for the given module */
  isFirstVisit(moduleId: string): boolean;
  /** Records a visit for the given module */
  recordVisit(moduleId: string): void;
}

/**
 * No-op visit store implementation.
 * Always reports first visit as true and discards record calls.
 */
export const noopVisitStore: IEmptyStateVisitStore = {
  isFirstVisit: (_moduleId: string): boolean => true,
  recordVisit: (_moduleId: string): void => {},
};

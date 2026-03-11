import { useState, useCallback } from 'react';
import type { IEmptyStateVisitStore, IUseFirstVisitResult } from '../types/ISmartEmptyState.js';
import { createEmptyStateVisitStore } from '../classification/emptyStateVisitStore.js';

export interface UseFirstVisitParams {
  module: string;
  view: string;
  store?: IEmptyStateVisitStore;
}

const defaultStore = createEmptyStateVisitStore();

export function useFirstVisit(params: UseFirstVisitParams): IUseFirstVisitResult {
  const { module, view, store = defaultStore } = params;
  const [isFirstVisit, setIsFirstVisit] = useState(() => !store.hasVisited(module, view));

  const markVisited = useCallback(() => {
    store.markVisited(module, view);
    setIsFirstVisit(false);
  }, [store, module, view]);

  return { isFirstVisit, markVisited };
}

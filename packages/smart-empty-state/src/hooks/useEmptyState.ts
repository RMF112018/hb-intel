import { useMemo } from 'react';
import type {
  IEmptyStateContext,
  IEmptyStateVisitStore,
  ISmartEmptyStateConfig,
  IUseEmptyStateResult,
} from '../types/ISmartEmptyState.js';
import { classifyEmptyState } from '../classification/classifyEmptyState.js';
import { useFirstVisit } from './useFirstVisit.js';

export interface UseEmptyStateParams {
  config: ISmartEmptyStateConfig;
  context: Omit<IEmptyStateContext, 'isFirstVisit'> & { isFirstVisit?: boolean };
  firstVisitStore?: IEmptyStateVisitStore;
}

export function useEmptyState(params: UseEmptyStateParams): IUseEmptyStateResult {
  const { config, context, firstVisitStore } = params;

  const { isFirstVisit: storeFirstVisit } = useFirstVisit({
    module: context.module,
    view: context.view,
    store: firstVisitStore,
  });

  const isFirstVisit = context.isFirstVisit ?? storeFirstVisit;

  const normalizedContext: IEmptyStateContext = {
    ...context,
    isFirstVisit,
  };

  const classification = classifyEmptyState(normalizedContext);
  const resolved = config.resolve(normalizedContext);

  return useMemo(
    () => ({ classification, resolved }),
    [classification, resolved],
  );
}

import type { IRiskCostItem } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateRiskItem() {
  const repo = useRepository('risk');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IRiskCostItem, 'id'>) => repo.createItem(data),
    invalidateKey: queryKeys.risk.all,
  });
}

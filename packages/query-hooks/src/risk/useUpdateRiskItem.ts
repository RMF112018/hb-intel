import type { IRiskCostItem } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateRiskItem() {
  const repo = useRepository('risk');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IRiskCostItem> }) =>
      repo.updateItem(id, data),
    invalidateKey: queryKeys.risk.all,
  });
}

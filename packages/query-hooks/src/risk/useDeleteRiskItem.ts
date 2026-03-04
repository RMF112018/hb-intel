import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteRiskItem() {
  const repo = useRepository('risk');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteItem(id),
    invalidateKey: queryKeys.risk.all,
  });
}

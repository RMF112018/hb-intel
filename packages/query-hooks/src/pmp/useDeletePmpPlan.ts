import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeletePmpPlan() {
  const repo = useRepository('pmp');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deletePlan(id),
    invalidateKey: queryKeys.pmp.all,
  });
}

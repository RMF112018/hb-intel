import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteContract() {
  const repo = useRepository('contracts');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteContract(id),
    invalidateKey: queryKeys.contracts.all,
  });
}

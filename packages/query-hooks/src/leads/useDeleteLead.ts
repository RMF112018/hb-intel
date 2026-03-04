import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteLead() {
  const repo = useRepository('leads');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.delete(id),
    invalidateKey: queryKeys.leads.all,
  });
}

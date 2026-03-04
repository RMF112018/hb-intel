import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteComplianceEntry() {
  const repo = useRepository('compliance');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteEntry(id),
    invalidateKey: queryKeys.compliance.all,
  });
}

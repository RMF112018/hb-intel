import type { IProjectManagementPlan } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdatePmpPlan() {
  const repo = useRepository('pmp');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IProjectManagementPlan> }) =>
      repo.updatePlan(id, data),
    invalidateKey: queryKeys.pmp.all,
  });
}

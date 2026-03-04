import type { IProjectManagementPlan } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreatePmpPlan() {
  const repo = useRepository('pmp');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>) =>
      repo.createPlan(data),
    invalidateKey: queryKeys.pmp.all,
  });
}

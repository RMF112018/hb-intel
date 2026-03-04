import type { ILeadFormData } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateLead() {
  const repo = useRepository('leads');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ILeadFormData> }) =>
      repo.update(id, data),
    invalidateKey: queryKeys.leads.all,
  });
}

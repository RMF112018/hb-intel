import type { ILeadFormData } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateLead() {
  const repo = useRepository('leads');
  return useOptimisticMutation({
    mutationFn: (data: ILeadFormData) => repo.create(data),
    invalidateKey: queryKeys.leads.all,
  });
}

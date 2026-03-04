import type { IComplianceEntry } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateComplianceEntry() {
  const repo = useRepository('compliance');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IComplianceEntry, 'id'>) => repo.createEntry(data),
    invalidateKey: queryKeys.compliance.all,
  });
}

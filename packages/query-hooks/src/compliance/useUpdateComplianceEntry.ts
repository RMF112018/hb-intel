import type { IComplianceEntry } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateComplianceEntry() {
  const repo = useRepository('compliance');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IComplianceEntry> }) =>
      repo.updateEntry(id, data),
    invalidateKey: queryKeys.compliance.all,
  });
}

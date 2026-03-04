import type { IContractInfo } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateContract() {
  const repo = useRepository('contracts');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IContractInfo> }) =>
      repo.updateContract(id, data),
    invalidateKey: queryKeys.contracts.all,
  });
}

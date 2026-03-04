import type { IContractInfo } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateContract() {
  const repo = useRepository('contracts');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IContractInfo, 'id'>) => repo.createContract(data),
    invalidateKey: queryKeys.contracts.all,
  });
}

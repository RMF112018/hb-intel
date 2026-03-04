import type { ICommitmentApproval } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateContractApproval() {
  const repo = useRepository('contracts');
  return useOptimisticMutation({
    mutationFn: (data: Omit<ICommitmentApproval, 'id'>) => repo.createApproval(data),
    invalidateKey: queryKeys.contracts.all,
  });
}

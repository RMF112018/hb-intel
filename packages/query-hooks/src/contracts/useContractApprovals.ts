import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useContractApprovals(contractId: number) {
  const repo = useRepository('contracts');
  return useQuery({
    queryKey: queryKeys.contracts.approvals(contractId),
    queryFn: () => repo.getApprovals(contractId),
    enabled: contractId > 0,
    ...defaultQueryOptions,
  });
}

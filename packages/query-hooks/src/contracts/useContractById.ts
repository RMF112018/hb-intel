import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useContractById(id: number) {
  const repo = useRepository('contracts');
  return useQuery({
    queryKey: queryKeys.contracts.contract(id),
    queryFn: () => repo.getContractById(id),
    ...defaultQueryOptions,
  });
}

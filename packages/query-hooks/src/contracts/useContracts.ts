import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useContracts(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('contracts');
  return useQuery({
    queryKey: queryKeys.contracts.contracts(projectId),
    queryFn: () => repo.getContracts(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

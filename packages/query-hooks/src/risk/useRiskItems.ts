import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useRiskItems(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('risk');
  return useQuery({
    queryKey: queryKeys.risk.items(projectId),
    queryFn: () => repo.getItems(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

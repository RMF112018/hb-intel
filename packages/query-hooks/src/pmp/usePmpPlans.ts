import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function usePmpPlans(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('pmp');
  return useQuery({
    queryKey: queryKeys.pmp.plans(projectId),
    queryFn: () => repo.getPlans(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

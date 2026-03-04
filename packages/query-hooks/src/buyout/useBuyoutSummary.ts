import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useBuyoutSummary(projectId: string) {
  const repo = useRepository('buyout');
  return useQuery({
    queryKey: queryKeys.buyout.summary(projectId),
    queryFn: () => repo.getSummary(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

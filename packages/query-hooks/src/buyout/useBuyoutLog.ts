import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useBuyoutLog(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('buyout');
  return useQuery({
    queryKey: queryKeys.buyout.entries(projectId),
    queryFn: () => repo.getEntries(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

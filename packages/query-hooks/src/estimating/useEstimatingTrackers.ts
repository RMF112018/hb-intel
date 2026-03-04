import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useEstimatingTrackers(options?: IListQueryOptions) {
  const repo = useRepository('estimating');
  return useQuery({
    queryKey: queryKeys.estimating.trackers(options as Record<string, unknown>),
    queryFn: () => repo.getAllTrackers(options),
    ...defaultQueryOptions,
  });
}

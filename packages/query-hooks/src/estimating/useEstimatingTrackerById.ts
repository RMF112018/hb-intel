import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useEstimatingTrackerById(id: number) {
  const repo = useRepository('estimating');
  return useQuery({
    queryKey: queryKeys.estimating.tracker(id),
    queryFn: () => repo.getTrackerById(id),
    ...defaultQueryOptions,
  });
}

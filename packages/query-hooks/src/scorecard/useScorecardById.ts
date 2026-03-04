import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useScorecardById(id: number) {
  const repo = useRepository('scorecard');
  return useQuery({
    queryKey: queryKeys.scorecard.detail(id),
    queryFn: () => repo.getScorecardById(id),
    ...defaultQueryOptions,
  });
}

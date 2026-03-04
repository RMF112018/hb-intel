import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useScorecards(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('scorecard');
  return useQuery({
    queryKey: queryKeys.scorecard.scorecards(projectId),
    queryFn: () => repo.getScorecards(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

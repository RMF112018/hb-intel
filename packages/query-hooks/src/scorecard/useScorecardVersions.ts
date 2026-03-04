import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useScorecardVersions(scorecardId: number) {
  const repo = useRepository('scorecard');
  return useQuery({
    queryKey: queryKeys.scorecard.versions(scorecardId),
    queryFn: () => repo.getVersions(scorecardId),
    ...defaultQueryOptions,
  });
}

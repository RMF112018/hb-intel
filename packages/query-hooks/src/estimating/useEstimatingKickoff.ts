import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useEstimatingKickoff(projectId: string) {
  const repo = useRepository('estimating');
  return useQuery({
    queryKey: queryKeys.estimating.kickoff(projectId),
    queryFn: () => repo.getKickoff(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

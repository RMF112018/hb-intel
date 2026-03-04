import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useRiskManagement(projectId: string) {
  const repo = useRepository('risk');
  return useQuery({
    queryKey: queryKeys.risk.management(projectId),
    queryFn: () => repo.getManagement(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

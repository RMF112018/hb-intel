import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useComplianceSummary(projectId: string) {
  const repo = useRepository('compliance');
  return useQuery({
    queryKey: queryKeys.compliance.summary(projectId),
    queryFn: () => repo.getSummary(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

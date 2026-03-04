import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useComplianceEntries(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('compliance');
  return useQuery({
    queryKey: queryKeys.compliance.entries(projectId),
    queryFn: () => repo.getEntries(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

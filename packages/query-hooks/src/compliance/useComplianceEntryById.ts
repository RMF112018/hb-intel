import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useComplianceEntryById(id: number) {
  const repo = useRepository('compliance');
  return useQuery({
    queryKey: queryKeys.compliance.entry(id),
    queryFn: () => repo.getEntryById(id),
    ...defaultQueryOptions,
  });
}

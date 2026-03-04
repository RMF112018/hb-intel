import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useLeadById(id: number) {
  const repo = useRepository('leads');
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => repo.getById(id),
    ...defaultQueryOptions,
  });
}

import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useSearchLeads(query: string, options?: IListQueryOptions) {
  const repo = useRepository('leads');
  return useQuery({
    queryKey: queryKeys.leads.search(query),
    queryFn: () => repo.search(query, options),
    enabled: query.length > 0,
    ...defaultQueryOptions,
  });
}

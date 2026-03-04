import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useLeads(options?: IListQueryOptions) {
  const repo = useRepository('leads');
  return useQuery({
    queryKey: queryKeys.leads.list(options as Record<string, unknown>),
    queryFn: () => repo.getAll(options),
    ...defaultQueryOptions,
  });
}

import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useBuyoutEntryById(id: number) {
  const repo = useRepository('buyout');
  return useQuery({
    queryKey: queryKeys.buyout.entry(id),
    queryFn: () => repo.getEntryById(id),
    ...defaultQueryOptions,
  });
}

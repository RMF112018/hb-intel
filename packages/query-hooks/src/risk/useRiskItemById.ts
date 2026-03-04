import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useRiskItemById(id: number) {
  const repo = useRepository('risk');
  return useQuery({
    queryKey: queryKeys.risk.item(id),
    queryFn: () => repo.getItemById(id),
    ...defaultQueryOptions,
  });
}

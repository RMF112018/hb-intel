import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function usePmpPlanById(id: number) {
  const repo = useRepository('pmp');
  return useQuery({
    queryKey: queryKeys.pmp.plan(id),
    queryFn: () => repo.getPlanById(id),
    ...defaultQueryOptions,
  });
}

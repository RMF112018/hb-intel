import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function usePmpSignatures(pmpId: number) {
  const repo = useRepository('pmp');
  return useQuery({
    queryKey: queryKeys.pmp.signatures(pmpId),
    queryFn: () => repo.getSignatures(pmpId),
    enabled: pmpId > 0,
    ...defaultQueryOptions,
  });
}

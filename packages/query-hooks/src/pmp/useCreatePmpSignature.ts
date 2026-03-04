import type { IPMPSignature } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreatePmpSignature() {
  const repo = useRepository('pmp');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IPMPSignature, 'id'>) => repo.createSignature(data),
    invalidateKey: queryKeys.pmp.all,
  });
}

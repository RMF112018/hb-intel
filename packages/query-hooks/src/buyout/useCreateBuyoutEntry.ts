import type { IBuyoutEntry } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateBuyoutEntry() {
  const repo = useRepository('buyout');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IBuyoutEntry, 'id'>) => repo.createEntry(data),
    invalidateKey: queryKeys.buyout.all,
  });
}

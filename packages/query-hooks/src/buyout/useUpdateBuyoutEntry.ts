import type { IBuyoutEntry } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateBuyoutEntry() {
  const repo = useRepository('buyout');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IBuyoutEntry> }) =>
      repo.updateEntry(id, data),
    invalidateKey: queryKeys.buyout.all,
  });
}

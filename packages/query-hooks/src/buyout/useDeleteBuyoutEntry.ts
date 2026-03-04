import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteBuyoutEntry() {
  const repo = useRepository('buyout');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteEntry(id),
    invalidateKey: queryKeys.buyout.all,
  });
}

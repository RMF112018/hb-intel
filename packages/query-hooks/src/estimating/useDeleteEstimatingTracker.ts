import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteEstimatingTracker() {
  const repo = useRepository('estimating');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteTracker(id),
    invalidateKey: queryKeys.estimating.all,
  });
}

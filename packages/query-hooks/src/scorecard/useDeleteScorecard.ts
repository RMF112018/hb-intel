import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteScorecard() {
  const repo = useRepository('scorecard');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteScorecard(id),
    invalidateKey: queryKeys.scorecard.all,
  });
}

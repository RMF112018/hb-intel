import type { IGoNoGoScorecard } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateScorecard() {
  const repo = useRepository('scorecard');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IGoNoGoScorecard> }) =>
      repo.updateScorecard(id, data),
    invalidateKey: queryKeys.scorecard.all,
  });
}

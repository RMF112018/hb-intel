import type { IGoNoGoScorecard } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useSubmitDecision() {
  const repo = useRepository('scorecard');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>) =>
      repo.createScorecard(data),
    invalidateKey: queryKeys.scorecard.all,
  });
}

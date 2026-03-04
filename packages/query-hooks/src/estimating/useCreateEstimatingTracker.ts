import type { IEstimatingTracker } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateEstimatingTracker() {
  const repo = useRepository('estimating');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>) =>
      repo.createTracker(data),
    invalidateKey: queryKeys.estimating.all,
  });
}

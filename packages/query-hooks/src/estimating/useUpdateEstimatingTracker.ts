import type { IEstimatingTracker } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateEstimatingTracker() {
  const repo = useRepository('estimating');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IEstimatingTracker> }) =>
      repo.updateTracker(id, data),
    invalidateKey: queryKeys.estimating.all,
  });
}

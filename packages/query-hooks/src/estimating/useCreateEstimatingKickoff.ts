import type { IEstimatingKickoff } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateEstimatingKickoff() {
  const repo = useRepository('estimating');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>) =>
      repo.createKickoff(data),
    invalidateKey: queryKeys.estimating.all,
  });
}

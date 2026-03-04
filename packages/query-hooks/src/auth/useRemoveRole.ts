import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useRemoveRole() {
  const repo = useRepository('auth');
  return useOptimisticMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      repo.removeRole(userId, roleId),
    invalidateKey: queryKeys.auth.all,
  });
}

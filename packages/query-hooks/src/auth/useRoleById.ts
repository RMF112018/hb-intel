import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useRoleById(id: string) {
  const repo = useRepository('auth');
  return useQuery({
    queryKey: queryKeys.auth.role(id),
    queryFn: () => repo.getRoleById(id),
    enabled: !!id,
    ...defaultQueryOptions,
  });
}

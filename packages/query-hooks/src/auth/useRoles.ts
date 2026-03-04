import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useRoles() {
  const repo = useRepository('auth');
  return useQuery({
    queryKey: queryKeys.auth.roles(),
    queryFn: () => repo.getRoles(),
    ...defaultQueryOptions,
  });
}

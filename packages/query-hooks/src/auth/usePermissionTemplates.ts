import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function usePermissionTemplates() {
  const repo = useRepository('auth');
  return useQuery({
    queryKey: queryKeys.auth.templates(),
    queryFn: () => repo.getPermissionTemplates(),
    ...defaultQueryOptions,
  });
}

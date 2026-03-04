import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useProjectById(id: string) {
  const repo = useRepository('project');
  return useQuery({
    queryKey: queryKeys.project.detail(id),
    queryFn: () => repo.getProjectById(id),
    enabled: !!id,
    ...defaultQueryOptions,
  });
}

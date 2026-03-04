import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useActiveProjects(options?: IListQueryOptions) {
  const repo = useRepository('project');
  return useQuery({
    queryKey: queryKeys.project.list(options as Record<string, unknown>),
    queryFn: () => repo.getProjects(options),
    ...defaultQueryOptions,
  });
}

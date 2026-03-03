import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IActiveProject, IListQueryOptions } from '@hbc/models';
import type { IPagedResult, IPortfolioSummary } from '@hbc/models';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions, defaultMutationOptions } from '../defaults.js';

// NOTE: Project repository factory is not yet exported from @hbc/data-access
// (only lead, schedule, buyout factories exist). Until createProjectRepository
// is added to the factory (Phase 3+), we use a type-safe placeholder that throws
// at runtime — the hooks compile and the cache keys are established.

interface IProjectRepositoryLike {
  getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>>;
  getProjectById(id: string): Promise<IActiveProject | null>;
  createProject(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject>;
  updateProject(id: string, data: Partial<IActiveProject>): Promise<IActiveProject>;
  deleteProject(id: string): Promise<void>;
  getPortfolioSummary(): Promise<IPortfolioSummary>;
}

const notImplemented = (method: string) => () => {
  throw new Error(`ProjectRepository.${method} not yet available — awaiting factory export`);
};

const repo: IProjectRepositoryLike = {
  getProjects: notImplemented('getProjects') as IProjectRepositoryLike['getProjects'],
  getProjectById: notImplemented('getProjectById') as IProjectRepositoryLike['getProjectById'],
  createProject: notImplemented('createProject') as IProjectRepositoryLike['createProject'],
  updateProject: notImplemented('updateProject') as IProjectRepositoryLike['updateProject'],
  deleteProject: notImplemented('deleteProject') as IProjectRepositoryLike['deleteProject'],
  getPortfolioSummary: notImplemented('getPortfolioSummary') as IProjectRepositoryLike['getPortfolioSummary'],
};

export function useActiveProjects(options?: IListQueryOptions) {
  return useQuery({
    queryKey: queryKeys.project.list(options as Record<string, unknown>),
    queryFn: () => repo.getProjects(options),
    ...defaultQueryOptions,
  });
}

export function useProjectById(id: string) {
  return useQuery({
    queryKey: queryKeys.project.detail(id),
    queryFn: () => repo.getProjectById(id),
    enabled: !!id,
    ...defaultQueryOptions,
  });
}

export function useProjectDashboard() {
  return useQuery({
    queryKey: queryKeys.project.dashboard(),
    queryFn: () => repo.getPortfolioSummary(),
    ...defaultQueryOptions,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IActiveProject, 'id'>) => repo.createProject(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.project.all });
    },
    ...defaultMutationOptions,
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IActiveProject> }) =>
      repo.updateProject(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.project.all });
    },
    ...defaultMutationOptions,
  });
}

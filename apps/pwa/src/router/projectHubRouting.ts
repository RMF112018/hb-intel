import type { IActiveProject } from '@hbc/models';
import {
  createProjectRepository,
  normalizeProjectIdentifier,
  type IProjectRepository,
} from '@hbc/data-access';
import { resolveProjectRouteContext, resolveProjectSwitch } from '@hbc/shell';

export interface ProjectHubSearch {
  action?: string;
  view?: string;
  reviewArtifactId?: string;
  returnTo?: string;
  source?: string;
}

export type ProjectHubDeniedReason =
  | 'zero-projects'
  | 'project-not-found'
  | 'project-unavailable';

export type ProjectHubRootResolution =
  | {
      mode: 'portfolio';
      projects: IActiveProject[];
    }
  | {
      mode: 'redirect';
      projects: IActiveProject[];
      redirectTo: string;
    }
  | {
      mode: 'no-access';
      projects: IActiveProject[];
      reason: ProjectHubDeniedReason;
    };

export type ProjectHubProjectResolution =
  | {
      mode: 'project';
      projects: IActiveProject[];
      project: IActiveProject;
      section: string | null;
    }
  | {
      mode: 'redirect';
      projects: IActiveProject[];
      redirectTo: string;
    }
  | {
      mode: 'no-access';
      projects: IActiveProject[];
      reason: ProjectHubDeniedReason;
    };

/**
 * Project Hub section registry.
 *
 * Each entry defines a routable section under `/project-hub/:projectId/:section`.
 * New Phase 3 modules are added here — the route tree, section validation, and
 * switch-target resolution all read from this single registry.
 */
export interface ProjectHubSectionEntry {
  /** URL slug used as the `:section` route param. */
  slug: string;
  /** Human-readable label for nav, breadcrumbs, and headers. */
  label: string;
}

export const PROJECT_HUB_SECTION_REGISTRY: readonly ProjectHubSectionEntry[] = [
  { slug: 'health', label: 'Health' },
  { slug: 'reports', label: 'Reports' },
  { slug: 'financial', label: 'Financial' },
] as const;

const PROJECT_HUB_SUPPORTED_SECTIONS = new Set(
  PROJECT_HUB_SECTION_REGISTRY.map((entry) => entry.slug),
);

export function validateProjectHubSearch(search: Record<string, unknown>): ProjectHubSearch {
  return {
    action: typeof search.action === 'string' ? search.action : undefined,
    view: typeof search.view === 'string' ? search.view : undefined,
    reviewArtifactId:
      typeof search.reviewArtifactId === 'string' ? search.reviewArtifactId : undefined,
    returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined,
    source: typeof search.source === 'string' ? search.source : undefined,
  };
}

export function buildProjectHubPath(projectId: string, section?: string | null): string {
  return section ? `/project-hub/${projectId}/${section}` : `/project-hub/${projectId}`;
}

export function isSupportedProjectHubSection(section?: string | null): boolean {
  if (!section) return true;
  return PROJECT_HUB_SUPPORTED_SECTIONS.has(section);
}

async function getAccessibleProjects(repository: IProjectRepository): Promise<IActiveProject[]> {
  const result = await repository.getProjects();
  return result.items;
}

export async function resolveProjectHubRootEntry(
  repository: IProjectRepository = createProjectRepository(),
): Promise<ProjectHubRootResolution> {
  const projects = await getAccessibleProjects(repository);

  if (projects.length === 0) {
    return { mode: 'no-access', projects, reason: 'zero-projects' };
  }

  if (projects.length === 1) {
    return {
      mode: 'redirect',
      projects,
      redirectTo: buildProjectHubPath(projects[0].id),
    };
  }

  return { mode: 'portfolio', projects };
}

export async function resolveProjectHubProjectEntry(
  rawProjectId: string,
  section: string | null,
  repository: IProjectRepository = createProjectRepository(),
): Promise<ProjectHubProjectResolution> {
  const projects = await getAccessibleProjects(repository);
  const normalization = await normalizeProjectIdentifier(rawProjectId, repository);
  const routeContext = resolveProjectRouteContext(rawProjectId, normalization);

  if (routeContext.accessDenied || !routeContext.projectId) {
    return {
      mode: 'no-access',
      projects,
      reason: 'project-not-found',
    };
  }

  if (routeContext.redirectRequired && routeContext.redirectTo) {
    return {
      mode: 'redirect',
      projects,
      redirectTo: buildProjectHubPath(
        routeContext.redirectTo,
        isSupportedProjectHubSection(section) ? section : null,
      ),
    };
  }

  const project = projects.find((candidate) => candidate.id === routeContext.projectId);
  if (!project) {
    return {
      mode: 'no-access',
      projects,
      reason: 'project-unavailable',
    };
  }

  if (!isSupportedProjectHubSection(section)) {
    return {
      mode: 'redirect',
      projects,
      redirectTo: buildProjectHubPath(project.id),
    };
  }

  return {
    mode: 'project',
    projects,
    project,
    section: section ?? null,
  };
}

export function resolveProjectHubSwitchTarget(params: {
  currentProjectId: string;
  currentSection: string | null;
  targetProjectId: string;
}): string {
  const result = resolveProjectSwitch({
    currentProjectId: params.currentProjectId,
    currentPath: params.currentSection ? `/${params.currentSection}` : '/',
    targetProjectId: params.targetProjectId,
    targetModuleAccessible: (path) => isSupportedProjectHubSection(path.replace(/^\//, '')),
  });

  return buildProjectHubPath(
    params.targetProjectId,
    result.targetPath === '/' ? null : result.targetPath.replace(/^\//, ''),
  );
}

/**
 * Reusable project context hook for Project Hub descendant components.
 *
 * Wraps the route-loader data + project-store reconciliation pattern so
 * control-center sections and future canvas tiles can access the canonical
 * project identity without re-implementing the sync logic.
 *
 * Route params are the canonical source of truth for project identity.
 * This hook reconciles the project store on every call and returns the
 * resolved project context.
 *
 * @see packages/shell/src/contextReconciliation.ts (P3-B1 §7)
 * @see apps/pwa/src/router/projectHubRouting.ts (route resolution)
 */
import { useEffect } from 'react';
import type { IActiveProject } from '@hbc/models';
import { reconcileProjectContext, useProjectStore } from '@hbc/shell';

export interface ProjectHubContext {
  /** The route-canonical active project, or null at portfolio root / no-access. */
  activeProject: IActiveProject | null;
  /** All accessible projects for the current user. */
  availableProjects: IActiveProject[];
  /** Current section slug, or null for the control center root. */
  section: string | null;
  /** Whether the user has at least one accessible project. */
  hasProjects: boolean;
}

/**
 * Synchronize the project store with route-carried project identity and
 * return the resolved context for descendant rendering.
 */
export function useProjectHubContext(
  projects: IActiveProject[],
  activeProject: IActiveProject | null,
  section?: string | null,
): ProjectHubContext {
  useEffect(() => {
    const store = useProjectStore.getState();
    store.setAvailableProjects(projects);

    if (!activeProject) {
      if (store.activeProject !== null) {
        store.setActiveProject(null);
      }
      return;
    }

    const reconciliation = reconcileProjectContext({
      routeProjectId: activeProject.id,
      storeProjectId: store.activeProject?.id ?? null,
    });

    if (reconciliation.storeNeedsSync) {
      store.setActiveProject(activeProject);
    }
  }, [projects, activeProject]);

  return {
    activeProject,
    availableProjects: projects,
    section: section ?? null,
    hasProjects: projects.length > 0,
  };
}

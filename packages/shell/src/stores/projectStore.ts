import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IActiveProject } from '@hbc/models';

export interface ProjectState {
  activeProject: IActiveProject | null;
  availableProjects: IActiveProject[];
  isLoading: boolean;
  setActiveProject: (project: IActiveProject | null) => void;
  setAvailableProjects: (projects: IActiveProject[]) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

/**
 * Zustand store for project context — Blueprint §2e.
 * Phase 4: persist activeProject to localStorage.
 * Only activeProject is persisted (not availableProjects or isLoading).
 */
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      availableProjects: [],
      isLoading: false,
      setActiveProject: (activeProject) => set({ activeProject }),
      setAvailableProjects: (availableProjects) => set({ availableProjects }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ activeProject: null, availableProjects: [], isLoading: false }),
    }),
    {
      name: 'hbc-project-store',
      partialize: (state) => ({ activeProject: state.activeProject }),
    },
  ),
);

import { create } from 'zustand';
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
 * In-memory only for Phase 2.5.
 * TODO: Phase 4 — add zustand/middleware persist with localStorage.
 */
export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  availableProjects: [],
  isLoading: false,
  setActiveProject: (activeProject) => set({ activeProject }),
  setAvailableProjects: (availableProjects) => set({ availableProjects }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ activeProject: null, availableProjects: [], isLoading: false }),
}));

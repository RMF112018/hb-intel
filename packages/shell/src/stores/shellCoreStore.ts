import { create } from 'zustand';
import type { ShellExperienceState, WorkspaceId } from '../types.js';

/**
 * Shell bootstrap phases used for framing and cleanup orchestration.
 */
export type ShellBootstrapPhase = 'idle' | 'bootstrapping' | 'ready' | 'recovering';

export interface ShellCoreState {
  bootstrapPhase: ShellBootstrapPhase;
  experienceState: ShellExperienceState;
  lastResolvedLandingPath: string | null;
  activeWorkspaceSnapshot: WorkspaceId | null;
  setBootstrapPhase: (phase: ShellBootstrapPhase) => void;
  setExperienceState: (state: ShellExperienceState) => void;
  setLastResolvedLandingPath: (path: string | null) => void;
  setActiveWorkspaceSnapshot: (workspaceId: WorkspaceId | null) => void;
  clear: () => void;
}

/**
 * Central shell core state for Phase 5.5 orchestration.
 *
 * This store intentionally remains shell-scoped and excludes feature state.
 */
export const useShellCoreStore = create<ShellCoreState>((set) => ({
  bootstrapPhase: 'idle',
  experienceState: 'ready',
  lastResolvedLandingPath: null,
  activeWorkspaceSnapshot: null,
  setBootstrapPhase: (bootstrapPhase) => set({ bootstrapPhase }),
  setExperienceState: (experienceState) => set({ experienceState }),
  setLastResolvedLandingPath: (lastResolvedLandingPath) => set({ lastResolvedLandingPath }),
  setActiveWorkspaceSnapshot: (activeWorkspaceSnapshot) => set({ activeWorkspaceSnapshot }),
  clear: () =>
    set({
      bootstrapPhase: 'idle',
      experienceState: 'ready',
      lastResolvedLandingPath: null,
      activeWorkspaceSnapshot: null,
    }),
}));

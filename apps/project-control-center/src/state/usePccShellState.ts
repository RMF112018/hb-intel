import { useCallback, useState } from 'react';
import type { PccMvpSurfaceId, PccProjectId } from '@hbc/models/pcc';

/**
 * Wave 2 / Prompt 04 — internal PCC shell state.
 *
 * Pure React `useState`. No URL routing, no persisted preferences, no
 * tenant reads, no real authorization.
 *
 * `previewMode` is a literal `true` and is never flipped in Wave 2.
 */
export interface PccShellState {
  readonly activeSurfaceId: PccMvpSurfaceId;
  readonly previewMode: true;
  readonly selectedProjectId?: PccProjectId;
}

export interface PccShellStateActions {
  setActiveSurface(id: PccMvpSurfaceId): void;
  setSelectedProject(id: PccProjectId | undefined): void;
}

export type PccShellStateController = PccShellState & PccShellStateActions;

export type PccShellStateInitial = Partial<
  Pick<PccShellState, 'activeSurfaceId' | 'selectedProjectId'>
>;

const DEFAULT_ACTIVE_SURFACE: PccMvpSurfaceId = 'project-home';

export function usePccShellState(initial?: PccShellStateInitial): PccShellStateController {
  const [state, setState] = useState<PccShellState>({
    activeSurfaceId: initial?.activeSurfaceId ?? DEFAULT_ACTIVE_SURFACE,
    previewMode: true,
    selectedProjectId: initial?.selectedProjectId,
  });

  const setActiveSurface = useCallback((id: PccMvpSurfaceId) => {
    setState((prev) => ({ ...prev, activeSurfaceId: id }));
  }, []);

  const setSelectedProject = useCallback((id: PccProjectId | undefined) => {
    setState((prev) => ({ ...prev, selectedProjectId: id }));
  }, []);

  return {
    activeSurfaceId: state.activeSurfaceId,
    previewMode: state.previewMode,
    selectedProjectId: state.selectedProjectId,
    setActiveSurface,
    setSelectedProject,
  };
}

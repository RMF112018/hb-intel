import { useCallback, useState } from 'react';
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId, type PccProjectId } from '@hbc/models/pcc';

/**
 * Wave 2 / Prompt 04 — internal PCC shell state.
 *
 * Pure React `useState`. No URL routing, no persisted preferences, no
 * tenant reads, no real authorization.
 *
 * `previewMode` is a literal `true` and is never flipped in Wave 2.
 *
 * Wave-b2 Prompt 05 — invalid `activeSurfaceId` (init or setter) is
 * normalized to `'project-home'` rather than throwing or silently
 * accepting bad data. TypeScript guards the type at compile time;
 * `normalizeSurfaceId` is the runtime backstop for stale state, untyped
 * consumers, and future fixture data.
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

function normalizeSurfaceId(id: unknown): PccMvpSurfaceId {
  return (PCC_MVP_SURFACE_IDS as readonly string[]).includes(id as string)
    ? (id as PccMvpSurfaceId)
    : DEFAULT_ACTIVE_SURFACE;
}

export function usePccShellState(initial?: PccShellStateInitial): PccShellStateController {
  const [state, setState] = useState<PccShellState>({
    activeSurfaceId: normalizeSurfaceId(initial?.activeSurfaceId ?? DEFAULT_ACTIVE_SURFACE),
    previewMode: true,
    selectedProjectId: initial?.selectedProjectId,
  });

  const setActiveSurface = useCallback((id: PccMvpSurfaceId) => {
    setState((prev) => ({ ...prev, activeSurfaceId: normalizeSurfaceId(id) }));
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

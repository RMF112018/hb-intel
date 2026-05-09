import { useCallback, useState } from 'react';
import {
  PCC_MVP_SURFACE_IDS,
  PCC_PRIMARY_TAB_IDS,
  getModule,
  isSelectableModule,
  normalizeModuleId,
  normalizePrimaryTabId,
  type PccModuleId,
  type PccMvpSurfaceId,
  type PccPrimaryTabId,
  type PccProjectId,
} from '@hbc/models/pcc';

/**
 * PCC shell state.
 *
 * Pure React `useState`. No URL routing, no persisted preferences, no
 * tenant reads, no real authorization. `previewMode` is a literal
 * `true` and is never flipped.
 *
 * Phase 05 wave-b10 — Prompt 02 adds in-memory `activePrimaryTabId` /
 * `activeModuleId` for the grouped primary-tab + module navigation
 * model. The legacy `activeSurfaceId: PccMvpSurfaceId` and
 * `setActiveSurface` contract are preserved unchanged because the
 * runtime shell, hero metadata, horizontal tabs, and surface router
 * still consume them. Phase 05 fields are not yet wired into the
 * runtime shell — that lands in Prompts 03–06.
 *
 * Invalid input (init or setter) is normalized rather than thrown or
 * silently accepted; TypeScript guards the type at compile time and
 * the normalizers are runtime backstops for stale state and untyped
 * consumers.
 */
export interface PccShellState {
  // Legacy compatibility surface — current PccApp/PccShell/PccSurfaceRouter
  // consume this. Do not retype to PccPrimaryTabId in Prompt 02.
  readonly activeSurfaceId: PccMvpSurfaceId;
  // Phase 05 — not yet wired to the runtime shell.
  readonly activePrimaryTabId: PccPrimaryTabId;
  // Phase 05 — not yet wired to the runtime shell.
  readonly activeModuleId?: PccModuleId;
  readonly previewMode: true;
  readonly selectedProjectId?: PccProjectId;
}

export interface PccShellStateActions {
  setActiveSurface(id: PccMvpSurfaceId): void;
  selectPrimarySurface(id: PccPrimaryTabId): void;
  selectModule(id: PccModuleId): void;
  clearActiveModule(): void;
  setSelectedProject(id: PccProjectId | undefined): void;
}

export type PccShellStateController = PccShellState & PccShellStateActions;

export type PccShellStateInitial = Partial<
  Pick<
    PccShellState,
    'activeSurfaceId' | 'activePrimaryTabId' | 'activeModuleId' | 'selectedProjectId'
  >
>;

const DEFAULT_ACTIVE_SURFACE: PccMvpSurfaceId = 'project-home';
const DEFAULT_ACTIVE_PRIMARY_TAB: PccPrimaryTabId = 'project-home';

function normalizeSurfaceId(id: unknown): PccMvpSurfaceId {
  return (PCC_MVP_SURFACE_IDS as readonly string[]).includes(id as string)
    ? (id as PccMvpSurfaceId)
    : DEFAULT_ACTIVE_SURFACE;
}

function resolveInitialActiveModuleId(id: unknown): PccModuleId | undefined {
  const normalized = normalizeModuleId(id);
  if (!normalized) return undefined;
  return isSelectableModule(getModule(normalized)) ? normalized : undefined;
}

export function usePccShellState(initial?: PccShellStateInitial): PccShellStateController {
  const [state, setState] = useState<PccShellState>(() => {
    const activeSurfaceId = normalizeSurfaceId(initial?.activeSurfaceId ?? DEFAULT_ACTIVE_SURFACE);
    const seedPrimaryTabId = normalizePrimaryTabId(
      initial?.activePrimaryTabId ?? DEFAULT_ACTIVE_PRIMARY_TAB,
    );
    const activeModuleId = resolveInitialActiveModuleId(initial?.activeModuleId);
    const activePrimaryTabId = activeModuleId
      ? getModule(activeModuleId).parentTabId
      : seedPrimaryTabId;
    return {
      activeSurfaceId,
      activePrimaryTabId,
      activeModuleId,
      previewMode: true,
      selectedProjectId: initial?.selectedProjectId,
    };
  });

  const setActiveSurface = useCallback((id: PccMvpSurfaceId) => {
    setState((prev) => {
      const normalizedSurface = normalizeSurfaceId(id);
      const matchesPrimary = (PCC_PRIMARY_TAB_IDS as readonly string[]).includes(normalizedSurface);
      return {
        ...prev,
        activeSurfaceId: normalizedSurface,
        activePrimaryTabId: matchesPrimary
          ? (normalizedSurface as PccPrimaryTabId)
          : prev.activePrimaryTabId,
        activeModuleId: undefined,
      };
    });
  }, []);

  const selectPrimarySurface = useCallback((id: PccPrimaryTabId) => {
    setState((prev) => ({
      ...prev,
      activePrimaryTabId: normalizePrimaryTabId(id),
      activeModuleId: undefined,
    }));
  }, []);

  const selectModule = useCallback((id: PccModuleId) => {
    setState((prev) => {
      const normalized = normalizeModuleId(id);
      if (!normalized) return prev;
      const mod = getModule(normalized);
      if (!isSelectableModule(mod)) return prev;
      return {
        ...prev,
        activePrimaryTabId: mod.parentTabId,
        activeModuleId: mod.id,
      };
    });
  }, []);

  const clearActiveModule = useCallback(() => {
    setState((prev) =>
      prev.activeModuleId === undefined ? prev : { ...prev, activeModuleId: undefined },
    );
  }, []);

  const setSelectedProject = useCallback((id: PccProjectId | undefined) => {
    setState((prev) => ({ ...prev, selectedProjectId: id, activeModuleId: undefined }));
  }, []);

  return {
    activeSurfaceId: state.activeSurfaceId,
    activePrimaryTabId: state.activePrimaryTabId,
    activeModuleId: state.activeModuleId,
    previewMode: state.previewMode,
    selectedProjectId: state.selectedProjectId,
    setActiveSurface,
    selectPrimarySurface,
    selectModule,
    clearActiveModule,
    setSelectedProject,
  };
}

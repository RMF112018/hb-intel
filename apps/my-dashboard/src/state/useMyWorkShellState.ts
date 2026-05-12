import { useCallback, useMemo, useState } from 'react';
import {
  getMyWorkModule,
  isSelectableMyWorkModule,
  normalizeMyWorkModuleId,
  normalizeMyWorkPrimarySurfaceId,
  type MyWorkModuleId,
  type MyWorkPrimarySurfaceId,
} from '@hbc/models/myWork';

/**
 * My Work shell state.
 *
 * Pure React `useState`. No URL routing, no persisted preferences, no
 * tenant reads, no runtime / preview mode, no project context. The B03
 * shell composes a single primary surface (`my-work-home`) with a single
 * focused module (`adobe-sign-action-queue`). Invalid input (init or
 * setter) is normalized rather than thrown.
 */
export interface MyWorkShellState {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly activeModuleId?: MyWorkModuleId;
}

export interface MyWorkShellStateActions {
  selectPrimarySurface(id: MyWorkPrimarySurfaceId): void;
  selectModule(id: MyWorkModuleId): void;
  clearActiveModule(): void;
}

export type MyWorkShellStateController = MyWorkShellState & MyWorkShellStateActions;

export type MyWorkShellStateInitial = Partial<
  Pick<MyWorkShellState, 'activePrimarySurfaceId' | 'activeModuleId'>
>;

const DEFAULT_ACTIVE_PRIMARY_SURFACE: MyWorkPrimarySurfaceId = 'my-work-home';

function resolveInitialActiveModuleId(id: unknown): MyWorkModuleId | undefined {
  const normalized = normalizeMyWorkModuleId(id);
  if (!normalized) return undefined;
  return isSelectableMyWorkModule(getMyWorkModule(normalized)) ? normalized : undefined;
}

export function useMyWorkShellState(
  initial?: MyWorkShellStateInitial,
): MyWorkShellStateController {
  const [state, setState] = useState<MyWorkShellState>(() => {
    const seedPrimarySurfaceId = normalizeMyWorkPrimarySurfaceId(
      initial?.activePrimarySurfaceId ?? DEFAULT_ACTIVE_PRIMARY_SURFACE,
    );
    const activeModuleId = resolveInitialActiveModuleId(initial?.activeModuleId);
    const activePrimarySurfaceId = activeModuleId
      ? getMyWorkModule(activeModuleId).parentSurfaceId
      : seedPrimarySurfaceId;
    return {
      activePrimarySurfaceId,
      activeModuleId,
    };
  });

  const selectPrimarySurface = useCallback((id: MyWorkPrimarySurfaceId) => {
    setState((prev) => {
      const normalized = normalizeMyWorkPrimarySurfaceId(id);
      if (prev.activePrimarySurfaceId === normalized && prev.activeModuleId === undefined) {
        return prev;
      }
      return {
        activePrimarySurfaceId: normalized,
        activeModuleId: undefined,
      };
    });
  }, []);

  const selectModule = useCallback((id: MyWorkModuleId) => {
    setState((prev) => {
      const normalized = normalizeMyWorkModuleId(id);
      if (!normalized) return prev;
      const mod = getMyWorkModule(normalized);
      if (!isSelectableMyWorkModule(mod)) return prev;
      if (prev.activeModuleId === mod.id && prev.activePrimarySurfaceId === mod.parentSurfaceId) {
        return prev;
      }
      return {
        activePrimarySurfaceId: mod.parentSurfaceId,
        activeModuleId: mod.id,
      };
    });
  }, []);

  const clearActiveModule = useCallback(() => {
    setState((prev) =>
      prev.activeModuleId === undefined ? prev : { ...prev, activeModuleId: undefined },
    );
  }, []);

  return useMemo<MyWorkShellStateController>(
    () => ({
      activePrimarySurfaceId: state.activePrimarySurfaceId,
      activeModuleId: state.activeModuleId,
      selectPrimarySurface,
      selectModule,
      clearActiveModule,
    }),
    [state, selectPrimarySurface, selectModule, clearActiveModule],
  );
}

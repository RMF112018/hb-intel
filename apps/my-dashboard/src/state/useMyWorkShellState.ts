import { useCallback, useMemo, useState } from 'react';
import { normalizeMyWorkPrimarySurfaceId, type MyWorkPrimarySurfaceId } from '@hbc/models/myWork';

/**
 * My Work shell state.
 *
 * Pure React `useState`. No URL routing, no persisted preferences, no
 * tenant reads. The shell renders a single primary-page command surface
 * (`my-work-home`) with no focused-module route. Invalid input (init or
 * setter) is normalized rather than thrown.
 */
export interface MyWorkShellState {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
}

export interface MyWorkShellStateActions {
  selectPrimarySurface(id: MyWorkPrimarySurfaceId): void;
}

export type MyWorkShellStateController = MyWorkShellState & MyWorkShellStateActions;

export type MyWorkShellStateInitial = Partial<Pick<MyWorkShellState, 'activePrimarySurfaceId'>>;

const DEFAULT_ACTIVE_PRIMARY_SURFACE: MyWorkPrimarySurfaceId = 'my-work-home';

export function useMyWorkShellState(initial?: MyWorkShellStateInitial): MyWorkShellStateController {
  const [state, setState] = useState<MyWorkShellState>(() => ({
    activePrimarySurfaceId: normalizeMyWorkPrimarySurfaceId(
      initial?.activePrimarySurfaceId ?? DEFAULT_ACTIVE_PRIMARY_SURFACE,
    ),
  }));

  const selectPrimarySurface = useCallback((id: MyWorkPrimarySurfaceId) => {
    setState((prev) => {
      const normalized = normalizeMyWorkPrimarySurfaceId(id);
      if (prev.activePrimarySurfaceId === normalized) {
        return prev;
      }
      return { activePrimarySurfaceId: normalized };
    });
  }, []);

  return useMemo<MyWorkShellStateController>(
    () => ({
      activePrimarySurfaceId: state.activePrimarySurfaceId,
      selectPrimarySurface,
    }),
    [state, selectPrimarySurface],
  );
}

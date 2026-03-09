import { useEffect } from 'react';
import type { ShellBootstrapPhase } from './stores/shellCoreStore.js';
import type { ShellExperienceState, WorkspaceId } from './types.js';

/**
 * Lifecycle-to-bootstrap mapping and store sync hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.2.
 * - Effect 1: syncs experienceState to shell core store.
 * - Effect 2: maps lifecyclePhase → ShellBootstrapPhase.
 * - Effect 3: syncs activeWorkspace to shell core store.
 */
export function useShellBootstrapSync(params: {
  lifecyclePhase: string;
  experienceState: ShellExperienceState;
  activeWorkspace: WorkspaceId | null;
  setExperienceState: (state: ShellExperienceState) => void;
  setBootstrapPhase: (phase: ShellBootstrapPhase) => void;
  setActiveWorkspaceSnapshot: (workspaceId: WorkspaceId | null) => void;
}): void {
  const {
    lifecyclePhase,
    experienceState,
    activeWorkspace,
    setExperienceState,
    setBootstrapPhase,
    setActiveWorkspaceSnapshot,
  } = params;

  useEffect(() => {
    setExperienceState(experienceState);
  }, [experienceState, setExperienceState]);

  useEffect(() => {
    setBootstrapPhase(
      lifecyclePhase === 'bootstrapping' || lifecyclePhase === 'restoring'
        ? 'bootstrapping'
        : lifecyclePhase === 'error' || lifecyclePhase === 'reauth-required'
          ? 'recovering'
          : lifecyclePhase === 'authenticated'
            ? 'ready'
            : 'idle',
    );
  }, [lifecyclePhase, setBootstrapPhase]);

  useEffect(() => {
    setActiveWorkspaceSnapshot(activeWorkspace);
  }, [activeWorkspace, setActiveWorkspaceSnapshot]);
}

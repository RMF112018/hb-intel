/**
 * D-PH6F-2: Orchestrated PWA sign-out using shell cleanup pipeline.
 * Uses createDefaultShellSignOutCleanupDependencies(null) as the base and
 * overrides only clearShellBootstrapState to add permission store clearing.
 */
import {
  runShellSignOutCleanup,
  createDefaultShellSignOutCleanupDependencies,
} from '@hbc/shell';
import { usePermissionStore } from '@hbc/auth';

export async function performPwaSignOut(): Promise<void> {
  const baseDeps = createDefaultShellSignOutCleanupDependencies(null);

  await runShellSignOutCleanup(
    {
      ...baseDeps,
      clearShellBootstrapState: async () => {
        await baseDeps.clearShellBootstrapState();
        usePermissionStore.getState().clear();
      },
    },
    ['strict', 'standard'],
  );
}

import { useAuthStore } from '@hbc/auth';
import { clearRedirectMemory } from './redirectMemory.js';
import { useNavStore } from './stores/navStore.js';
import { useProjectStore } from './stores/projectStore.js';
import { useShellCoreStore } from './stores/shellCoreStore.js';
import type { ShellCacheRetentionTier, ShellEnvironmentAdapter } from './types.js';

/**
 * Internal dependency contract used to keep cleanup orchestration testable.
 */
export interface ShellSignOutCleanupDependencies {
  clearAuthSession: () => void | Promise<void>;
  clearRedirectMemory: () => void | Promise<void>;
  clearShellBootstrapState: () => void | Promise<void>;
  clearEnvironmentArtifacts: () => void | Promise<void>;
  clearFeatureCachesByTier: (tier: ShellCacheRetentionTier) => void | Promise<void>;
}

/**
 * Run all required shell sign-out cleanup phases in deterministic order.
 *
 * Alignment:
 * - PH5.5: auth/session, redirect memory, shell bootstrap, environment
 *   artifacts, and tiered feature cache cleanup.
 */
export async function runShellSignOutCleanup(
  dependencies: ShellSignOutCleanupDependencies,
  retentionTiers: readonly ShellCacheRetentionTier[] = ['strict', 'standard'],
): Promise<void> {
  await dependencies.clearAuthSession();
  await dependencies.clearRedirectMemory();
  await dependencies.clearShellBootstrapState();
  await dependencies.clearEnvironmentArtifacts();

  for (const tier of retentionTiers) {
    await dependencies.clearFeatureCachesByTier(tier);
  }
}

/**
 * Build default cleanup dependencies bound to shell/auth stores and adapter
 * extension points.
 */
export function createDefaultShellSignOutCleanupDependencies(
  adapter: ShellEnvironmentAdapter | null,
): ShellSignOutCleanupDependencies {
  return {
    clearAuthSession: () => {
      const auth = useAuthStore.getState();
      auth.signOut();
      auth.clear();
    },
    clearRedirectMemory: () => {
      clearRedirectMemory();
    },
    clearShellBootstrapState: () => {
      useShellCoreStore.getState().clear();
      useNavStore.getState().stopNavSync();
      useNavStore.setState({
        activeWorkspace: null,
        activeItemId: undefined,
        toolPickerItems: [],
        sidebarItems: [],
        isSidebarOpen: true,
        isAppLauncherOpen: false,
      });
      useProjectStore.getState().clear();
    },
    clearEnvironmentArtifacts: async () => {
      await adapter?.clearEnvironmentArtifacts?.();
    },
    clearFeatureCachesByTier: async (tier) => {
      await adapter?.clearFeatureCachesByTier?.(tier);
    },
  };
}

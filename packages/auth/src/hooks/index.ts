import { useAuthStore } from '../stores/authStore.js';
import { usePermissionStore } from '../stores/permissionStore.js';
import type { ICurrentUser } from '@hbc/models';

/**
 * Returns the current authenticated user from the auth store.
 * Blueprint §1e — dual-mode auth hook.
 */
export function useCurrentUser(): ICurrentUser | null {
  return useAuthStore((s) => s.currentUser);
}

/**
 * Returns whether the current user has a specific permission action.
 * Blueprint §1e — permission check hook.
 */
export function usePermission(action: string): boolean {
  return usePermissionStore((s) => s.hasPermission(action));
}

/**
 * Returns whether a specific feature flag is enabled.
 * Blueprint §1e — feature flag hook.
 */
export function useFeatureFlag(feature: string): boolean {
  return usePermissionStore((s) => s.hasFeatureFlag(feature));
}

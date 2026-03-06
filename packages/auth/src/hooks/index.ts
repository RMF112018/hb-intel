import { useAuthStore } from '../stores/authStore.js';
import { usePermissionStore } from '../stores/permissionStore.js';
import type { ICurrentUser } from '@hbc/models';
import type {
  AuthMode,
  FeatureAccessEvaluation,
  NormalizedAuthSession,
  StandardActionPermission,
} from '../types.js';

/**
 * Returns the current authenticated user from the auth store.
 * Blueprint §1e — dual-mode auth hook.
 */
export function useCurrentUser(): ICurrentUser | null {
  return useAuthStore((s) => s.currentUser);
}

/**
 * Returns the normalized current session for centralized guard/hook consumers.
 */
export function useCurrentSession(): NormalizedAuthSession | null {
  return useAuthStore((s) => s.session);
}

/**
 * Returns the resolved runtime mode from the central auth store.
 */
export function useResolvedRuntimeMode(): AuthMode | null {
  return useAuthStore((s) => s.runtimeMode);
}

/**
 * Returns whether the current user has a specific permission action.
 * Blueprint §1e — permission check hook.
 */
export function usePermission(action: string): boolean {
  return usePermissionStore((s) => s.hasPermission(action));
}

/**
 * Returns centralized feature-access evaluation for a feature/action pair.
 */
export function usePermissionEvaluation(
  featureId: string,
  action: StandardActionPermission = 'view',
): FeatureAccessEvaluation {
  const runtimeMode = useResolvedRuntimeMode();
  return usePermissionStore((s) => s.getFeatureAccess(featureId, action, runtimeMode));
}

/**
 * Returns whether a specific feature flag is enabled.
 * Blueprint §1e — feature flag hook.
 */
export function useFeatureFlag(feature: string): boolean {
  return usePermissionStore((s) => s.hasFeatureFlag(feature));
}

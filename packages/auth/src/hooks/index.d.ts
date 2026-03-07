import type { ICurrentUser } from '@hbc/models';
import type { AuthMode, FeatureAccessEvaluation, NormalizedAuthSession, StandardActionPermission } from '../types.js';
/**
 * Returns the current authenticated user from the auth store.
 * Blueprint §1e — dual-mode auth hook.
 */
export declare function useCurrentUser(): ICurrentUser | null;
/**
 * Returns the normalized current session for centralized guard/hook consumers.
 */
export declare function useCurrentSession(): NormalizedAuthSession | null;
/**
 * Returns the resolved runtime mode from the central auth store.
 */
export declare function useResolvedRuntimeMode(): AuthMode | null;
/**
 * Returns whether the current user has a specific permission action.
 * Blueprint §1e — permission check hook.
 */
export declare function usePermission(action: string): boolean;
/**
 * Returns centralized feature-access evaluation for a feature/action pair.
 */
export declare function usePermissionEvaluation(featureId: string, action?: StandardActionPermission): FeatureAccessEvaluation;
/**
 * Returns whether a specific feature flag is enabled.
 * Blueprint §1e — feature flag hook.
 */
export declare function useFeatureFlag(feature: string): boolean;
//# sourceMappingURL=index.d.ts.map
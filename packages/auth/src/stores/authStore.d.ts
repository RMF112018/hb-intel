import type { AuthBootstrapSelectorResult, AuthLifecycleSelectorResult, AuthPermissionSummarySelectorResult, AuthSessionSummarySelectorResult, AuthStoreSlice } from '../types.js';
/**
 * Side-effect boundary rule for Phase 5.3:
 * - This store owns central auth/session/permission truth state only.
 * - Provider SDK calls (MSAL/SPFx/bootstrap) must stay outside this file and
 *   call atomic actions with normalized payloads.
 *
 * Alignment notes:
 * - D-04: narrow selector slices + shallow subscriptions reduce broad rerenders.
 * - D-07: structured lifecycle/error state supports deterministic guarded flows.
 * - D-10: central store ownership helps prevent feature-level auth drift.
 */
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthStoreSlice>>;
/**
 * Backward-compatible alias retained for existing type imports.
 */
export type AuthState = AuthStoreSlice;
/**
 * Selector function for lifecycle/runtime state.
 */
export declare const selectAuthLifecycle: (state: AuthStoreSlice) => AuthLifecycleSelectorResult;
/**
 * Selector function for shell bootstrap readiness.
 */
export declare const selectAuthBootstrapReadiness: (state: AuthStoreSlice) => AuthBootstrapSelectorResult;
/**
 * Selector function for session summary data.
 */
export declare const selectAuthSessionSummary: (state: AuthStoreSlice) => AuthSessionSummarySelectorResult;
/**
 * Selector function for permission summary data.
 */
export declare const selectAuthPermissionSummary: (state: AuthStoreSlice) => AuthPermissionSummarySelectorResult;
/**
 * Shallow-subscribed hook for lifecycle/runtime state.
 */
export declare function useAuthLifecycleSelector(): AuthLifecycleSelectorResult;
/**
 * Shallow-subscribed hook for shell bootstrap readiness state.
 */
export declare function useAuthBootstrapSelector(): AuthBootstrapSelectorResult;
/**
 * Shallow-subscribed hook for session summary state.
 */
export declare function useAuthSessionSummarySelector(): AuthSessionSummarySelectorResult;
/**
 * Shallow-subscribed hook for permission summary state.
 */
export declare function useAuthPermissionSummarySelector(): AuthPermissionSummarySelectorResult;
//# sourceMappingURL=authStore.d.ts.map
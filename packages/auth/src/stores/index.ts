export {
  useAuthStore,
  useAuthLifecycleSelector,
  useAuthBootstrapSelector,
  useAuthSessionSummarySelector,
  useAuthPermissionSummarySelector,
  selectAuthLifecycle,
  selectAuthBootstrapReadiness,
  selectAuthSessionSummary,
  selectAuthPermissionSummary,
} from './authStore.js';
export type { AuthState } from './authStore.js';

export { usePermissionStore } from './permissionStore.js';
export type { PermissionState } from './permissionStore.js';

export {
  resolveEffectivePermissions,
  toEffectivePermissionSet,
  isPermissionGranted,
  isActionAllowed,
  isFeatureVisible,
  isFeatureAccessible,
  evaluateFeatureAccess,
  getPermissionResolutionSnapshot,
} from './permissionResolution.js';

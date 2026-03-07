import type { FeatureAccessEvaluation, FeaturePermissionRegistration, StandardActionPermission } from '../types.js';
export interface PermissionState {
    permissions: string[];
    featureFlags: Record<string, boolean>;
    featureRegistrations: Record<string, FeaturePermissionRegistration>;
    hasPermission: (action: string) => boolean;
    hasFeatureFlag: (feature: string) => boolean;
    hasFeatureAccess: (featureId: string, action?: StandardActionPermission, runtimeMode?: string | null) => boolean;
    getFeatureAccess: (featureId: string, action?: StandardActionPermission, runtimeMode?: string | null) => FeatureAccessEvaluation;
    setPermissions: (permissions: string[]) => void;
    setFeatureFlags: (flags: Record<string, boolean>) => void;
    setFeatureRegistrations: (registrations: FeaturePermissionRegistration[]) => void;
    registerFeature: (registration: FeaturePermissionRegistration) => void;
    clear: () => void;
}
export declare const usePermissionStore: import("zustand").UseBoundStore<import("zustand").StoreApi<PermissionState>>;
//# sourceMappingURL=permissionStore.d.ts.map
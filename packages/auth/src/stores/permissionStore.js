import { create } from 'zustand';
import { evaluateFeatureAccess, isPermissionGranted, toEffectivePermissionSet } from './permissionResolution.js';
export const usePermissionStore = create((set, get) => ({
    permissions: [],
    featureFlags: {},
    featureRegistrations: {},
    hasPermission: (action) => {
        const effective = toEffectivePermissionSet(get().permissions);
        return isPermissionGranted(effective, action);
    },
    hasFeatureFlag: (feature) => get().featureFlags[feature] === true,
    hasFeatureAccess: (featureId, action = 'view', runtimeMode = null) => {
        const access = get().getFeatureAccess(featureId, action, runtimeMode);
        return access.allowed;
    },
    getFeatureAccess: (featureId, action = 'view', runtimeMode = null) => {
        const registration = get().featureRegistrations[featureId];
        const effective = toEffectivePermissionSet(get().permissions);
        return evaluateFeatureAccess({
            effective,
            registration,
            action,
            runtimeMode,
        });
    },
    setPermissions: (permissions) => set({ permissions }),
    setFeatureFlags: (featureFlags) => set({ featureFlags }),
    setFeatureRegistrations: (registrations) => set({
        featureRegistrations: registrations.reduce((acc, registration) => {
            acc[registration.featureId] = registration;
            return acc;
        }, {}),
    }),
    registerFeature: (registration) => set((state) => ({
        featureRegistrations: {
            ...state.featureRegistrations,
            [registration.featureId]: registration,
        },
    })),
    clear: () => set({ permissions: [], featureFlags: {}, featureRegistrations: {} }),
}));
//# sourceMappingURL=permissionStore.js.map
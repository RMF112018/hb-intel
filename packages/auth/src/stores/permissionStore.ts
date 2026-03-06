import { create } from 'zustand';
import type {
  FeatureAccessEvaluation,
  FeaturePermissionRegistration,
  StandardActionPermission,
} from '../types.js';
import { evaluateFeatureAccess, isPermissionGranted, toEffectivePermissionSet } from './permissionResolution.js';

export interface PermissionState {
  permissions: string[];
  featureFlags: Record<string, boolean>;
  featureRegistrations: Record<string, FeaturePermissionRegistration>;
  hasPermission: (action: string) => boolean;
  hasFeatureFlag: (feature: string) => boolean;
  hasFeatureAccess: (
    featureId: string,
    action?: StandardActionPermission,
    runtimeMode?: string | null,
  ) => boolean;
  getFeatureAccess: (
    featureId: string,
    action?: StandardActionPermission,
    runtimeMode?: string | null,
  ) => FeatureAccessEvaluation;
  setPermissions: (permissions: string[]) => void;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  setFeatureRegistrations: (registrations: FeaturePermissionRegistration[]) => void;
  registerFeature: (registration: FeaturePermissionRegistration) => void;
  clear: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  featureFlags: {},
  featureRegistrations: {},
  hasPermission: (action: string) => {
    const effective = toEffectivePermissionSet(get().permissions);
    return isPermissionGranted(effective, action);
  },
  hasFeatureFlag: (feature: string) => get().featureFlags[feature] === true,
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
  setFeatureRegistrations: (registrations) =>
    set({
      featureRegistrations: registrations.reduce<Record<string, FeaturePermissionRegistration>>(
        (acc, registration) => {
          acc[registration.featureId] = registration;
          return acc;
        },
        {},
      ),
    }),
  registerFeature: (registration) =>
    set((state) => ({
      featureRegistrations: {
        ...state.featureRegistrations,
        [registration.featureId]: registration,
      },
    })),
  clear: () => set({ permissions: [], featureFlags: {}, featureRegistrations: {} }),
}));

import { create } from 'zustand';

export interface PermissionState {
  permissions: string[];
  featureFlags: Record<string, boolean>;
  hasPermission: (action: string) => boolean;
  hasFeatureFlag: (feature: string) => boolean;
  setPermissions: (permissions: string[]) => void;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  clear: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  featureFlags: {},
  hasPermission: (action: string) => get().permissions.includes(action),
  hasFeatureFlag: (feature: string) => get().featureFlags[feature] === true,
  setPermissions: (permissions) => set({ permissions }),
  setFeatureFlags: (featureFlags) => set({ featureFlags }),
  clear: () => set({ permissions: [], featureFlags: {} }),
}));

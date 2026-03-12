import type { IHealthPulseAdminConfig } from '../types/index.js';

let activeConfig: IHealthPulseAdminConfig | null = null;

const cloneConfig = (config: IHealthPulseAdminConfig): IHealthPulseAdminConfig => {
  return structuredClone(config);
};

export const getHealthPulseAdminConfigStoreSnapshot = (): IHealthPulseAdminConfig | null => {
  if (!activeConfig) {
    return null;
  }

  return cloneConfig(activeConfig);
};

export const setHealthPulseAdminConfigStoreSnapshot = (
  config: IHealthPulseAdminConfig
): IHealthPulseAdminConfig => {
  activeConfig = cloneConfig(config);
  return cloneConfig(activeConfig);
};

export const __resetHealthPulseAdminConfigStoreForTests = (): void => {
  activeConfig = null;
};

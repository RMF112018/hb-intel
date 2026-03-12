export { HEALTH_PULSE_QUERY_KEY_ROOT, HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY, getProjectHealthPulseQueryKey } from './queryKeys.js';
export { useProjectHealthPulse, type IProjectHealthPulseDerivationMetadata, type IUseProjectHealthPulseInput, type IUseProjectHealthPulseResult } from './useProjectHealthPulse.js';
export {
  useHealthPulseAdminConfig,
  type IUseHealthPulseAdminConfigInput,
  type IUseHealthPulseAdminConfigResult,
  type IHealthPulseAdminConfigValidationIssue,
} from './useHealthPulseAdminConfig.js';
export {
  __resetHealthPulseAdminConfigStoreForTests,
  setHealthPulseAdminConfigStoreSnapshot,
} from './stateStore.js';

/**
 * SF21 hooks boundary.
 * Hooks orchestrate deterministic computors/governance modules and keep side effects out.
 */
export const HEALTH_PULSE_HOOKS_SCOPE = 'health-pulse/hooks';

/**
 * BIC module registration factory for Project Hub Health Pulse.
 * Follows Provisioning reference pattern. P2-C5 Blocker #4.
 */
import type { IBicModuleRegistration, IBicRegisteredItem } from '@hbc/bic-next-move';

export const PROJECT_HEALTH_PULSE_BIC_KEY = 'project-hub-pmp' as const;
export const PROJECT_HEALTH_PULSE_BIC_LABEL = 'Project Health Pulse' as const;

export function createProjectHealthPulseBicRegistration(
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>,
): IBicModuleRegistration {
  return {
    key: PROJECT_HEALTH_PULSE_BIC_KEY,
    label: PROJECT_HEALTH_PULSE_BIC_LABEL,
    queryFn,
  };
}

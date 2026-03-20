/**
 * BIC module registration factory for BD Strategic Intelligence.
 * Follows Provisioning reference pattern. P2-C5 Blocker #3.
 */
import type { IBicModuleRegistration, IBicRegisteredItem } from '@hbc/bic-next-move';

export const BD_STRATEGIC_INTELLIGENCE_BIC_KEY = 'bd-department-sections' as const;
export const BD_STRATEGIC_INTELLIGENCE_BIC_LABEL = 'BD Strategic Intelligence' as const;

export function createBdStrategicIntelligenceBicRegistration(
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>,
): IBicModuleRegistration {
  return {
    key: BD_STRATEGIC_INTELLIGENCE_BIC_KEY,
    label: BD_STRATEGIC_INTELLIGENCE_BIC_LABEL,
    queryFn,
  };
}

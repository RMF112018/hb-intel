/**
 * BIC module registration factory for Estimating Bid Readiness.
 * Follows Provisioning reference pattern (packages/provisioning/src/bic-registration.ts).
 * P2-C5 Blocker #1.
 */
import type { IBicModuleRegistration, IBicRegisteredItem } from '@hbc/bic-next-move';

export const ESTIMATING_BID_READINESS_BIC_KEY = 'estimating-pursuit' as const;
export const ESTIMATING_BID_READINESS_BIC_LABEL = 'Estimating Bid Readiness' as const;

export function createEstimatingBidReadinessBicRegistration(
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>,
): IBicModuleRegistration {
  return {
    key: ESTIMATING_BID_READINESS_BIC_KEY,
    label: ESTIMATING_BID_READINESS_BIC_LABEL,
    queryFn,
  };
}

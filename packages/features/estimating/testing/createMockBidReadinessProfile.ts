/**
 * Typed fixture factory for SF18 bid-readiness profile tests.
 *
 * @design D-SF18-T03
 */
import { estimatingBidReadinessProfile } from '../src/bid-readiness/profiles/index.js';
import type { IEstimatingBidReadinessProfile } from '../src/types/index.js';

export function createMockBidReadinessProfile(
  overrides: Partial<IEstimatingBidReadinessProfile> = {},
): IEstimatingBidReadinessProfile {
  return {
    ...estimatingBidReadinessProfile,
    ...overrides,
    criteria: overrides.criteria ?? estimatingBidReadinessProfile.criteria,
    thresholds: {
      ...estimatingBidReadinessProfile.thresholds,
      ...overrides.thresholds,
    },
  };
}

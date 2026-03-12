import type { IIntelligenceTrustMetadata } from '../../types/index.js';

export const createIntelligenceTrustMetadata = (
  overrides?: Partial<IIntelligenceTrustMetadata>
): IIntelligenceTrustMetadata => ({
  reliabilityTier: 'moderate',
  provenanceClass: 'meeting-summary',
  lastValidatedAt: null,
  reviewBy: null,
  isStale: false,
  aiTrustDowngraded: false,
  ...overrides,
});

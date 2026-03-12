import type { StrategicIntelligenceProfile } from '@hbc/strategic-intelligence';

export const createMockStrategicIntelligenceProfile = (
  overrides?: Partial<StrategicIntelligenceProfile>
): StrategicIntelligenceProfile => ({
  profileId: 'business-development-strategic-intelligence-mock',
  reliabilityDefaults: {
    staleThresholdDays: 30,
    reviewWindowDays: 14,
  },
  sensitivityDefaults: {
    defaultLevel: 'public-internal',
    redactRestrictedByDefault: true,
  },
  ...overrides,
});

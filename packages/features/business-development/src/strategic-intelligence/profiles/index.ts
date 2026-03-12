import type { StrategicIntelligenceProfile } from '@hbc/strategic-intelligence';

export const businessDevelopmentStrategicIntelligenceProfile: StrategicIntelligenceProfile = {
  profileId: 'business-development-strategic-intelligence',
  reliabilityDefaults: {
    staleThresholdDays: 30,
    reviewWindowDays: 14,
  },
  sensitivityDefaults: {
    defaultLevel: 'public-internal',
    redactRestrictedByDefault: true,
  },
};

import type {
  IStrategicIntelligenceState,
  StrategicIntelligenceProfile,
} from '../src/types/index.js';
import { createStrategicIntelligenceState } from '../src/api/index.js';

export const createMockStrategicIntelligenceProfile = (
  overrides?: Partial<StrategicIntelligenceProfile>
): StrategicIntelligenceProfile => ({
  profileId: 'strategic-intelligence-mock',
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

export const createMockStrategicIntelligenceState = (
  scorecardId = 'scorecard-mock'
): IStrategicIntelligenceState => createStrategicIntelligenceState({ scorecardId });

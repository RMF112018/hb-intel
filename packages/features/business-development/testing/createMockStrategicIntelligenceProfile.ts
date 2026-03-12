import type { StrategicIntelligenceProfile } from '@hbc/strategic-intelligence';
import { createMockStrategicIntelligenceProfile as createPrimitiveProfile } from '@hbc/strategic-intelligence/testing';

export const createMockStrategicIntelligenceProfile = (
  overrides?: Partial<StrategicIntelligenceProfile>
): StrategicIntelligenceProfile => ({
  ...createPrimitiveProfile(),
  profileId: 'business-development-strategic-intelligence-mock',
  ...overrides,
});

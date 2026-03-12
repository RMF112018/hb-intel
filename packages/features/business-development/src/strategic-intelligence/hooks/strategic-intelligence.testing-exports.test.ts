import { describe, expect, it } from 'vitest';
import {
  createMockBdStrategicIntelligenceView,
  createMockStrategicIntelligenceProfile,
} from '@hbc/features-business-development/testing';

describe('business-development strategic intelligence testing exports', () => {
  it('resolves adapter testing fixtures through the public testing entrypoint', () => {
    const profile = createMockStrategicIntelligenceProfile();
    const view = createMockBdStrategicIntelligenceView();

    expect(profile.profileId).toBe('business-development-strategic-intelligence-mock');
    expect(view.viewModel.snapshotId).toContain('bd-strategic-testing');
    expect(typeof view.viewModel.commitmentCount).toBe('number');
  });
});

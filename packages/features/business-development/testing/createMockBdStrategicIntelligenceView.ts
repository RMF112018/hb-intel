import type {
  BdStrategicIntelligenceViewModel,
} from '../src/strategic-intelligence/adapters/index.js';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { mapStrategicIntelligenceStateToBdView } from '../src/strategic-intelligence/adapters/index.js';

export interface MockBdStrategicIntelligenceView {
  viewModel: BdStrategicIntelligenceViewModel;
}

export const createMockBdStrategicIntelligenceView = (
  overrides?: Partial<MockBdStrategicIntelligenceView>
): MockBdStrategicIntelligenceView => {
  const state = createMockStrategicIntelligenceState('bd-strategic-testing');

  return {
    viewModel: mapStrategicIntelligenceStateToBdView(state),
    ...(overrides ?? {}),
  };
};

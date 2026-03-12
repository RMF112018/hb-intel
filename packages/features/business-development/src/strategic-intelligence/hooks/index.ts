import {
  useStrategicIntelligenceState,
  type UseStrategicIntelligenceStateInput,
} from '@hbc/strategic-intelligence';
import {
  mapStrategicIntelligenceStateToBdView,
  type BdStrategicIntelligenceViewModel,
} from '../adapters/index.js';

export interface UseBusinessDevelopmentStrategicIntelligenceInput
  extends UseStrategicIntelligenceStateInput {}

export interface UseBusinessDevelopmentStrategicIntelligenceResult {
  view: BdStrategicIntelligenceViewModel;
}

export const useBusinessDevelopmentStrategicIntelligence = (
  input: UseBusinessDevelopmentStrategicIntelligenceInput
): UseBusinessDevelopmentStrategicIntelligenceResult => {
  const { state } = useStrategicIntelligenceState(input);
  return {
    view: mapStrategicIntelligenceStateToBdView(state),
  };
};

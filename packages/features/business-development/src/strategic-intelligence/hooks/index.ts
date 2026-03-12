import {
  useStrategicIntelligenceState,
  type UseStrategicIntelligenceStateInput,
} from '@hbc/strategic-intelligence';
import {
  mapStrategicIntelligenceStateToBdView,
  type BdStrategicIntelligenceViewModel,
} from '../adapters/index.js';

export {
  useStrategicIntelligence,
  type UseStrategicIntelligenceInput,
  type UseStrategicIntelligenceResult,
  type BdStrategicIntelligenceBicOwnerAvatarProjection,
  type BdStrategicIntelligenceCanvasAssignmentProjection,
} from './useStrategicIntelligence.js';

export interface UseBusinessDevelopmentStrategicIntelligenceInput
  extends UseStrategicIntelligenceStateInput {}

export interface UseBusinessDevelopmentStrategicIntelligenceResult {
  view: BdStrategicIntelligenceViewModel;
}

export const useBusinessDevelopmentStrategicIntelligence = (
  input: UseBusinessDevelopmentStrategicIntelligenceInput
): UseBusinessDevelopmentStrategicIntelligenceResult => {
  const result = useStrategicIntelligenceState(input);
  const state = result.state;
  if (!state) {
    return {
      view: {
        snapshotId: '',
        decision: 'WAIT',
        decisionRationale: '',
        commitmentCount: 0,
        suggestionCount: 0,
        syncStatus: 'saved-locally',
        staleEntryCount: 0,
      },
    };
  }

  return {
    view: mapStrategicIntelligenceStateToBdView(state),
  };
};

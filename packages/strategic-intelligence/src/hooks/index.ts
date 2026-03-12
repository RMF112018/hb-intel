import {
  createStrategicIntelligenceState,
  type StrategicIntelligenceRuntimeInput,
} from '../api/index.js';
import type { IStrategicIntelligenceState } from '../types/index.js';

export interface UseStrategicIntelligenceStateInput extends StrategicIntelligenceRuntimeInput {}

export interface UseStrategicIntelligenceStateResult {
  state: IStrategicIntelligenceState;
}

export const useStrategicIntelligenceState = (
  input: UseStrategicIntelligenceStateInput
): UseStrategicIntelligenceStateResult => ({
  state: createStrategicIntelligenceState(input),
});

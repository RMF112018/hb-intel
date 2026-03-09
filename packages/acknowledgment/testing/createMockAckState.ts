import type { IAcknowledgmentState } from '../src/types/IAcknowledgment';
import { mockAckStates } from './mockAckStates';

export function createMockAckState(
  overrides?: Partial<IAcknowledgmentState>
): IAcknowledgmentState {
  return { ...mockAckStates.pending, ...overrides };
}

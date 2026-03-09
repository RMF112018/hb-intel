import type { IAcknowledgmentConfig } from '../src/types/IAcknowledgment';
import { PARTY_1, PARTY_2 } from './mockAckStates';

export function createMockAckConfig<T = unknown>(
  overrides?: Partial<IAcknowledgmentConfig<T>>
): IAcknowledgmentConfig<T> {
  return {
    label: 'Test Ack',
    mode: 'single',
    contextType: 'admin-provisioning',
    resolveParties: () => [PARTY_1, PARTY_2],
    resolvePromptMessage: () => 'Please acknowledge.',
    ...overrides,
  };
}

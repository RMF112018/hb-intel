import { vi } from 'vitest';
import type { IUseAcknowledgmentReturn } from '../src/types/IAcknowledgment';
import { mockAckStates } from './mockAckStates';

export function mockUseAcknowledgment(
  overrides?: Partial<IUseAcknowledgmentReturn>
): IUseAcknowledgmentReturn {
  return {
    state: mockAckStates.pending,
    isLoading: false,
    isError: false,
    submit: vi.fn().mockResolvedValue(undefined),
    isSubmitting: false,
    ...overrides,
  };
}

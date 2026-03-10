import { vi } from 'vitest';
import type { IStepWizardState, IUseStepWizardReturn } from '../src/types/IStepWizard';
import { mockWizardStates } from './mockWizardStates';

/**
 * Creates a mock IUseStepWizardReturn with vi.fn() mocks for all mutations.
 * Accepts an optional IStepWizardState override (defaults to notStarted).
 */
export function mockUseStepWizard(
  stateOverride?: Partial<IStepWizardState>,
): IUseStepWizardReturn {
  const state: IStepWizardState = {
    ...mockWizardStates.notStarted.state,
    ...stateOverride,
  };

  return {
    state,
    advance: vi.fn(),
    goTo: vi.fn(),
    markComplete: vi.fn().mockResolvedValue(undefined),
    markBlocked: vi.fn(),
    reopenStep: vi.fn(),
    getValidationError: vi.fn().mockReturnValue(null),
  };
}

import type { IStepWizardConfig, IStep } from '../src/types/IStepWizard';

const defaultSteps: IStep<unknown>[] = [
  { stepId: 'step-1', label: 'Step 1', required: true, order: 1 },
  { stepId: 'step-2', label: 'Step 2', required: false, order: 2 },
  { stepId: 'step-3', label: 'Step 3', required: false, order: 3 },
];

/**
 * Creates a valid IStepWizardConfig<unknown> with 3 steps for testing.
 * Step 1 is required by default; steps 2 and 3 are optional.
 */
export function createMockWizardConfig(
  overrides?: Partial<IStepWizardConfig<unknown>>
): IStepWizardConfig<unknown> {
  return {
    title: 'Mock Wizard',
    steps: defaultSteps,
    orderMode: 'sequential',
    ...overrides,
  };
}

import type { IStepWizardConfig, IStep } from '../src/types/IStepWizard';

const defaultSteps: IStep<unknown>[] = [
  { stepId: 'step-1', label: 'First Step', required: true, order: 1 },
  { stepId: 'step-2', label: 'Second Step', required: true, order: 2 },
  { stepId: 'step-3', label: 'Third Step', required: false, order: 3 },
];

/**
 * Creates a valid IStepWizardConfig<unknown> with 3 steps for testing.
 * Steps 1 and 2 are required by default; step 3 is optional.
 */
export function createMockWizardConfig(
  overrides?: Partial<IStepWizardConfig<unknown>>
): IStepWizardConfig<unknown> {
  return {
    title: 'Mock Wizard',
    steps: defaultSteps,
    orderMode: 'sequential',
    allowReopen: false,
    allowForceComplete: false,
    draftKey: 'mock-wizard-test',
    ...overrides,
  };
}

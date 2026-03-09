import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HbcStepSidebar } from '../HbcStepSidebar';
import { createMockWizardConfig } from '@hbc/step-wizard/testing';
import type { IStepWizardState } from '../../types/IStepWizard';

// Mock @hbc/complexity
vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard', showCoaching: false })),
}));

// Mock useStepWizard to return controlled state
vi.mock('../../hooks/useStepWizard', () => ({
  useStepWizard: vi.fn(),
}));

import { useStepWizard } from '../../hooks/useStepWizard';

function mockWizardReturn(overrides?: Partial<IStepWizardState>) {
  const state: IStepWizardState = {
    steps: [
      {
        stepId: 'step-1',
        label: 'Step 1',
        required: true,
        status: 'not-started',
        completedAt: null,
        assignee: null,
        validationError: null,
        isOverdue: false,
        isVisited: true,
        isUnlocked: true,
      },
      {
        stepId: 'step-2',
        label: 'Step 2',
        required: false,
        status: 'not-started',
        completedAt: null,
        assignee: null,
        validationError: null,
        isOverdue: false,
        isVisited: false,
        isUnlocked: false,
      },
    ],
    activeStepId: 'step-1',
    completedCount: 0,
    requiredCount: 1,
    isComplete: false,
    percentComplete: 0,
    onAllCompleteFired: false,
    ...overrides,
  };

  vi.mocked(useStepWizard).mockReturnValue({
    state,
    advance: vi.fn(),
    goTo: vi.fn(),
    markComplete: vi.fn(),
    markBlocked: vi.fn(),
    reopenStep: vi.fn(),
    getValidationError: () => null,
  });

  return state;
}

describe('HbcStepSidebar', () => {
  const config = createMockWizardConfig();

  it('calls onStepSelect when unlocked step is clicked', async () => {
    mockWizardReturn();
    const onStepSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <HbcStepSidebar
        item={{}}
        config={config}
        activeStepId="step-1"
        onStepSelect={onStepSelect}
        complexityTier="standard"
      />,
    );

    const stepButton = screen.getByRole('button', { name: /Step 1/ });
    await user.click(stepButton);
    expect(onStepSelect).toHaveBeenCalledWith('step-1');
  });

  it('does not call onStepSelect for locked steps (D-01)', async () => {
    mockWizardReturn();
    const onStepSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <HbcStepSidebar
        item={{}}
        config={config}
        activeStepId="step-1"
        onStepSelect={onStepSelect}
        complexityTier="standard"
      />,
    );

    const lockedButton = screen.getByRole('button', { name: /Step 2/ });
    await user.click(lockedButton);
    expect(onStepSelect).not.toHaveBeenCalledWith('step-2');
  });
});

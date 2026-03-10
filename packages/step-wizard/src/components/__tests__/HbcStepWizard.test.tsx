// components/__tests__/HbcStepWizard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HbcStepWizard } from '../HbcStepWizard';
import { createMockWizardConfig, mockWizardStates, mockUseStepWizard } from '@hbc/step-wizard/testing';
import type { IUseStepWizardReturn } from '../../types/IStepWizard';

// Mock useStepWizard
vi.mock('../../hooks/useStepWizard', () => ({
  useStepWizard: vi.fn(),
}));
import { useStepWizard } from '../../hooks/useStepWizard';

// Mock useComplexity
vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard', showCoaching: false })),
}));
import { useComplexity } from '@hbc/complexity';

// Mock HbcCoachingCallout
vi.mock('@hbc/ui-kit', () => ({
  HbcCoachingCallout: ({ message }: { message: string }) => <div data-testid="coaching-callout">{message}</div>,
}));

const config = createMockWizardConfig();
const renderStep = vi.fn((stepId: string) => <div data-testid="step-body">Step: {stepId}</div>);

function setupMock(overrides?: Partial<IUseStepWizardReturn>) {
  const mock = { ...mockUseStepWizard(), ...overrides };
  vi.mocked(useStepWizard).mockReturnValue(mock);
  return mock;
}

describe('HbcStepWizard', () => {
  it('vertical variant: renders sidebar and content area', () => {
    setupMock();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="vertical" complexityTier="standard" />);
    expect(screen.getByRole('navigation', { name: 'Wizard steps' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('horizontal variant: renders progress dots and step label', () => {
    setupMock();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="horizontal" complexityTier="standard" />);
    expect(screen.getByRole('navigation', { name: 'Step progress' })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });

  it('renders active step body via renderStep prop', () => {
    setupMock();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByTestId('step-body')).toBeInTheDocument();
    expect(renderStep).toHaveBeenCalledWith('step-1', {});
  });

  it('essential tier: shows coaching callout', () => {
    vi.mocked(useComplexity).mockReturnValue({
      tier: 'essential',
      showCoaching: true,
      isLocked: false,
      lockedBy: undefined,
      lockedUntil: undefined,
      atLeast: () => false,
      is: () => false,
      setTier: vi.fn(),
      setShowCoaching: vi.fn(),
    });
    setupMock();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="essential" />);
    expect(screen.getByTestId('coaching-callout')).toBeInTheDocument();
  });

  it('complete state: shows "All steps complete" message', () => {
    setupMock({ state: mockWizardStates.complete.state });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByText(/All steps complete/)).toBeInTheDocument();
  });

  it('nav: shows "Back" button when not on first step', () => {
    setupMock({ state: mockWizardStates.inProgress.state });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('nav: shows "Mark Complete & Next" vs "Complete" on last step', () => {
    // Not on last step → "Mark Complete & Next"
    setupMock();
    const { unmount } = render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByText('Mark Complete & Next')).toBeInTheDocument();
    unmount();

    // On last step → "Complete"
    const lastStepState = {
      ...mockWizardStates.notStarted.state,
      activeStepId: 'step-3',
    };
    setupMock({ state: lastStepState });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('nav: shows validation error as alert', () => {
    setupMock({ getValidationError: vi.fn().mockReturnValue('Field required') });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some((el) => el.textContent === 'Field required')).toBe(true);
  });

  it('horizontal variant: renders complete step with checkmark', () => {
    const completeState = {
      ...mockWizardStates.inProgress.state,
      steps: mockWizardStates.inProgress.state.steps.map((s) =>
        s.stepId === 'step-1' ? { ...s, status: 'complete' as const } : s,
      ),
    };
    setupMock({ state: completeState });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="horizontal" complexityTier="standard" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('horizontal variant: essential tier shows coaching callout', () => {
    vi.mocked(useComplexity).mockReturnValue({
      tier: 'essential',
      showCoaching: true,
      isLocked: false,
      lockedBy: undefined,
      lockedUntil: undefined,
      atLeast: () => false,
      is: () => false,
      setTier: vi.fn(),
      setShowCoaching: vi.fn(),
    });
    setupMock();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="horizontal" complexityTier="essential" />);
    expect(screen.getByTestId('coaching-callout')).toBeInTheDocument();
  });

  it('horizontal variant: complete state shows all steps complete', () => {
    setupMock({ state: mockWizardStates.complete.state });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="horizontal" complexityTier="standard" />);
    expect(screen.getByText(/All steps complete/)).toBeInTheDocument();
  });

  it('defaults to vertical variant when variant is omitted', () => {
    setupMock();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByRole('navigation', { name: 'Wizard steps' })).toBeInTheDocument();
  });

  it('forceComplete button shown when allowForceComplete + validation error', () => {
    const forceConfig = createMockWizardConfig({ allowForceComplete: true });
    // Need a state where the active step has a validationError on the runtime entry
    const stateWithValidation = {
      ...mockWizardStates.notStarted.state,
      steps: mockWizardStates.notStarted.state.steps.map((s) =>
        s.stepId === 'step-1' ? { ...s, validationError: 'Error here' } : s,
      ),
    };
    setupMock({
      state: stateWithValidation,
      getValidationError: vi.fn().mockReturnValue('Error here'),
    });
    render(<HbcStepWizard item={{}} config={forceConfig} renderStep={renderStep} complexityTier="standard" />);
    expect(screen.getByText('Complete Anyway')).toBeInTheDocument();
  });

  it('nav: clicking Back calls goTo with previous step', async () => {
    const mock = setupMock({ state: mockWizardStates.inProgress.state });
    const user = userEvent.setup();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    await user.click(screen.getByText('Back'));
    expect(mock.goTo).toHaveBeenCalledWith('step-1');
  });

  it('nav: clicking Mark Complete & Next calls markComplete with active step', async () => {
    const mock = setupMock();
    const user = userEvent.setup();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="standard" />);
    await user.click(screen.getByText('Mark Complete & Next'));
    expect(mock.markComplete).toHaveBeenCalledWith('step-1');
  });

  it('nav: clicking Complete Anyway calls markComplete with force=true', async () => {
    const forceConfig = createMockWizardConfig({ allowForceComplete: true });
    const stateWithValidation = {
      ...mockWizardStates.notStarted.state,
      steps: mockWizardStates.notStarted.state.steps.map((s) =>
        s.stepId === 'step-1' ? { ...s, validationError: 'Error here' } : s,
      ),
    };
    const mock = setupMock({
      state: stateWithValidation,
      getValidationError: vi.fn().mockReturnValue('Error here'),
    });
    const user = userEvent.setup();
    render(<HbcStepWizard item={{}} config={forceConfig} renderStep={renderStep} complexityTier="standard" />);
    await user.click(screen.getByText('Complete Anyway'));
    expect(mock.markComplete).toHaveBeenCalledWith('step-1', true);
  });

  it('nav: essential tier shows simplified validation message', () => {
    setupMock({ getValidationError: vi.fn().mockReturnValue('Detailed error') });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} complexityTier="essential" />);
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some((el) => el.textContent === 'This step is incomplete.')).toBe(true);
  });

  it('horizontal variant: shows locked dot class for locked steps', () => {
    const lockedState = {
      ...mockWizardStates.notStarted.state,
      steps: mockWizardStates.notStarted.state.steps.map((s, i) =>
        i === 2 ? { ...s, isUnlocked: false } : s,
      ),
    };
    setupMock({ state: lockedState });
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="horizontal" complexityTier="standard" />);
    const dots = screen.getAllByRole('button', { name: /Step \d:/ });
    expect(dots[2].className).toContain('locked');
  });

  it('horizontal variant: clicking step dot calls goTo', async () => {
    const mock = setupMock();
    const user = userEvent.setup();
    render(<HbcStepWizard item={{}} config={config} renderStep={renderStep} variant="horizontal" complexityTier="standard" />);
    const dots = screen.getAllByRole('button', { name: /Step \d:/ });
    await user.click(dots[1]); // click second step dot
    expect(mock.goTo).toHaveBeenCalledWith('step-2');
  });
});

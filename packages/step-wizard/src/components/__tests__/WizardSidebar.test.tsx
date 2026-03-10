// components/__tests__/WizardSidebar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WizardSidebar } from '../shared/WizardSidebar';
import type { IStepRuntimeEntry } from '../../types/IStepWizard';

function makeStep(overrides: Partial<IStepRuntimeEntry> & { stepId: string; label: string }): IStepRuntimeEntry {
  return {
    required: true,
    order: 1,
    status: 'not-started',
    completedAt: null,
    assignee: null,
    validationError: null,
    isOverdue: false,
    isVisited: true,
    isUnlocked: true,
    ...overrides,
  };
}

const threeSteps: IStepRuntimeEntry[] = [
  makeStep({ stepId: 's1', label: 'Alpha', order: 1 }),
  makeStep({ stepId: 's2', label: 'Beta', order: 2 }),
  makeStep({ stepId: 's3', label: 'Gamma', order: 3 }),
];

const fiveSteps: IStepRuntimeEntry[] = [
  makeStep({ stepId: 's1', label: 'Alpha', order: 1 }),
  makeStep({ stepId: 's2', label: 'Beta', order: 2 }),
  makeStep({ stepId: 's3', label: 'Gamma', order: 3 }),
  makeStep({ stepId: 's4', label: 'Delta', order: 4 }),
  makeStep({ stepId: 's5', label: 'Epsilon', order: 5 }),
];

describe('WizardSidebar', () => {
  const noop = vi.fn();
  const noError = () => null;

  it('renders all steps as list items', () => {
    render(
      <WizardSidebar
        steps={threeSteps}
        activeStepId="s1"
        tier="standard"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('essential tier: shows only adjacent steps (prev/current/next)', () => {
    render(
      <WizardSidebar
        steps={fiveSteps}
        activeStepId="s3"
        tier="essential"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
  });

  it('essential tier: shows step hint when >3 steps', () => {
    render(
      <WizardSidebar
        steps={fiveSteps}
        activeStepId="s3"
        tier="essential"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getByText(/Showing step 3 of 5/)).toBeInTheDocument();
  });

  it('expert tier: shows completedAt timestamp on completed steps', () => {
    const stepsWithComplete = [
      makeStep({ stepId: 's1', label: 'Alpha', order: 1, status: 'complete', completedAt: '2026-03-08T09:00:00Z' }),
      makeStep({ stepId: 's2', label: 'Beta', order: 2 }),
    ];
    render(
      <WizardSidebar
        steps={stepsWithComplete}
        activeStepId="s2"
        tier="expert"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getByTagName ? screen.getByText(/2026/) : screen.getByText(/2026|3\/8\/2026/i)).toBeInTheDocument();
  });

  it('expert tier: shows validation dot when step has error', () => {
    const getError = (stepId: string) => (stepId === 's1' ? 'Error!' : null);
    render(
      <WizardSidebar
        steps={[makeStep({ stepId: 's1', label: 'Alpha', order: 1, status: 'in-progress' }), makeStep({ stepId: 's2', label: 'Beta', order: 2 })]}
        activeStepId="s2"
        tier="expert"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={getError}
      />,
    );
    expect(screen.getByLabelText('Has validation issue')).toBeInTheDocument();
  });

  it('locked step: shows lock icon in sequential-with-jumps mode', () => {
    const lockedSteps = [
      makeStep({ stepId: 's1', label: 'Alpha', order: 1, isVisited: true, isUnlocked: true }),
      makeStep({ stepId: 's2', label: 'Beta', order: 2, isVisited: false, isUnlocked: false }),
    ];
    render(
      <WizardSidebar
        steps={lockedSteps}
        activeStepId="s1"
        tier="standard"
        orderMode="sequential-with-jumps"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getByLabelText('Complete preceding steps to unlock')).toBeInTheDocument();
  });

  it('overdue step: shows overdue badge', () => {
    const overdueSteps = [
      makeStep({ stepId: 's1', label: 'Alpha', order: 1, isOverdue: true }),
    ];
    render(
      <WizardSidebar
        steps={overdueSteps}
        activeStepId="s1"
        tier="standard"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getByLabelText('Overdue')).toBeInTheDocument();
  });

  it('essential tier with invalid activeStepId: falls back to first step', () => {
    render(
      <WizardSidebar
        steps={fiveSteps}
        activeStepId="nonexistent"
        tier="essential"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1); // Only first step shown
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('renders blocked step aria-label with "Blocked" suffix', () => {
    const blockedSteps = [
      makeStep({ stepId: 's1', label: 'Alpha', order: 1, status: 'blocked' }),
    ];
    render(
      <WizardSidebar
        steps={blockedSteps}
        activeStepId="s1"
        tier="standard"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getByRole('button', { name: /Blocked/ })).toBeInTheDocument();
  });

  it('assignee avatar: rendered at standard tier, hidden at essential tier', () => {
    const stepsWithAssignee = [
      makeStep({ stepId: 's1', label: 'Alpha', order: 1, assignee: { userId: 'u1', displayName: 'Jane Doe' } }),
    ];
    const { unmount } = render(
      <WizardSidebar
        steps={stepsWithAssignee}
        activeStepId="s1"
        tier="standard"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.getByLabelText('Jane Doe')).toBeInTheDocument();
    unmount();

    render(
      <WizardSidebar
        steps={stepsWithAssignee}
        activeStepId="s1"
        tier="essential"
        orderMode="sequential"
        showCoaching={false}
        onStepClick={noop}
        getValidationError={noError}
      />,
    );
    expect(screen.queryByLabelText('Jane Doe')).not.toBeInTheDocument();
  });
});

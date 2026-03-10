// components/__tests__/StepStatusIcon.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepStatusIcon } from '../shared/StepStatusIcon';
import type { StepStatus } from '../../types/IStepWizard';

describe('StepStatusIcon', () => {
  const cases: Array<{ status: StepStatus; ariaLabel: string; colorClass: string }> = [
    { status: 'not-started', ariaLabel: 'Not started', colorClass: 'hbc-step-icon--neutral' },
    { status: 'in-progress', ariaLabel: 'In progress', colorClass: 'hbc-step-icon--active' },
    { status: 'complete', ariaLabel: 'Complete', colorClass: 'hbc-step-icon--success' },
    { status: 'blocked', ariaLabel: 'Blocked', colorClass: 'hbc-step-icon--warning' },
    { status: 'skipped', ariaLabel: 'Skipped', colorClass: 'hbc-step-icon--muted' },
  ];

  it.each(cases)('renders $status with correct aria-label and CSS class', ({ status, ariaLabel, colorClass }) => {
    render(<StepStatusIcon status={status} />);
    const icon = screen.getByRole('img', { name: ariaLabel });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass(colorClass);
    expect(icon).toHaveClass('hbc-step-icon');
  });
});

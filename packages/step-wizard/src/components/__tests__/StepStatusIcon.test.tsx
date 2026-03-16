// components/__tests__/StepStatusIcon.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepStatusIcon } from '../shared/StepStatusIcon';
import type { StepStatus } from '../../types/IStepWizard';

describe('StepStatusIcon', () => {
  const cases: Array<{ status: StepStatus; ariaLabel: string }> = [
    { status: 'not-started', ariaLabel: 'Not started' },
    { status: 'in-progress', ariaLabel: 'In progress' },
    { status: 'complete', ariaLabel: 'Complete' },
    { status: 'blocked', ariaLabel: 'Blocked' },
    { status: 'skipped', ariaLabel: 'Skipped' },
  ];

  it.each(cases)('renders $status with correct aria-label', ({ status, ariaLabel }) => {
    render(<StepStatusIcon status={status} />);
    const icon = screen.getByRole('img', { name: ariaLabel });
    expect(icon).toBeInTheDocument();
  });
});

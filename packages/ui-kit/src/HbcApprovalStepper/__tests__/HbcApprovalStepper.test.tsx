import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcApprovalStepper } from '../index.js';
import type { ApprovalStep } from '../types.js';

const baseSteps: ApprovalStep[] = [
  { id: '1', userName: 'Alice Johnson', userRole: 'PM' },
  { id: '2', userName: 'Bob Smith', userRole: 'Superintendent' },
];

describe('HbcApprovalStepper', () => {
  it('renders with data-hbc-ui="approval-stepper"', () => {
    const { container } = render(<HbcApprovalStepper steps={baseSteps} />);
    expect(
      container.querySelector('[data-hbc-ui="approval-stepper"]'),
    ).toBeInTheDocument();
  });

  it('has role="list" with aria-label', () => {
    render(<HbcApprovalStepper steps={baseSteps} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Approval steps');
  });

  it('renders all steps with user names', () => {
    render(<HbcApprovalStepper steps={baseSteps} />);
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('shows decision badge text when decision provided', () => {
    const steps: ApprovalStep[] = [
      { id: '1', userName: 'Alice Johnson', userRole: 'PM', decision: 'approved' },
    ];
    render(<HbcApprovalStepper steps={steps} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('shows timestamp when provided', () => {
    const steps: ApprovalStep[] = [
      {
        id: '1',
        userName: 'Alice Johnson',
        userRole: 'PM',
        timestamp: '2026-03-10T14:30:00Z',
      },
    ];
    render(<HbcApprovalStepper steps={steps} />);
    // The component formats the date — just verify some date text rendered
    expect(screen.getByText(/Mar/)).toBeInTheDocument();
  });

  it('shows comment when provided', () => {
    const steps: ApprovalStep[] = [
      {
        id: '1',
        userName: 'Alice Johnson',
        userRole: 'PM',
        comment: 'Looks good to me',
      },
    ];
    render(<HbcApprovalStepper steps={steps} />);
    expect(screen.getByText(/Looks good to me/)).toBeInTheDocument();
  });
});

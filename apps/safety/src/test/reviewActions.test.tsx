// Phase-3 closure §F — governed confirmation UX for the supersede path.
// Verifies that SafetyReviewActions routes high-risk mutations through
// HbcConfirmDialog (not a browser prompt), and that cancel does not fire
// the supersede mutation.
import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Replace the router Link with a plain anchor for this unit test; we only
// need to verify the action-cluster semantics, not route integration.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...rest }: { children: ReactNode } & Record<string, unknown>) => (
    <a data-testid="mock-link" {...rest}>
      {children}
    </a>
  ),
}));

import { SafetyReviewActions } from '../components/SafetyReviewActions.js';

describe('SafetyReviewActions — governed confirmation UX', () => {
  it('renders retry button always', () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-1"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('standard Retry is single-click (no confirmation)', async () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-1"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith('run-1', false);
  });

  it('Supersede & commit is only shown for duplicate-suspected runs', () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-1"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    expect(screen.queryByRole('button', { name: /supersede & commit/i })).toBeNull();
  });

  it('Supersede & commit opens a governed confirm dialog (not browser prompt)', async () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const trigger = screen.getByRole('button', { name: /^supersede & commit$/i });
    await userEvent.click(trigger);
    // HbcConfirmDialog renders role="alertdialog".
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    // Mutation must NOT fire until explicit confirmation.
    expect(onRetry).not.toHaveBeenCalled();
    // Dialog must name the action it will take.
    expect(within(dialog).getByText(/supersede prior inspection/i)).toBeInTheDocument();
  });

  it('Cancel in the confirm dialog does not fire the supersede mutation', async () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /^supersede & commit$/i }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('Confirming the dialog fires onRetry with supersedePrior=true', async () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    // The trigger button sits in the action cluster. The confirm button inside
    // the dialog carries the same label; disambiguate via data-* attribute.
    await userEvent.click(
      screen.getByRole('button', { name: /^supersede & commit$/i }),
    );
    const dialog = await screen.findByRole('alertdialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: /supersede & commit/i,
    });
    await userEvent.click(confirmButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith('run-42', true);
  });
});

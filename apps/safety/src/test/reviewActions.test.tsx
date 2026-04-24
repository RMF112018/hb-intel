// Phase-8 Prompt 01 — governed replay preview-and-supersede UX.
// Verifies that SafetyReviewActions routes the supersede mutation through
// the governed SafetyReplayPreviewDialog (HbcModal, alertdialog role), that
// the acknowledgment checkbox gates the destructive confirm, that cancel
// does not fire the mutation, and that the dialog surfaces the preview
// context drawn from row data. Plain Retry remains single-click by design
// (no prior-data replacement) per the retry-truthfulness rule.
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

async function openSupersedeDialog(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  await user.click(screen.getByRole('button', { name: /^supersede & commit$/i }));
  return screen.findByRole('alertdialog');
}

async function tickAck(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement): Promise<void> {
  // Single checkbox in the dialog is the acknowledgment; the Fluent Checkbox
  // label sits outside the input's accessible name, so key off role directly.
  const ack = within(dialog).getByRole('checkbox');
  await user.click(ack);
}

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

  it('Supersede & commit opens a governed preview dialog (alertdialog, not browser prompt)', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    expect(dialog).toBeInTheDocument();
    // Mutation must NOT fire on mere open.
    expect(onRetry).not.toHaveBeenCalled();
    // Dialog must name the action it will take.
    expect(within(dialog).getByText(/supersede prior inspection/i)).toBeInTheDocument();
  });

  it('Cancel in the preview dialog does not fire the supersede mutation', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('Confirm is disabled until the acknowledgment checkbox is ticked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    const confirmButton = within(dialog).getByRole('button', {
      name: /^supersede & commit$/i,
    });
    expect(confirmButton).toBeDisabled();
    // Clicking the disabled confirm must not fire the mutation.
    await user.click(confirmButton);
    expect(onRetry).not.toHaveBeenCalled();
    // After acknowledgment, it enables.
    await tickAck(user, dialog);
    expect(confirmButton).not.toBeDisabled();
  });

  it('Confirming with acknowledgment fires onRetry with supersedePrior=true', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    await tickAck(user, dialog);
    await user.click(
      within(dialog).getByRole('button', { name: /^supersede & commit$/i }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith('run-42', true);
  });

  it('renders prior-inspection link when inspectionEventId is provided', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        inspectionEventId="insp-7"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    const link = within(dialog).getByTestId('mock-link');
    expect(link).toHaveAttribute('data-safety-ui', 'replay-preview-prior-link');
    expect(link).toHaveTextContent(/insp-7/);
  });

  it('omits the prior-inspection link when inspectionEventId is absent', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    expect(within(dialog).queryByTestId('mock-link')).toBeNull();
    expect(
      within(dialog).getByText(/no committed inspection is linked/i),
    ).toBeInTheDocument();
  });

  it('surfaces preview context (run, workbook, project, template, prior error)', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
        previewContext={{
          uploadFileName: 'workbook-42.xlsx',
          attemptNumber: 3,
          projectNumber: 'PRJ-001',
          projectNameSnapshot: 'Example Project',
          terminalStatus: 'review-required',
          templateVersionDetected: '2.1.0',
          errorSummary: 'duplicate checksum vs inspection insp-7',
        }}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    expect(within(dialog).getByText('run-42')).toBeInTheDocument();
    expect(within(dialog).getByText('workbook-42.xlsx')).toBeInTheDocument();
    expect(within(dialog).getByText('PRJ-001')).toBeInTheDocument();
    expect(within(dialog).getByText('Example Project')).toBeInTheDocument();
    expect(within(dialog).getByText('2.1.0')).toBeInTheDocument();
    expect(within(dialog).getByText('review-required')).toBeInTheDocument();
    expect(
      within(dialog).getByText(/duplicate checksum vs inspection insp-7/i),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/attempt 3/i)).toBeInTheDocument();
  });

  it('shows the explicit consequence block (supersede, rollup, audit, reversal)', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    const dialog = await openSupersedeDialog(user);
    const consequence = within(dialog).getByText(/what supersede will do/i)
      .closest('section');
    expect(consequence).not.toBeNull();
    const scoped = within(consequence as HTMLElement);
    expect(scoped.getByText(/replay the retained workbook/i)).toBeInTheDocument();
    expect(scoped.getAllByText(/project-week rollup/i).length).toBeGreaterThan(0);
    expect(scoped.getByText(/audit history/i)).toBeInTheDocument();
    expect(scoped.getByText(/cannot be reversed from the ui/i)).toBeInTheDocument();
    expect(scoped.getByText(/backend is the final authority/i)).toBeInTheDocument();
  });

  it('reopening the dialog resets the acknowledgment checkbox', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-42"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
      />,
    );
    let dialog = await openSupersedeDialog(user);
    await tickAck(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
    dialog = await openSupersedeDialog(user);
    const ack = within(dialog).getByRole('checkbox');
    expect(ack).not.toBeChecked();
    // Sanity: the acknowledgment label text is present next to the checkbox.
    expect(
      within(dialog).getByText(/reviewed the replay impact/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /^supersede & commit$/i }),
    ).toBeDisabled();
  });
});

describe('SafetyReviewActions — replay capability gate', () => {
  it('hides plain Retry and renders the capability reason when disabledByCapability is true', () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-1"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        disabledByCapability={true}
        capabilityReason="You lack the Replay capability."
      />,
    );
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull();
    expect(screen.getByText(/you lack the replay capability/i)).toBeInTheDocument();
  });

  it('hides Supersede & commit for duplicates when disabledByCapability is true', () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-dup"
        isDuplicate={true}
        isPending={false}
        onRetry={onRetry}
        disabledByCapability={true}
        capabilityReason="Not authorized."
      />,
    );
    expect(screen.queryByRole('button', { name: /supersede & commit/i })).toBeNull();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('falls back to a generic reason when capabilityReason is omitted', () => {
    const onRetry = vi.fn();
    render(
      <SafetyReviewActions
        runId="run-1"
        isDuplicate={false}
        isPending={false}
        onRetry={onRetry}
        disabledByCapability={true}
      />,
    );
    expect(screen.getByText(/not authorized to replay/i)).toBeInTheDocument();
  });

  it('renders the normal Retry when disabledByCapability is false (default)', () => {
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
});

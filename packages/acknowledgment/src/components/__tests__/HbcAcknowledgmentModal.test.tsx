import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcAcknowledgmentModal } from '../HbcAcknowledgmentModal';

const baseProps = {
  isOpen: true,
  intent: 'acknowledge' as const,
  promptMessage: 'Please confirm you have reviewed this document.',
  onConfirm: vi.fn(),
  onDecline: vi.fn(),
  onCancel: vi.fn(),
};

describe('HbcAcknowledgmentModal — acknowledge path', () => {
  it('renders prompt message', () => {
    render(<HbcAcknowledgmentModal {...baseProps} />);
    expect(screen.getByText(baseProps.promptMessage)).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <HbcAcknowledgmentModal {...baseProps} isOpen={false} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('confirm button enabled when no phrase required', () => {
    render(<HbcAcknowledgmentModal {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled();
  });

  it('confirm button disabled until correct phrase typed (D-03)', async () => {
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal
        {...baseProps}
        requireConfirmationPhrase
        confirmationPhrase="I CONFIRM"
      />,
    );
    const btn = screen.getByRole('button', { name: 'Confirm' });
    expect(btn).toBeDisabled();
    await user.type(screen.getByLabelText(/I CONFIRM/i), 'I CONFIRM');
    expect(btn).not.toBeDisabled();
  });

  it('shows mismatch hint for wrong phrase (D-03)', async () => {
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal {...baseProps} requireConfirmationPhrase />,
    );
    await user.type(screen.getByLabelText(/I CONFIRM/i), 'wrong');
    expect(screen.getByRole('alert')).toHaveTextContent('Phrase does not match');
  });

  it('calls onConfirm when confirm clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<HbcAcknowledgmentModal {...baseProps} onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<HbcAcknowledgmentModal {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders modal with aria-modal and title', () => {
    render(<HbcAcknowledgmentModal {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Confirm Acknowledgment')).toBeInTheDocument();
  });

  it('renders Decline Sign-Off title for decline intent', () => {
    render(
      <HbcAcknowledgmentModal {...baseProps} intent="decline" />,
    );
    expect(screen.getByText('Decline Sign-Off')).toBeInTheDocument();
  });
});

describe('HbcAcknowledgmentModal — decline path', () => {
  const declineProps = { ...baseProps, intent: 'decline' as const };

  it('free-text decline requires 10 chars (D-04)', async () => {
    const user = userEvent.setup();
    render(<HbcAcknowledgmentModal {...declineProps} />);
    const btn = screen.getByRole('button', { name: 'Confirm Decline' });
    expect(btn).toBeDisabled();
    await user.type(screen.getByLabelText(/Reason/), 'short');
    expect(btn).toBeDisabled();
    await user.clear(screen.getByLabelText(/Reason/));
    await user.type(screen.getByLabelText(/Reason/), 'long enough reason');
    expect(btn).not.toBeDisabled();
  });

  it('renders radio buttons when declineReasons provided (D-04)', () => {
    render(
      <HbcAcknowledgmentModal
        {...declineProps}
        declineReasons={['Incomplete', 'Incorrect parties']}
      />,
    );
    // 2 provided + "Other" appended = 3
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('does not duplicate "Other" when already in declineReasons', () => {
    render(
      <HbcAcknowledgmentModal
        {...declineProps}
        declineReasons={['Incomplete', 'Other']}
      />,
    );
    // 2 provided (includes "Other") — no duplicate
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('shows free-text when "Other" selected (D-04)', async () => {
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal
        {...declineProps}
        declineReasons={['Incomplete', 'Other']}
      />,
    );
    await user.click(screen.getByLabelText('Other'));
    expect(screen.getByLabelText('Please elaborate')).toBeInTheDocument();
  });

  it('calls onDecline with reason and category', async () => {
    const onDecline = vi.fn();
    const user = userEvent.setup();
    render(
      <HbcAcknowledgmentModal
        {...declineProps}
        onDecline={onDecline}
        declineReasons={['Incomplete']}
      />,
    );
    await user.click(screen.getByLabelText('Incomplete'));
    await user.click(screen.getByRole('button', { name: 'Confirm Decline' }));
    expect(onDecline).toHaveBeenCalledWith('Incomplete', 'Incomplete');
  });

  it('shows character count display', () => {
    render(<HbcAcknowledgmentModal {...declineProps} />);
    expect(screen.getByText('0 / 10 min')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcAcknowledgmentPanel } from '../HbcAcknowledgmentPanel';
import type {
  IAcknowledgmentConfig,
  IAcknowledgmentState,
  IUseAcknowledgmentReturn,
  IUseAcknowledgmentGateReturn,
} from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

const PARTY_1 = { userId: 'user-1', displayName: 'Alice', role: 'PM', order: 1, required: true };
const PARTY_2 = { userId: 'user-2', displayName: 'Bob', role: 'Engineer', order: 2, required: true };

const baseState: IAcknowledgmentState = {
  config: {} as IAcknowledgmentState['config'],
  events: [],
  isComplete: false,
  currentSequentialParty: null,
  overallStatus: 'pending',
};

const mockSubmit = vi.fn().mockResolvedValue(undefined);

const mockUseAcknowledgmentReturn: IUseAcknowledgmentReturn = {
  state: baseState,
  isLoading: false,
  isError: false,
  submit: mockSubmit,
  isSubmitting: false,
};

const mockUseAcknowledgment = vi.fn().mockReturnValue(mockUseAcknowledgmentReturn);

vi.mock('../../hooks/useAcknowledgment', () => ({
  useAcknowledgment: (...args: unknown[]) => mockUseAcknowledgment(...args),
}));

const mockGateReturn: IUseAcknowledgmentGateReturn = {
  canAcknowledge: true,
  isCurrentTurn: true,
  party: PARTY_1,
};

const mockUseAcknowledgmentGate = vi.fn().mockReturnValue(mockGateReturn);

vi.mock('../../hooks/useAcknowledgmentGate', () => ({
  useAcknowledgmentGate: (...args: unknown[]) => mockUseAcknowledgmentGate(...args),
}));

// ─── Test Config ────────────────────────────────────────────────────────────

const testConfig: IAcknowledgmentConfig<{ id: string }> = {
  label: 'Test Sign-Off',
  mode: 'parallel',
  contextType: 'admin-provisioning',
  resolveParties: () => [PARTY_1, PARTY_2],
  resolvePromptMessage: () => 'Please confirm',
  allowDecline: true,
};

const testItem = { id: 'item-1' };

const renderPanel = (overrides?: { complexityTier?: 'essential' | 'standard' | 'expert' }) =>
  render(
    <HbcAcknowledgmentPanel
      item={testItem}
      config={testConfig}
      contextId="ctx-1"
      currentUserId="user-1"
      complexityTier={overrides?.complexityTier}
    />,
  );

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcAcknowledgmentPanel', () => {
  beforeEach(() => {
    mockUseAcknowledgment.mockReturnValue({ ...mockUseAcknowledgmentReturn });
    mockUseAcknowledgmentGate.mockReturnValue({ ...mockGateReturn });
  });

  it('renders skeleton when loading', () => {
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: undefined,
      isLoading: true,
    });
    renderPanel();
    expect(screen.getByText('Loading acknowledgment data…')).toBeInTheDocument();
  });

  it('returns null when state undefined and not loading', () => {
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: undefined,
      isLoading: false,
    });
    const { container } = renderPanel();
    expect(container.innerHTML).toBe('');
  });

  it('renders EssentialCTA text at essential tier, no party list', () => {
    renderPanel({ complexityTier: 'essential' });
    expect(screen.getByText('Your acknowledgment is required.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders party list with names at standard tier', () => {
    renderPanel({ complexityTier: 'standard' });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders audit trail at expert tier', () => {
    const stateWithEvent: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: stateWithEvent,
    });
    renderPanel({ complexityTier: 'expert' });
    expect(screen.getByRole('list')).toHaveClass('hbc-ack-party-list--expert');
  });

  it('shows decline-blocked banner when overallStatus is declined', () => {
    const declinedState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'declined',
          acknowledgedAt: '2026-03-08T09:00:00Z',
          declineReason: 'Incomplete',
        },
      ],
      overallStatus: 'declined',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: declinedState,
    });
    renderPanel();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Workflow blocked/)).toBeInTheDocument();
  });

  it('shows completion banner when isComplete is true', () => {
    const completeState: IAcknowledgmentState = {
      ...baseState,
      isComplete: true,
      overallStatus: 'acknowledged',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: completeState,
    });
    renderPanel();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/all required sign-offs complete/)).toBeInTheDocument();
  });

  it('opens modal on Acknowledge click', () => {
    renderPanel({ complexityTier: 'standard' });
    const ackButton = screen.getByRole('button', { name: 'Acknowledge' });
    fireEvent.click(ackButton);
    expect(screen.getByText('Confirm Acknowledgment')).toBeInTheDocument();
  });

  // ─── EssentialCTA branch coverage ──────────────────────────────────────────

  it('essential: shows pending sync message when isPendingSync and canAct=false', () => {
    const syncState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
          isPendingSync: true,
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: syncState,
    });
    mockUseAcknowledgmentGate.mockReturnValue({
      canAcknowledge: false,
      isCurrentTurn: false,
      party: PARTY_1,
    });
    renderPanel({ complexityTier: 'essential' });
    expect(screen.getByText(/will sync when you reconnect/)).toBeInTheDocument();
  });

  it('essential: shows waiting message when not canAct and no pending sync', () => {
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: baseState,
    });
    mockUseAcknowledgmentGate.mockReturnValue({
      canAcknowledge: false,
      isCurrentTurn: false,
      party: null,
    });
    renderPanel({ complexityTier: 'essential' });
    expect(screen.getByText(/Waiting for sign-off/)).toBeInTheDocument();
  });

  it('essential: shows complete message when isComplete', () => {
    const completeState: IAcknowledgmentState = {
      ...baseState,
      isComplete: true,
      overallStatus: 'acknowledged',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: completeState,
    });
    renderPanel({ complexityTier: 'essential' });
    expect(screen.getByText(/Sign-off complete/)).toBeInTheDocument();
  });

  it('essential: shows declined message when overallStatus is declined', () => {
    const declinedState: IAcknowledgmentState = {
      ...baseState,
      overallStatus: 'declined',
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'declined',
          acknowledgedAt: '2026-03-08T09:00:00Z',
        },
      ],
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: declinedState,
    });
    renderPanel({ complexityTier: 'essential' });
    expect(screen.getByText(/Acknowledgment declined/)).toBeInTheDocument();
  });

  it('essential: renders Decline button when allowDecline', () => {
    renderPanel({ complexityTier: 'essential' });
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
  });

  // ─── StandardPartyList branch coverage ──────────────────────────────────────

  it('standard: renders status badges for acknowledged parties', () => {
    const partialState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: partialState,
    });
    renderPanel({ complexityTier: 'standard' });
    expect(screen.getByText('Acknowledged')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('standard: sequential mode shows lock icon for non-current parties', () => {
    const seqConfig: IAcknowledgmentConfig<{ id: string }> = {
      ...testConfig,
      mode: 'sequential',
    };
    const seqState: IAcknowledgmentState = {
      ...baseState,
      config: seqConfig as IAcknowledgmentConfig<unknown>,
      currentSequentialParty: PARTY_1,
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: seqState,
    });
    render(
      <HbcAcknowledgmentPanel
        item={testItem}
        config={seqConfig}
        contextId="ctx-1"
        currentUserId="user-1"
        complexityTier="standard"
      />,
    );
    expect(screen.getByLabelText('Waiting for earlier party to acknowledge')).toBeInTheDocument();
  });

  it('standard: renders syncing badge for isPendingSync event', () => {
    const syncState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
          isPendingSync: true,
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: syncState,
    });
    renderPanel({ complexityTier: 'standard' });
    expect(screen.getByText('Syncing')).toBeInTheDocument();
  });

  it('standard: renders bypassed badge for bypassed event', () => {
    const bypassState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'bypassed',
          acknowledgedAt: '2026-03-08T08:45:00Z',
          isBypass: true,
          bypassedBy: 'admin@hbc.com',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: bypassState,
    });
    renderPanel({ complexityTier: 'standard' });
    expect(screen.getByText('Bypassed')).toBeInTheDocument();
  });

  it('standard: renders declined badge for declined event', () => {
    const declinedState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'declined',
          acknowledgedAt: '2026-03-08T09:00:00Z',
        },
      ],
      overallStatus: 'declined',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: declinedState,
    });
    renderPanel({ complexityTier: 'standard' });
    expect(screen.getByText('Declined')).toBeInTheDocument();
  });

  // ─── ExpertAuditTrail branch coverage ──────────────────────────────────────

  it('expert: renders audit detail with timestamp for acknowledged event', () => {
    const expertState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: expertState,
    });
    renderPanel({ complexityTier: 'expert' });
    const timeEl = document.querySelector('time');
    expect(timeEl).toBeInTheDocument();
    expect(timeEl?.getAttribute('datetime')).toBe('2026-03-08T09:00:00Z');
  });

  it('expert: renders bypass flag for bypassed event', () => {
    const bypassState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'bypassed',
          acknowledgedAt: '2026-03-08T08:45:00Z',
          isBypass: true,
          bypassedBy: 'admin@hbc.com',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: bypassState,
    });
    renderPanel({ complexityTier: 'expert' });
    expect(screen.getByText(/Bypassed by admin@hbc.com/)).toBeInTheDocument();
  });

  it('expert: renders pending sync indicator for isPendingSync event', () => {
    const syncState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
          isPendingSync: true,
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: syncState,
    });
    renderPanel({ complexityTier: 'expert' });
    expect(screen.getByText(/Pending sync/)).toBeInTheDocument();
  });

  it('expert: renders decline reason in blockquote', () => {
    const declinedState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'declined',
          acknowledgedAt: '2026-03-08T09:00:00Z',
          declineReason: 'Information is incomplete.',
        },
      ],
      overallStatus: 'declined',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: declinedState,
    });
    renderPanel({ complexityTier: 'expert' });
    const blockquote = document.querySelector('.hbc-ack-audit-detail__prompt');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.textContent).toBe('Information is incomplete.');
  });

  it('expert: renders IP address when present', () => {
    const ipState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'acknowledged',
          acknowledgedAt: '2026-03-08T09:00:00Z',
          ipAddress: '192.168.1.1',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: ipState,
    });
    renderPanel({ complexityTier: 'expert' });
    expect(screen.getByText('IP: 192.168.1.1')).toBeInTheDocument();
  });

  it('expert: sequential mode shows lock icon and action buttons', () => {
    const seqConfig: IAcknowledgmentConfig<{ id: string }> = {
      ...testConfig,
      mode: 'sequential',
    };
    const seqState: IAcknowledgmentState = {
      ...baseState,
      config: seqConfig as IAcknowledgmentConfig<unknown>,
      currentSequentialParty: PARTY_1,
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: seqState,
    });
    render(
      <HbcAcknowledgmentPanel
        item={testItem}
        config={seqConfig}
        contextId="ctx-1"
        currentUserId="user-1"
        complexityTier="expert"
      />,
    );
    expect(screen.getByLabelText('Waiting for earlier party to acknowledge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeInTheDocument();
  });

  it('opens decline modal on Decline click', () => {
    renderPanel({ complexityTier: 'standard' });
    const declineButton = screen.getByRole('button', { name: 'Decline' });
    fireEvent.click(declineButton);
    expect(screen.getByText('Decline Sign-Off')).toBeInTheDocument();
  });

  it('calls submit with acknowledged when modal Confirm clicked', async () => {
    const submitSpy = vi.fn().mockResolvedValue(undefined);
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      submit: submitSpy,
    });
    renderPanel({ complexityTier: 'standard' });
    // Open modal
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }));
    // Click confirm in modal
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(submitSpy).toHaveBeenCalledWith({ status: 'acknowledged' });
  });

  it('calls submit with declined when modal decline confirmed', async () => {
    const submitSpy = vi.fn().mockResolvedValue(undefined);
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      submit: submitSpy,
    });
    renderPanel({ complexityTier: 'standard' });
    // Open decline modal
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    // Enter decline reason (min 10 chars)
    const textarea = screen.getByLabelText(/Reason/);
    fireEvent.change(textarea, { target: { value: 'This is incomplete and needs revision.' } });
    // Click confirm decline
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Decline' }));
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'declined' }),
    );
  });

  it('closes modal on Cancel click', () => {
    renderPanel({ complexityTier: 'standard' });
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(screen.getByText('Confirm Acknowledgment')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Confirm Acknowledgment')).not.toBeInTheDocument();
  });

  // ─── StatusBadge function coverage (bypassed without isBypass) ──────────────

  it('essential: opens decline modal on Decline click', () => {
    renderPanel({ complexityTier: 'essential' });
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(screen.getByText('Decline Sign-Off')).toBeInTheDocument();
  });

  it('expert: opens modal on Acknowledge click', () => {
    renderPanel({ complexityTier: 'expert' });
    const ackButton = screen.getByRole('button', { name: 'Acknowledge' });
    fireEvent.click(ackButton);
    expect(screen.getByText('Confirm Acknowledgment')).toBeInTheDocument();
  });

  it('expert: opens decline modal on Decline click', () => {
    renderPanel({ complexityTier: 'expert' });
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(screen.getByText('Decline Sign-Off')).toBeInTheDocument();
  });

  it('standard: renders bypassed status badge when status=bypassed but no isBypass flag', () => {
    const bypassState: IAcknowledgmentState = {
      ...baseState,
      events: [
        {
          partyUserId: 'user-1',
          partyDisplayName: 'Alice',
          status: 'bypassed',
          acknowledgedAt: '2026-03-08T08:45:00Z',
        },
      ],
      overallStatus: 'partial',
    };
    mockUseAcknowledgment.mockReturnValue({
      ...mockUseAcknowledgmentReturn,
      state: bypassState,
    });
    renderPanel({ complexityTier: 'standard' });
    expect(screen.getByText('Bypassed')).toBeInTheDocument();
  });
});

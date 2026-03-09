import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcAcknowledgmentBadge } from '../HbcAcknowledgmentBadge';
import type { IAcknowledgmentConfig, IAcknowledgmentState } from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcTooltip: ({ content, children }: { content: string; children: React.ReactElement }) => (
    <div data-testid="tooltip" data-tooltip-content={content}>
      {children}
    </div>
  ),
}));

const mockState: IAcknowledgmentState = {
  config: {} as IAcknowledgmentState['config'],
  events: [],
  isComplete: false,
  currentSequentialParty: null,
  overallStatus: 'pending',
};

const mockUseAcknowledgment = vi.fn().mockReturnValue({
  state: mockState,
  isLoading: false,
  isError: false,
  submit: vi.fn(),
  isSubmitting: false,
});

vi.mock('../../hooks/useAcknowledgment', () => ({
  useAcknowledgment: (...args: unknown[]) => mockUseAcknowledgment(...args),
}));

// ─── Test Config ────────────────────────────────────────────────────────────

const testConfig: IAcknowledgmentConfig<{ id: string }> = {
  label: 'Test Sign-Off',
  mode: 'parallel',
  contextType: 'turnover-meeting',
  resolveParties: () => [
    { userId: 'u1', displayName: 'Alice', role: 'PM', required: true },
    { userId: 'u2', displayName: 'Bob', role: 'Engineer', required: true },
  ],
  resolvePromptMessage: () => 'Please confirm',
};

const testItem = { id: 'item-1' };

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcAcknowledgmentBadge', () => {
  beforeEach(() => {
    mockUseAcknowledgment.mockReturnValue({
      state: mockState,
      isLoading: false,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
  });

  it('renders pending badge with count', () => {
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(screen.getByText('0 of 2 acknowledged')).toBeInTheDocument();
  });

  it('renders skeleton when state is undefined', () => {
    mockUseAcknowledgment.mockReturnValue({
      state: undefined,
      isLoading: true,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders declined badge', () => {
    mockUseAcknowledgment.mockReturnValue({
      state: { ...mockState, overallStatus: 'declined' },
      isLoading: false,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(screen.getByText('Declined')).toBeInTheDocument();
    expect(screen.getByLabelText('Declined')).toHaveClass('hbc-ack-badge--danger');
  });

  it('renders complete badge', () => {
    mockUseAcknowledgment.mockReturnValue({
      state: {
        ...mockState,
        overallStatus: 'acknowledged',
        events: [
          { partyUserId: 'u1', partyDisplayName: 'Alice', status: 'acknowledged', acknowledgedAt: '2026-01-01' },
          { partyUserId: 'u2', partyDisplayName: 'Bob', status: 'acknowledged', acknowledgedAt: '2026-01-01' },
        ],
      },
      isLoading: false,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByLabelText('Complete')).toHaveClass('hbc-ack-badge--success');
  });

  it('renders partial badge with warning color', () => {
    mockUseAcknowledgment.mockReturnValue({
      state: {
        ...mockState,
        overallStatus: 'partial' as IAcknowledgmentState['overallStatus'],
        events: [
          { partyUserId: 'u1', partyDisplayName: 'Alice', status: 'acknowledged', acknowledgedAt: '2026-01-01' },
        ],
      },
      isLoading: false,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(screen.getByText('1 of 2 acknowledged')).toBeInTheDocument();
    expect(screen.getByLabelText('1 of 2 acknowledged')).toHaveClass('hbc-ack-badge--warning');
  });

  it('applies complexity floor — essential renders as standard (D-07)', () => {
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
        complexityTier="essential"
      />,
    );
    // Should still render count text (standard behavior), not be hidden
    expect(screen.getByText('0 of 2 acknowledged')).toBeInTheDocument();
  });

  it('renders tooltip at expert tier with pending party names (D-07)', () => {
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
        complexityTier="expert"
      />,
    );
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute(
      'data-tooltip-content',
      'Pending: Alice, Bob',
    );
  });

  it('does not render tooltip at expert tier when no pending parties', () => {
    mockUseAcknowledgment.mockReturnValue({
      state: {
        ...mockState,
        overallStatus: 'acknowledged',
        events: [
          { partyUserId: 'u1', partyDisplayName: 'Alice', status: 'acknowledged', acknowledgedAt: '2026-01-01' },
          { partyUserId: 'u2', partyDisplayName: 'Bob', status: 'acknowledged', acknowledgedAt: '2026-01-01' },
        ],
      },
      isLoading: false,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
        complexityTier="expert"
      />,
    );
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
  });

  it('passes empty string as currentUserId to useAcknowledgment', () => {
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(mockUseAcknowledgment).toHaveBeenCalledWith(testConfig, 'ctx-1', '');
  });

  it('renders bypass badge with warning', () => {
    mockUseAcknowledgment.mockReturnValue({
      state: {
        ...mockState,
        overallStatus: 'acknowledged',
        events: [
          { partyUserId: 'u1', partyDisplayName: 'Alice', status: 'bypassed', acknowledgedAt: '2026-01-01', isBypass: true },
          { partyUserId: 'u2', partyDisplayName: 'Bob', status: 'acknowledged', acknowledgedAt: '2026-01-01' },
        ],
      },
      isLoading: false,
      isError: false,
      submit: vi.fn(),
      isSubmitting: false,
    });
    render(
      <HbcAcknowledgmentBadge
        item={testItem}
        config={testConfig}
        contextId="ctx-1"
      />,
    );
    expect(screen.getByText('Complete (with bypass)')).toBeInTheDocument();
    expect(screen.getByLabelText('Complete (with bypass)')).toHaveClass('hbc-ack-badge--warning');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkReasonDrawer } from '../components/HbcMyWorkReasonDrawer/index.js';
import type { IMyWorkReasoningPayload } from '../types/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

const mockUseMyWorkReasoning = vi.fn();
vi.mock('../hooks/useMyWorkReasoning.js', () => ({
  useMyWorkReasoning: (...args: unknown[]) => mockUseMyWorkReasoning(...args),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcTearsheet: ({ steps, className, open, title }: { steps: Array<{ id: string; label: string; content: React.ReactNode }>; className?: string; open: boolean; onClose: () => void; title: string }) => (
    open ? (
      <div data-testid="tearsheet" className={className} data-title={title}>
        {steps.map((step) => (
          <div key={step.id} data-testid={`step-${step.id}`} data-label={step.label}>
            {step.content}
          </div>
        ))}
      </div>
    ) : null
  ),
  HbcTypography: ({ children, intent }: { children: React.ReactNode; intent: string }) => (
    <span data-testid={`typography-${intent}`}>{children}</span>
  ),
  HbcStatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
  HbcSpinner: ({ size }: { size: string }) => <div data-testid="spinner" data-size={size} />,
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function createReasoning(overrides?: Partial<IMyWorkReasoningPayload>): IMyWorkReasoningPayload {
  return {
    workItemId: 'work-001',
    canonicalKey: 'bic::rec-001',
    title: 'Review Transfer Request',
    rankingReason: {
      primaryReason: 'Assigned to you and requires action',
      contributingReasons: ['High priority', 'Due soon'],
      score: 0.95,
    },
    lifecycle: {
      currentStepLabel: 'Pending Review',
      nextStepLabel: 'Approved',
      blockedDependencyLabel: null,
    },
    permissionState: {
      canOpen: true,
      canAct: true,
      cannotActReason: null,
    },
    sourceMeta: [
      {
        source: 'bic-next-move',
        sourceItemId: 'src-001',
        sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z',
        explanation: 'From BIC engine',
      },
    ],
    dedupeInfo: undefined,
    supersessionInfo: undefined,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkReasonDrawer', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWorkReasoning.mockReturnValue({
      reasoning: createReasoning(),
      isLoading: false,
      isError: false,
    });
  });

  it('returns null at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(
      <HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when closed', () => {
    const { container } = render(
      <HbcMyWorkReasonDrawer itemId="work-001" open={false} onClose={onClose} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders tearsheet when open', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByTestId('tearsheet')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseMyWorkReasoning.mockReturnValue({
      reasoning: undefined,
      isLoading: true,
      isError: false,
    });
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Why Surfaced step with primary reason', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByTestId('step-why-surfaced')).toBeInTheDocument();
    expect(screen.getByText('Assigned to you and requires action')).toBeInTheDocument();
  });

  it('renders contributing reasons as list', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByText('High priority')).toBeInTheDocument();
    expect(screen.getByText('Due soon')).toBeInTheDocument();
  });

  it('does not show score at standard tier', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });

  it('shows score at expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByText('Score: 0.95')).toBeInTheDocument();
  });

  it('renders Lifecycle step with current and next labels', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByTestId('step-lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Current: Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Next: Approved')).toBeInTheDocument();
  });

  it('renders permission state message', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByText('You can act on this item')).toBeInTheDocument();
  });

  it('renders cannot-act reason when canAct is false', () => {
    mockUseMyWorkReasoning.mockReturnValue({
      reasoning: createReasoning({
        permissionState: {
          canOpen: true,
          canAct: false,
          cannotActReason: 'Insufficient permissions',
        },
      }),
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByText('Insufficient permissions')).toBeInTheDocument();
  });

  it('does not render Source Provenance step at standard tier', () => {
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.queryByTestId('step-source-provenance')).not.toBeInTheDocument();
  });

  it('renders Source Provenance step at expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByTestId('step-source-provenance')).toBeInTheDocument();
    expect(screen.getByText('bic-next-move')).toBeInTheDocument();
    expect(screen.getByText('From BIC engine')).toBeInTheDocument();
  });

  it('renders dedupe info at expert tier when present', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    mockUseMyWorkReasoning.mockReturnValue({
      reasoning: createReasoning({
        dedupeInfo: {
          dedupeKey: 'dk-001',
          mergedSourceMeta: [],
          mergeReason: 'Duplicate sources merged',
        },
      }),
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByText('Dedupe: Duplicate sources merged')).toBeInTheDocument();
  });

  it('renders supersession info at expert tier when present', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    mockUseMyWorkReasoning.mockReturnValue({
      reasoning: createReasoning({
        supersessionInfo: {
          supersededByWorkItemId: 'work-002',
          supersessionReason: 'Replaced by newer version',
          originalRankingReason: { primaryReason: 'old', contributingReasons: [] },
        },
      }),
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} />);
    expect(screen.getByText('Superseded: Replaced by newer version')).toBeInTheDocument();
  });

  it('applies className to tearsheet', () => {
    render(
      <HbcMyWorkReasonDrawer itemId="work-001" open={true} onClose={onClose} className="custom" />,
    );
    expect(screen.getByTestId('tearsheet')).toHaveClass('custom');
  });
});

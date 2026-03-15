import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkTile } from '../components/HbcMyWorkTile/index.js';
import { createMockMyWorkItem, createMockMyWorkFeedResult } from '@hbc/my-work-feed/testing';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

const mockUseMyWork = vi.fn();
const mockUseMyWorkCounts = vi.fn();
const mockUseMyWorkActions = vi.fn();

vi.mock('../hooks/useMyWork.js', () => ({
  useMyWork: (...args: unknown[]) => mockUseMyWork(...args),
}));

vi.mock('../hooks/useMyWorkCounts.js', () => ({
  useMyWorkCounts: (...args: unknown[]) => mockUseMyWorkCounts(...args),
}));

vi.mock('../hooks/useMyWorkActions.js', () => ({
  useMyWorkActions: (...args: unknown[]) => mockUseMyWorkActions(...args),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcCard: ({ children, header, footer, className }: { children: React.ReactNode; header?: React.ReactNode; footer?: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {header && <div data-testid="card-header">{header}</div>}
      <div data-testid="card-body">{children}</div>
      {footer && <div data-testid="card-footer">{footer}</div>}
    </div>
  ),
  HbcTypography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  HbcStatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
  HbcButton: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button data-testid={`btn-${typeof children === 'string' ? children.toLowerCase().replace(/\s/g, '-') : 'action'}`} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
  HbcSpinner: ({ size }: { size: string }) => <div data-testid="spinner" data-size={size} />,
}));

vi.mock('../components/HbcMyWorkListItem/index.js', () => ({
  HbcMyWorkListItem: (props: Record<string, unknown>) => (
    <div data-testid="list-item" data-item-id={(props.item as { workItemId: string }).workItemId} />
  ),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkTile', () => {
  const mockExecuteAction = vi.fn();

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });

    const items = [
      createMockMyWorkItem({ workItemId: 'w1' }),
      createMockMyWorkItem({ workItemId: 'w2' }),
      createMockMyWorkItem({ workItemId: 'w3' }),
    ];

    mockUseMyWork.mockReturnValue({
      feed: createMockMyWorkFeedResult({ items, totalCount: 3 }),
      isLoading: false,
      isError: false,
      error: null,
      isStale: false,
      refetch: vi.fn(),
    });

    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 3, unreadCount: 2, nowCount: 1, blockedCount: 1, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });

    mockUseMyWorkActions.mockReturnValue({
      executeAction: mockExecuteAction,
      isPending: false,
      lastResult: undefined,
    });
  });

  it('renders card', () => {
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('passes projectId to useMyWork query', () => {
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(mockUseMyWork).toHaveBeenCalledWith({ query: { projectId: 'proj-1' }, enabled: true });
  });

  it('renders spinner when loading', () => {
    mockUseMyWork.mockReturnValue({
      feed: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isStale: false,
      refetch: vi.fn(),
    });
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders top N items (default 5)', () => {
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(3);
  });

  it('respects maxItems prop', () => {
    render(<HbcMyWorkTile projectId="proj-1" maxItems={2} />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('renders total count badge', () => {
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders now and blocked badges at standard tier', () => {
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.getByText('1 now')).toBeInTheDocument();
    expect(screen.getByText('1 blocked')).toBeInTheDocument();
  });

  it('hides now and blocked badges at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.queryByText('1 now')).not.toBeInTheDocument();
    expect(screen.queryByText('1 blocked')).not.toBeInTheDocument();
  });

  it('renders waiting badge at expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkTile projectId="proj-1" />);
    expect(screen.getByText('0 waiting')).toBeInTheDocument();
  });

  it('renders View All button at standard tier when onOpenFeed provided', () => {
    const onOpenFeed = vi.fn();
    render(<HbcMyWorkTile projectId="proj-1" onOpenFeed={onOpenFeed} />);
    fireEvent.click(screen.getByTestId('btn-view-all'));
    expect(onOpenFeed).toHaveBeenCalledOnce();
  });

  it('does not render View All at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkTile projectId="proj-1" onOpenFeed={vi.fn()} />);
    expect(screen.queryByTestId('btn-view-all')).not.toBeInTheDocument();
  });

  it('applies className', () => {
    render(<HbcMyWorkTile projectId="proj-1" className="custom" />);
    expect(screen.getByTestId('card')).toHaveClass('custom');
  });
});

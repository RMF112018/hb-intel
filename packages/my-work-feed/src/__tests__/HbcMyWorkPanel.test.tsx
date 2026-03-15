import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkPanel } from '../components/HbcMyWorkPanel/index.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';
import type { IMyWorkPanelGroup } from '../hooks/useMyWorkPanel.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit/icons', () => ({
  ChevronDown: () => <svg data-testid="chevron-down" />,
  ChevronUp: () => <svg data-testid="chevron-up" />,
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcPanel: ({ children, open, onClose, title, size, className }: { children: React.ReactNode; open: boolean; onClose: () => void; title: string; size: string; className?: string }) => (
    open ? <div data-testid="panel" data-title={title} data-size={size} className={className}><button data-testid="close-panel" onClick={onClose} />{children}</div> : null
  ),
  HbcBanner: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <div data-testid={`banner-${variant}`}>{children}</div>
  ),
  HbcButton: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button data-testid={`btn-${typeof children === 'string' ? children.toLowerCase().replace(/\s/g, '-') : 'action'}`} data-variant={variant} onClick={onClick}>{children}</button>
  ),
  HbcSpinner: ({ size }: { size: string }) => <div data-testid="spinner" data-size={size} />,
  HbcTypography: ({ children }: { children: React.ReactNode; intent: string }) => (
    <span>{children}</span>
  ),
}));

// Mock child components
vi.mock('../components/HbcMyWorkOfflineBanner/index.js', () => ({
  HbcMyWorkOfflineBanner: () => <div data-testid="offline-banner" />,
}));

vi.mock('../components/HbcMyWorkPlanningBar/index.js', () => ({
  HbcMyWorkPlanningBar: (props: Record<string, unknown>) => (
    <div data-testid="planning-bar" data-has-counts={props.counts ? 'true' : 'false'} />
  ),
}));

vi.mock('../components/HbcMyWorkEmptyState/index.js', () => ({
  HbcMyWorkEmptyState: (props: Record<string, unknown>) => (
    <div data-testid="empty-state" data-variant={props.variant} />
  ),
}));

vi.mock('../components/HbcMyWorkListItem/index.js', () => ({
  HbcMyWorkListItem: (props: Record<string, unknown>) => (
    <div data-testid="list-item" data-item-id={(props.item as { workItemId: string }).workItemId} />
  ),
}));

const mockUseMyWorkPanel = vi.fn();
const mockUseMyWorkActions = vi.fn();
const mockUseMyWorkPanelStore = vi.fn();

vi.mock('../hooks/useMyWorkPanel.js', () => ({
  useMyWorkPanel: (...args: unknown[]) => mockUseMyWorkPanel(...args),
}));

vi.mock('../hooks/useMyWorkActions.js', () => ({
  useMyWorkActions: (...args: unknown[]) => mockUseMyWorkActions(...args),
}));

vi.mock('../store/MyWorkPanelStore.js', () => ({
  useMyWorkPanelStore: (...args: unknown[]) => mockUseMyWorkPanelStore(...args),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function createGroups(): IMyWorkPanelGroup[] {
  return [
    {
      groupKey: 'do-now',
      items: [createMockMyWorkItem({ workItemId: 'w1' }), createMockMyWorkItem({ workItemId: 'w2' })],
      count: 2,
    },
    {
      groupKey: 'watch',
      items: [createMockMyWorkItem({ workItemId: 'w3' })],
      count: 1,
    },
  ];
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkPanel', () => {
  const mockExecuteAction = vi.fn();
  const mockClosePanel = vi.fn();
  const mockToggleGroup = vi.fn();

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWorkPanel.mockReturnValue({
      groups: createGroups(),
      counts: { totalCount: 3, unreadCount: 2, nowCount: 2, blockedCount: 0, waitingCount: 0, deferredCount: 1 },
      isPanelOpen: true,
      isLoading: false,
      isError: false,
      closePanel: mockClosePanel,
      openPanel: vi.fn(),
      togglePanel: vi.fn(),
    });
    mockUseMyWorkActions.mockReturnValue({
      executeAction: mockExecuteAction,
      isPending: false,
      lastResult: undefined,
    });
    mockUseMyWorkPanelStore.mockReturnValue({
      expandedGroups: new Set(['do-now']),
      toggleGroup: mockToggleGroup,
      isPanelOpen: true,
      grouping: null,
      openPanel: vi.fn(),
      closePanel: vi.fn(),
      togglePanel: vi.fn(),
      setGrouping: vi.fn(),
    });
  });

  it('renders nothing when panel is closed', () => {
    mockUseMyWorkPanel.mockReturnValue({
      groups: [],
      counts: undefined,
      isPanelOpen: false,
      isLoading: false,
      isError: false,
      closePanel: mockClosePanel,
      openPanel: vi.fn(),
      togglePanel: vi.fn(),
    });
    const { container } = render(<HbcMyWorkPanel />);
    expect(container.innerHTML).toBe('');
  });

  it('renders panel with title and size', () => {
    render(<HbcMyWorkPanel />);
    const panel = screen.getByTestId('panel');
    expect(panel).toHaveAttribute('data-title', 'My Work');
    expect(panel).toHaveAttribute('data-size', 'sm');
  });

  it('renders offline banner', () => {
    render(<HbcMyWorkPanel />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
  });

  it('renders planning bar in standard tier', () => {
    render(<HbcMyWorkPanel />);
    expect(screen.getByTestId('planning-bar')).toBeInTheDocument();
  });

  it('hides planning bar in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkPanel />);
    expect(screen.queryByTestId('planning-bar')).not.toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    mockUseMyWorkPanel.mockReturnValue({
      groups: [],
      counts: undefined,
      isPanelOpen: true,
      isLoading: true,
      isError: false,
      closePanel: mockClosePanel,
      openPanel: vi.fn(),
      togglePanel: vi.fn(),
    });
    render(<HbcMyWorkPanel />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error banner when errored', () => {
    mockUseMyWorkPanel.mockReturnValue({
      groups: [],
      counts: undefined,
      isPanelOpen: true,
      isLoading: false,
      isError: true,
      closePanel: mockClosePanel,
      openPanel: vi.fn(),
      togglePanel: vi.fn(),
    });
    render(<HbcMyWorkPanel />);
    expect(screen.getByTestId('banner-error')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    mockUseMyWorkPanel.mockReturnValue({
      groups: [],
      counts: undefined,
      isPanelOpen: true,
      isLoading: false,
      isError: false,
      closePanel: mockClosePanel,
      openPanel: vi.fn(),
      togglePanel: vi.fn(),
    });
    render(<HbcMyWorkPanel />);
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-variant', 'panel');
  });

  it('renders grouped items in standard tier', () => {
    render(<HbcMyWorkPanel />);
    // do-now is expanded, watch is collapsed
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('renders flat list in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkPanel />);
    // All items rendered flat
    expect(screen.getAllByTestId('list-item')).toHaveLength(3);
  });

  it('toggles group on header click', () => {
    render(<HbcMyWorkPanel />);
    const headers = screen.getAllByRole('button').filter((b) => b.classList.contains('hbc-my-work-panel__group-header'));
    fireEvent.click(headers[0]);
    expect(mockToggleGroup).toHaveBeenCalledWith('do-now');
  });

  it('calls closePanel when panel close is triggered', () => {
    render(<HbcMyWorkPanel />);
    fireEvent.click(screen.getByTestId('close-panel'));
    expect(mockClosePanel).toHaveBeenCalledOnce();
  });

  it('renders View All button when onOpenFeed is provided', () => {
    const onOpenFeed = vi.fn();
    render(<HbcMyWorkPanel onOpenFeed={onOpenFeed} />);
    fireEvent.click(screen.getByTestId('btn-view-all'));
    expect(onOpenFeed).toHaveBeenCalledOnce();
  });

  it('planning bar receives counts matching useMyWork feed', () => {
    const counts = { totalCount: 5, unreadCount: 3, nowCount: 2, blockedCount: 1, waitingCount: 1, deferredCount: 0 };
    mockUseMyWorkPanel.mockReturnValue({
      groups: createGroups(),
      counts,
      isPanelOpen: true,
      isLoading: false,
      isError: false,
      closePanel: mockClosePanel,
      openPanel: vi.fn(),
      togglePanel: vi.fn(),
    });
    render(<HbcMyWorkPanel />);
    expect(screen.getByTestId('planning-bar')).toHaveAttribute('data-has-counts', 'true');
  });

  it('does not render View All when onOpenFeed is not provided', () => {
    render(<HbcMyWorkPanel />);
    expect(screen.queryByTestId('btn-view-all')).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkFeed } from '../components/HbcMyWorkFeed/index.js';
import { createMockMyWorkItem, createMockMyWorkFeedResult } from '@hbc/my-work-feed/testing';
import type { IMyWorkItem } from '../types/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

const mockUseMyWork = vi.fn();
const mockUseMyWorkActions = vi.fn();

vi.mock('../hooks/useMyWork.js', () => ({
  useMyWork: (...args: unknown[]) => mockUseMyWork(...args),
}));

vi.mock('../hooks/useMyWorkActions.js', () => ({
  useMyWorkActions: (...args: unknown[]) => mockUseMyWorkActions(...args),
}));

vi.mock('@hbc/ui-kit/icons', () => ({
  ChevronDown: () => <svg data-testid="chevron-down" />,
  ChevronUp: () => <svg data-testid="chevron-up" />,
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcCommandBar: ({ filters, searchValue, onSearchChange }: { filters: Array<{ key: string; label: string; active: boolean; onToggle: () => void }>; actions: unknown[]; searchValue: string; onSearchChange: (v: string) => void }) => (
    <div data-testid="command-bar">
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {filters.map((f) => (
        <button key={f.key} data-testid={`filter-${f.key}`} data-active={f.active} onClick={f.onToggle}>
          {f.label}
        </button>
      ))}
    </div>
  ),
  HbcTypography: ({ children, intent }: { children: React.ReactNode; intent: string }) => (
    <span data-testid={`typography-${intent}`}>{children}</span>
  ),
  HbcSpinner: ({ size }: { size: string }) => <div data-testid="spinner" data-size={size} />,
  HbcBanner: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <div data-testid={`banner-${variant}`}>{children}</div>
  ),
}));

vi.mock('../components/HbcMyWorkOfflineBanner/index.js', () => ({
  HbcMyWorkOfflineBanner: () => <div data-testid="offline-banner" />,
}));

vi.mock('../components/HbcMyWorkListItem/index.js', () => ({
  HbcMyWorkListItem: (props: Record<string, unknown>) => (
    <div data-testid="list-item" data-item-id={(props.item as IMyWorkItem).workItemId} />
  ),
}));

vi.mock('../components/HbcMyWorkEmptyState/index.js', () => ({
  HbcMyWorkEmptyState: (props: Record<string, unknown>) => (
    <div data-testid="empty-state" data-variant={props.variant} />
  ),
}));

vi.mock('../components/HbcMyWorkSourceHealth/index.js', () => ({
  HbcMyWorkSourceHealth: (props: Record<string, unknown>) => (
    props.healthState ? <div data-testid="source-health" /> : null
  ),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function createItems(): IMyWorkItem[] {
  return [
    createMockMyWorkItem({ workItemId: 'w1', lane: 'do-now', title: 'Alpha task', isOverdue: true, isUnread: true }),
    createMockMyWorkItem({ workItemId: 'w2', lane: 'do-now', title: 'Beta task', isBlocked: true, isUnread: false }),
    createMockMyWorkItem({ workItemId: 'w3', lane: 'watch', title: 'Gamma task', isUnread: true }),
  ];
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkFeed', () => {
  const mockExecuteAction = vi.fn();

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWork.mockReturnValue({
      feed: createMockMyWorkFeedResult({ items: createItems(), totalCount: 3 }),
      isLoading: false,
      isError: false,
      error: null,
      isStale: false,
      refetch: vi.fn(),
    });
    mockUseMyWorkActions.mockReturnValue({
      executeAction: mockExecuteAction,
      isPending: false,
      lastResult: undefined,
    });
  });

  it('renders offline banner', () => {
    render(<HbcMyWorkFeed />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
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
    render(<HbcMyWorkFeed />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders error banner on error', () => {
    mockUseMyWork.mockReturnValue({
      feed: undefined,
      isLoading: false,
      isError: true,
      error: new Error('fail'),
      isStale: false,
      refetch: vi.fn(),
    });
    render(<HbcMyWorkFeed />);
    expect(screen.getByTestId('banner-error')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockUseMyWork.mockReturnValue({
      feed: createMockMyWorkFeedResult({ items: [] }),
      isLoading: false,
      isError: false,
      error: null,
      isStale: false,
      refetch: vi.fn(),
    });
    render(<HbcMyWorkFeed />);
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-variant', 'feed');
  });

  it('renders CommandBar at standard tier', () => {
    render(<HbcMyWorkFeed />);
    expect(screen.getByTestId('command-bar')).toBeInTheDocument();
  });

  it('hides CommandBar at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkFeed />);
    expect(screen.queryByTestId('command-bar')).not.toBeInTheDocument();
  });

  it('renders flat list at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkFeed />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(3);
  });

  it('renders grouped items at standard tier', () => {
    render(<HbcMyWorkFeed />);
    // Items are grouped by lane (default): do-now (2) and watch (1)
    // Groups start collapsed, so no list items visible
    expect(screen.queryAllByTestId('list-item')).toHaveLength(0);
    // But group headers are visible
    expect(screen.getByText('do-now (2)')).toBeInTheDocument();
    expect(screen.getByText('watch (1)')).toBeInTheDocument();
  });

  it('toggles group expansion on header click', () => {
    render(<HbcMyWorkFeed />);
    const headers = screen.getAllByRole('button').filter((b) =>
      b.classList.contains('hbc-my-work-feed__group-header'),
    );
    // Click to expand do-now group
    fireEvent.click(headers[0]);
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);

    // Click again to collapse
    fireEvent.click(headers[0]);
    expect(screen.queryAllByTestId('list-item')).toHaveLength(0);
  });

  it('filters items by search term', () => {
    render(<HbcMyWorkFeed />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    // After search, only Alpha task should be in groups
    expect(screen.getByText('do-now (1)')).toBeInTheDocument();
    expect(screen.queryByText('watch')).not.toBeInTheDocument();
  });

  it('filters by overdue toggle', () => {
    render(<HbcMyWorkFeed />);
    fireEvent.click(screen.getByTestId('filter-overdue'));
    // Only w1 is overdue
    expect(screen.getByText('do-now (1)')).toBeInTheDocument();
    expect(screen.queryByText('watch')).not.toBeInTheDocument();
  });

  it('filters by blocked toggle', () => {
    render(<HbcMyWorkFeed />);
    fireEvent.click(screen.getByTestId('filter-blocked'));
    // Only w2 is blocked
    expect(screen.getByText('do-now (1)')).toBeInTheDocument();
    expect(screen.queryByText('watch')).not.toBeInTheDocument();
  });

  it('filters by unread toggle', () => {
    render(<HbcMyWorkFeed />);
    fireEvent.click(screen.getByTestId('filter-unread'));
    // w1 and w3 are unread
    expect(screen.getByText('do-now (1)')).toBeInTheDocument();
    expect(screen.getByText('watch (1)')).toBeInTheDocument();
  });

  it('does not render source health at standard tier', () => {
    mockUseMyWork.mockReturnValue({
      feed: createMockMyWorkFeedResult({
        items: createItems(),
        healthState: { freshness: 'live', degradedSourceCount: 0, hiddenSupersededCount: 0 },
      }),
      isLoading: false,
      isError: false,
      error: null,
      isStale: false,
      refetch: vi.fn(),
    });
    render(<HbcMyWorkFeed />);
    expect(screen.queryByTestId('source-health')).not.toBeInTheDocument();
  });

  it('renders source health at expert tier when healthState present', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    mockUseMyWork.mockReturnValue({
      feed: createMockMyWorkFeedResult({
        items: createItems(),
        healthState: { freshness: 'live', degradedSourceCount: 0, hiddenSupersededCount: 0 },
      }),
      isLoading: false,
      isError: false,
      error: null,
      isStale: false,
      refetch: vi.fn(),
    });
    render(<HbcMyWorkFeed />);
    expect(screen.getByTestId('source-health')).toBeInTheDocument();
  });

  it('passes query to useMyWork', () => {
    const query = { projectId: 'proj-1' };
    render(<HbcMyWorkFeed query={query} />);
    expect(mockUseMyWork).toHaveBeenCalledWith({ query });
  });

  it('applies className', () => {
    const { container } = render(<HbcMyWorkFeed className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});

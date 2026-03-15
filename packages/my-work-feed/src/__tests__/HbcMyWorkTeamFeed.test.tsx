import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkTeamFeed } from '../components/HbcMyWorkTeamFeed/index.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';
import type { IMyWorkItem } from '../types/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

const mockUseMyWorkTeamFeed = vi.fn();
const mockUseMyWorkActions = vi.fn();

vi.mock('../hooks/useMyWorkTeamFeed.js', () => ({
  useMyWorkTeamFeed: (...args: unknown[]) => mockUseMyWorkTeamFeed(...args),
}));

vi.mock('../hooks/useMyWorkActions.js', () => ({
  useMyWorkActions: (...args: unknown[]) => mockUseMyWorkActions(...args),
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
        <button key={f.key} data-testid={`filter-${f.key}`} data-active={String(f.active)} onClick={f.onToggle}>
          {f.label}
        </button>
      ))}
    </div>
  ),
  HbcTypography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  HbcSpinner: ({ size }: { size: string }) => <div data-testid="spinner" data-size={size} />,
  HbcBanner: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <div data-testid={`banner-${variant}`}>{children}</div>
  ),
  HbcStatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function createTeamItems(): IMyWorkItem[] {
  return [
    createMockMyWorkItem({ workItemId: 't1', title: 'Team item 1' }),
    createMockMyWorkItem({ workItemId: 't2', title: 'Team item 2' }),
  ];
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkTeamFeed', () => {
  const mockExecuteAction = vi.fn();

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWorkTeamFeed.mockReturnValue({
      teamFeed: {
        items: createTeamItems(),
        totalCount: 2,
        agingCount: 1,
        blockedCount: 1,
        escalationCandidateCount: 0,
        lastRefreshedIso: '2026-01-15T10:00:00.000Z',
      },
      isLoading: false,
      isError: false,
    });
    mockUseMyWorkActions.mockReturnValue({
      executeAction: mockExecuteAction,
      isPending: false,
      lastResult: undefined,
    });
  });

  it('renders spinner when loading', () => {
    mockUseMyWorkTeamFeed.mockReturnValue({
      teamFeed: undefined,
      isLoading: true,
      isError: false,
    });
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders error banner on error', () => {
    mockUseMyWorkTeamFeed.mockReturnValue({
      teamFeed: undefined,
      isLoading: false,
      isError: true,
    });
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getByTestId('banner-error')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockUseMyWorkTeamFeed.mockReturnValue({
      teamFeed: {
        items: [],
        totalCount: 0,
        agingCount: 0,
        blockedCount: 0,
        escalationCandidateCount: 0,
        lastRefreshedIso: '2026-01-15T10:00:00.000Z',
      },
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-variant', 'feed');
  });

  it('renders CommandBar at standard tier', () => {
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getByTestId('command-bar')).toBeInTheDocument();
  });

  it('hides CommandBar at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkTeamFeed />);
    expect(screen.queryByTestId('command-bar')).not.toBeInTheDocument();
  });

  it('renders items', () => {
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('uses default scope delegated-by-me', () => {
    render(<HbcMyWorkTeamFeed />);
    expect(mockUseMyWorkTeamFeed).toHaveBeenCalledWith(
      expect.objectContaining({ ownerScope: 'delegated-by-me' }),
    );
  });

  it('uses provided defaultScope', () => {
    render(<HbcMyWorkTeamFeed defaultScope="my-team" />);
    expect(mockUseMyWorkTeamFeed).toHaveBeenCalledWith(
      expect.objectContaining({ ownerScope: 'my-team' }),
    );
  });

  it('switches scope on filter click', () => {
    render(<HbcMyWorkTeamFeed />);
    fireEvent.click(screen.getByTestId('filter-my-team'));
    expect(mockUseMyWorkTeamFeed).toHaveBeenLastCalledWith(
      expect.objectContaining({ ownerScope: 'my-team' }),
    );
  });

  it('renders aging and blocked summary badges at standard tier', () => {
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getByText('1 aging')).toBeInTheDocument();
    expect(screen.getByText('1 blocked')).toBeInTheDocument();
  });

  it('hides summary badges at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkTeamFeed />);
    expect(screen.queryByText('1 aging')).not.toBeInTheDocument();
    expect(screen.queryByText('1 blocked')).not.toBeInTheDocument();
  });

  it('renders escalation badge at expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkTeamFeed />);
    expect(screen.getByText('0 escalation')).toBeInTheDocument();
  });

  it('hides escalation badge at standard tier', () => {
    render(<HbcMyWorkTeamFeed />);
    expect(screen.queryByText('0 escalation')).not.toBeInTheDocument();
  });

  it('filters items by search term', () => {
    render(<HbcMyWorkTeamFeed />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'item 1' } });
    expect(screen.getAllByTestId('list-item')).toHaveLength(1);
  });

  it('applies className', () => {
    const { container } = render(<HbcMyWorkTeamFeed className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});

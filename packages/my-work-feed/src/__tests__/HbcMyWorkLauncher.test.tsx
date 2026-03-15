import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkLauncher } from '../components/HbcMyWorkLauncher/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit/icons', () => ({
  Toolbox: (props: Record<string, unknown>) => (
    <svg data-testid="toolbox-icon" data-size={props.size} />
  ),
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcPopover: ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="popover">{trigger}{children}</div>
  ),
  HbcTypography: ({ children }: { children: React.ReactNode; intent: string }) => (
    <span>{children}</span>
  ),
}));

vi.mock('../components/HbcMyWorkBadge/index.js', () => ({
  HbcMyWorkBadge: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="my-work-badge" onClick={onClick}>Badge</button>
  ),
}));

vi.mock('../components/HbcMyWorkPanel/index.js', () => ({
  HbcMyWorkPanel: (props: Record<string, unknown>) => (
    <div data-testid="my-work-panel" data-has-on-open-feed={props.onOpenFeed ? 'true' : 'false'} />
  ),
}));

const mockUseMyWorkCounts = vi.fn();
const mockUseMyWorkPanelStore = vi.fn();

vi.mock('../hooks/useMyWorkCounts.js', () => ({
  useMyWorkCounts: (...args: unknown[]) => mockUseMyWorkCounts(...args),
}));

vi.mock('../store/MyWorkPanelStore.js', () => ({
  useMyWorkPanelStore: (...args: unknown[]) => mockUseMyWorkPanelStore(...args),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkLauncher', () => {
  let mockTogglePanel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockTogglePanel = vi.fn();
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 5, unreadCount: 3, nowCount: 3, blockedCount: 1, waitingCount: 2, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
    mockUseMyWorkPanelStore.mockReturnValue({
      togglePanel: mockTogglePanel,
      isPanelOpen: false,
      grouping: null,
      expandedGroups: new Set(),
      openPanel: vi.fn(),
      closePanel: vi.fn(),
      setGrouping: vi.fn(),
      toggleGroup: vi.fn(),
    });
  });

  it('renders icon button with count in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkLauncher />);
    expect(screen.getByTestId('toolbox-icon')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders badge in standard tier', () => {
    render(<HbcMyWorkLauncher />);
    expect(screen.getByTestId('my-work-badge')).toBeInTheDocument();
  });

  it('renders popover with breakdown in expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkLauncher />);
    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByText('Now: 3')).toBeInTheDocument();
    expect(screen.getByText('Blocked: 1')).toBeInTheDocument();
    expect(screen.getByText('Waiting: 2')).toBeInTheDocument();
  });

  it('calls togglePanel on click in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkLauncher />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockTogglePanel).toHaveBeenCalledOnce();
  });

  it('calls togglePanel on badge click in standard tier', () => {
    render(<HbcMyWorkLauncher />);
    fireEvent.click(screen.getByTestId('my-work-badge'));
    expect(mockTogglePanel).toHaveBeenCalledOnce();
  });

  it('always renders the panel component', () => {
    render(<HbcMyWorkLauncher />);
    expect(screen.getByTestId('my-work-panel')).toBeInTheDocument();
  });

  it('passes onOpenFeed to panel', () => {
    const onOpenFeed = vi.fn();
    render(<HbcMyWorkLauncher onOpenFeed={onOpenFeed} />);
    expect(screen.getByTestId('my-work-panel')).toHaveAttribute('data-has-on-open-feed', 'true');
  });

  it('sets correct aria-label in essential tier with count', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkLauncher />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      '3 work items need attention',
    );
  });

  it('sets My Work aria-label when count is 0 in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 0, unreadCount: 0, nowCount: 0, blockedCount: 0, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkLauncher />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'My Work');
  });

  it('does not show count in essential tier when nowCount is 0', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 0, unreadCount: 0, nowCount: 0, blockedCount: 0, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkLauncher />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

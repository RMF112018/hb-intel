import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkPlanningBar } from '../components/HbcMyWorkPlanningBar/index.js';
import type { IMyWorkCounts } from '../types/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit', () => ({
  HbcButton: ({ children, onClick, variant, ...rest }: { children: React.ReactNode; onClick?: () => void; variant?: string; 'aria-pressed'?: boolean; size?: string }) => (
    <button data-variant={variant} aria-pressed={rest['aria-pressed']} onClick={onClick}>
      {children}
    </button>
  ),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkPlanningBar', () => {
  const counts: IMyWorkCounts = {
    totalCount: 10,
    unreadCount: 5,
    nowCount: 3,
    blockedCount: 1,
    waitingCount: 2,
    deferredCount: 4,
  };

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  });

  it('returns null at essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(<HbcMyWorkPlanningBar />);
    expect(container.innerHTML).toBe('');
  });

  it('renders 3 filter buttons in standard tier', () => {
    render(<HbcMyWorkPlanningBar counts={counts} />);
    expect(screen.getByText(/Today/)).toBeInTheDocument();
    expect(screen.getByText(/This Week/)).toBeInTheDocument();
    expect(screen.getByText(/Deferred/)).toBeInTheDocument();
    expect(screen.queryByText(/Waiting On/)).not.toBeInTheDocument();
  });

  it('renders 4 filter buttons in expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkPlanningBar counts={counts} />);
    expect(screen.getByText(/Today/)).toBeInTheDocument();
    expect(screen.getByText(/This Week/)).toBeInTheDocument();
    expect(screen.getByText(/Waiting On/)).toBeInTheDocument();
    expect(screen.getByText(/Deferred/)).toBeInTheDocument();
  });

  it('shows counts in parentheses when provided', () => {
    render(<HbcMyWorkPlanningBar counts={counts} />);
    expect(screen.getByText('Today (3)')).toBeInTheDocument();
    expect(screen.getByText('This Week (10)')).toBeInTheDocument();
    expect(screen.getByText('Deferred (4)')).toBeInTheDocument();
  });

  it('calls onFilterChange with filter key when clicked', () => {
    const onFilterChange = vi.fn();
    render(<HbcMyWorkPlanningBar onFilterChange={onFilterChange} counts={counts} />);
    fireEvent.click(screen.getByText('Today (3)'));
    expect(onFilterChange).toHaveBeenCalledWith('today');
  });

  it('calls onFilterChange with undefined when active filter is clicked (toggle off)', () => {
    const onFilterChange = vi.fn();
    render(
      <HbcMyWorkPlanningBar activeFilter="today" onFilterChange={onFilterChange} counts={counts} />,
    );
    fireEvent.click(screen.getByText('Today (3)'));
    expect(onFilterChange).toHaveBeenCalledWith(undefined);
  });

  it('uses secondary variant for active filter', () => {
    render(<HbcMyWorkPlanningBar activeFilter="today" counts={counts} />);
    const todayButton = screen.getByText('Today (3)');
    expect(todayButton).toHaveAttribute('data-variant', 'secondary');
    expect(todayButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('uses ghost variant for inactive filters', () => {
    render(<HbcMyWorkPlanningBar activeFilter="today" counts={counts} />);
    const weekButton = screen.getByText('This Week (10)');
    expect(weekButton).toHaveAttribute('data-variant', 'ghost');
    expect(weekButton).toHaveAttribute('aria-pressed', 'false');
  });
});

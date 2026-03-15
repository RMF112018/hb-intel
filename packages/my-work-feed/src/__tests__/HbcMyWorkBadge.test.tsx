import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkBadge } from '../components/HbcMyWorkBadge/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit/icons', () => ({
  Toolbox: (props: Record<string, unknown>) => (
    <svg data-testid="toolbox-icon" data-size={props.size} />
  ),
}));

const mockUseMyWorkCounts = vi.fn().mockReturnValue({
  counts: undefined,
  isLoading: false,
  isError: false,
});

vi.mock('../hooks/useMyWorkCounts.js', () => ({
  useMyWorkCounts: (...args: unknown[]) => mockUseMyWorkCounts(...args),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkBadge', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 0, unreadCount: 0, nowCount: 0, blockedCount: 0, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
  });

  it('returns null when tier is essential', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(<HbcMyWorkBadge />);
    expect(container.innerHTML).toBe('');
  });

  it('renders toolbox icon in standard tier', () => {
    render(<HbcMyWorkBadge />);
    expect(screen.getByTestId('toolbox-icon')).toBeInTheDocument();
  });

  it('renders toolbox icon in expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkBadge />);
    expect(screen.getByTestId('toolbox-icon')).toBeInTheDocument();
  });

  it('shows count badge when nowCount > 0', () => {
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 5, unreadCount: 3, nowCount: 5, blockedCount: 0, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkBadge />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows no count badge when nowCount is 0', () => {
    render(<HbcMyWorkBadge />);
    const button = screen.getByRole('button');
    expect(button.querySelector('.hbc-my-work-badge__count')).toBeNull();
  });

  it('caps count at 99+ when > 99', () => {
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 150, unreadCount: 150, nowCount: 150, blockedCount: 0, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkBadge />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<HbcMyWorkBadge onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('sets correct aria-label with count', () => {
    mockUseMyWorkCounts.mockReturnValue({
      counts: { totalCount: 3, unreadCount: 3, nowCount: 3, blockedCount: 0, waitingCount: 0, deferredCount: 0 },
      isLoading: false,
      isError: false,
    });
    render(<HbcMyWorkBadge />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      '3 work items need attention',
    );
  });

  it('sets My Work aria-label when count is 0', () => {
    render(<HbcMyWorkBadge />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'My Work');
  });
});

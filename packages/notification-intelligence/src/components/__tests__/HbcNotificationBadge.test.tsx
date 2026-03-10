import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcNotificationBadge } from '../HbcNotificationBadge';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/ui-kit/icons', () => ({
  Notifications: (props: Record<string, unknown>) => (
    <svg data-testid="bell-icon" data-size={props.size} />
  ),
}));

const mockUseNotificationBadge = vi.fn().mockReturnValue({
  immediateUnreadCount: 0,
  hasImmediateUnread: false,
  isLoading: false,
  error: null,
});

vi.mock('../../hooks/useNotificationBadge', () => ({
  useNotificationBadge: (...args: unknown[]) => mockUseNotificationBadge(...args),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcNotificationBadge', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockUseNotificationBadge.mockReturnValue({
      immediateUnreadCount: 0,
      hasImmediateUnread: false,
      isLoading: false,
      error: null,
    });
  });

  it('returns null when tier is essential (D-08)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(<HbcNotificationBadge />);
    expect(container.innerHTML).toBe('');
  });

  it('renders bell icon in Standard tier', () => {
    render(<HbcNotificationBadge />);
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('renders bell icon in Expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcNotificationBadge />);
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('shows red badge with count when hasImmediateUnread', () => {
    mockUseNotificationBadge.mockReturnValue({
      immediateUnreadCount: 5,
      hasImmediateUnread: true,
      isLoading: false,
      error: null,
    });
    render(<HbcNotificationBadge />);
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge--red');
  });

  it('shows no badge count when immediateUnreadCount is 0', () => {
    render(<HbcNotificationBadge />);
    expect(screen.queryByClass?.('hbc-notification-badge__count')).toBeUndefined();
    // Verify no count span is rendered
    const button = screen.getByRole('button');
    expect(button.querySelector('.hbc-notification-badge__count')).toBeNull();
  });

  it('caps display at 99+ when count > 99', () => {
    mockUseNotificationBadge.mockReturnValue({
      immediateUnreadCount: 150,
      hasImmediateUnread: true,
      isLoading: false,
      error: null,
    });
    render(<HbcNotificationBadge />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<HbcNotificationBadge onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('sets correct aria-label with count', () => {
    mockUseNotificationBadge.mockReturnValue({
      immediateUnreadCount: 3,
      hasImmediateUnread: true,
      isLoading: false,
      error: null,
    });
    render(<HbcNotificationBadge />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      '3 unread notifications requiring attention'
    );
  });

  it('sets Notifications aria-label when count is 0', () => {
    render(<HbcNotificationBadge />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Notifications'
    );
  });
});

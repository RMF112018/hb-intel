import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcNotificationBanner } from '../HbcNotificationBanner';
import type { INotificationEvent } from '../../types/INotification';

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeNotification(overrides: Partial<INotificationEvent> = {}): INotificationEvent {
  return {
    id: 'n1',
    eventType: 'test.event',
    sourceModule: 'test',
    sourceRecordType: 'record',
    sourceRecordId: 'r1',
    recipientUserId: 'u1',
    computedTier: 'immediate',
    userTierOverride: null,
    effectiveTier: 'immediate',
    title: 'Test Notification',
    body: 'Test body text',
    actionUrl: '/test',
    actionLabel: 'View',
    createdAt: new Date().toISOString(),
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcNotificationBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when tier is essential (D-08)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const onDismiss = vi.fn();
    const { container } = render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when notification is null', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <HbcNotificationBanner notification={null} onDismiss={onDismiss} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when notification effectiveTier is not immediate (D-04)', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <HbcNotificationBanner
        notification={makeNotification({ effectiveTier: 'watch' })}
        onDismiss={onDismiss}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders banner for Immediate-tier notification in Standard mode', () => {
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('Test body text')).toBeInTheDocument();
  });

  it('renders banner for Immediate-tier notification in Expert mode', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('auto-dismisses after 30 seconds', () => {
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(onDismiss).toHaveBeenCalledWith('n1');
  });

  it('dismiss button clears timer and calls onDismiss with notification id', () => {
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalledWith('n1');
    // Timer should be cleared — advancing should not call again
    vi.advanceTimersByTime(30_000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('action CTA click clears timer and calls onDismiss with notification id', () => {
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByText('View'));
    expect(onDismiss).toHaveBeenCalledWith('n1');
    // Timer should be cleared
    vi.advanceTimersByTime(30_000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('timer resets when notification changes (new notification.id)', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <HbcNotificationBanner notification={makeNotification({ id: 'a' })} onDismiss={onDismiss} />
    );
    vi.advanceTimersByTime(20_000); // 20s into first notification
    // Switch to new notification
    rerender(
      <HbcNotificationBanner notification={makeNotification({ id: 'b' })} onDismiss={onDismiss} />
    );
    // Old timer should not fire at 30s mark
    vi.advanceTimersByTime(15_000);
    expect(onDismiss).not.toHaveBeenCalled();
    // New timer fires at 30s from rerender
    vi.advanceTimersByTime(15_000);
    expect(onDismiss).toHaveBeenCalledWith('b');
  });

  it('renders notification title and body text', () => {
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner
        notification={makeNotification({ title: 'My Title', body: 'My Body' })}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Body')).toBeInTheDocument();
  });

  it('has correct ARIA attributes (role="alert", aria-live="assertive", aria-atomic="true")', () => {
    const onDismiss = vi.fn();
    render(
      <HbcNotificationBanner notification={makeNotification()} onDismiss={onDismiss} />
    );
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'assertive');
    expect(banner).toHaveAttribute('aria-atomic', 'true');
  });
});

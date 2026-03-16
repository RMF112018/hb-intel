import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcNotificationBell } from '../HbcNotificationBell.js';

describe('HbcNotificationBell', () => {
  it('renders a button with accessible label', () => {
    render(<HbcNotificationBell />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('does not display a badge when unreadCount is 0', () => {
    const { container } = render(<HbcNotificationBell unreadCount={0} />);
    // Badge is a <span> with aria-hidden; the icon SVG also has aria-hidden,
    // so target only <span> elements.
    const badge = container.querySelector('span[aria-hidden="true"]');
    expect(badge).not.toBeInTheDocument();
  });

  it('displays unread count badge when unreadCount > 0', () => {
    render(<HbcNotificationBell unreadCount={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('caps displayed count at 99+', () => {
    render(<HbcNotificationBell unreadCount={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('includes unread count in aria-label', () => {
    render(<HbcNotificationBell unreadCount={3} />);
    expect(
      screen.getByRole('button', { name: /notifications, 3 unread/i }),
    ).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<HbcNotificationBell onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

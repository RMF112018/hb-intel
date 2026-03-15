import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkListItem } from '../components/HbcMyWorkListItem/index.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';
import type { IMyWorkItem } from '../types/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit', () => ({
  HbcButton: ({ children, onClick, variant, size }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string }) => (
    <button data-testid={`btn-${typeof children === 'string' ? children.toLowerCase().replace(/\s/g, '-') : 'action'}`} data-variant={variant} data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
  HbcStatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
  HbcTypography: ({ children, intent, className }: { children: React.ReactNode; intent: string; className?: string }) => (
    <span data-testid={`typography-${intent}`} className={className}>{children}</span>
  ),
  HbcPopover: ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="popover">{trigger}{children}</div>
  ),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkListItem', () => {
  let item: IMyWorkItem;

  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    item = createMockMyWorkItem({
      availableActions: [
        { key: 'approve', label: 'Approve', variant: 'primary' },
        { key: 'mark-read', label: 'Mark read', variant: 'secondary' },
        { key: 'defer', label: 'Defer', variant: 'secondary' },
      ],
    });
  });

  it('renders item title', () => {
    render(<HbcMyWorkListItem item={item} />);
    expect(screen.getByText('Review Transfer Request')).toBeInTheDocument();
  });

  it('renders title as link when href is present', () => {
    render(<HbcMyWorkListItem item={item} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/bic/transfers/rec-001');
  });

  it('renders title as text when no href', () => {
    const noHrefItem = createMockMyWorkItem({
      context: { moduleKey: 'bic' },
    });
    render(<HbcMyWorkListItem item={noHrefItem} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Review Transfer Request')).toBeInTheDocument();
  });

  it('shows unread dot when item is unread', () => {
    render(<HbcMyWorkListItem item={item} />);
    expect(screen.getByLabelText('Unread')).toBeInTheDocument();
  });

  it('hides unread dot when item is read', () => {
    const readItem = createMockMyWorkItem({ isUnread: false });
    render(<HbcMyWorkListItem item={readItem} />);
    expect(screen.queryByLabelText('Unread')).not.toBeInTheDocument();
  });

  it('shows overdue badge when item is overdue', () => {
    const overdueItem = createMockMyWorkItem({ isOverdue: true });
    render(<HbcMyWorkListItem item={overdueItem} />);
    expect(screen.getByTestId('status-badge-error')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('shows blocked badge when item is blocked', () => {
    const blockedItem = createMockMyWorkItem({ isBlocked: true });
    render(<HbcMyWorkListItem item={blockedItem} />);
    expect(screen.getByTestId('status-badge-warning')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('renders primary action button', () => {
    const onAction = vi.fn();
    render(<HbcMyWorkListItem item={item} onAction={onAction} />);
    fireEvent.click(screen.getByTestId('btn-approve'));
    expect(onAction).toHaveBeenCalledWith({ actionKey: 'approve', item });
  });

  it('renders micro-action buttons in standard tier', () => {
    render(<HbcMyWorkListItem item={item} />);
    expect(screen.getByTestId('btn-mark-read')).toBeInTheDocument();
    expect(screen.getByTestId('btn-defer')).toBeInTheDocument();
  });

  it('hides micro-actions in essential tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkListItem item={item} />);
    expect(screen.queryByTestId('btn-mark-read')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-defer')).not.toBeInTheDocument();
  });

  it('shows module badge and whyThisMatters in standard tier', () => {
    const detailItem = createMockMyWorkItem({ whyThisMatters: 'High priority' });
    render(<HbcMyWorkListItem item={detailItem} />);
    expect(screen.getByText('bic')).toBeInTheDocument();
    expect(screen.getByText('High priority')).toBeInTheDocument();
  });

  it('shows expectedAction and reasoning popover in expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkListItem item={item} />);
    expect(screen.getByText('Approve or reject the transfer')).toBeInTheDocument();
    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByText('Assigned to you and requires action')).toBeInTheDocument();
  });

  it('sets correct aria-label', () => {
    const { container } = render(<HbcMyWorkListItem item={item} />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Work item: Review Transfer Request');
  });
});

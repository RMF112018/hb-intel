import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcNotificationCenter } from '../HbcNotificationCenter';
import type { INotificationEvent } from '../../types/INotification';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockMarkRead = vi.fn();
const mockDismiss = vi.fn();
const mockMarkAllRead = vi.fn();
const mockFetchNextPage = vi.fn();

const mockUseNotificationCenter = vi.fn().mockReturnValue({
  items: [],
  totalCount: 0,
  immediateUnreadCount: 0,
  isLoading: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: mockFetchNextPage,
  error: null,
  markRead: mockMarkRead,
  dismiss: mockDismiss,
  markAllRead: mockMarkAllRead,
});

vi.mock('../../hooks/useNotificationCenter', () => ({
  useNotificationCenter: (...args: unknown[]) => mockUseNotificationCenter(...args),
}));

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
    body: 'Test body',
    actionUrl: '/test',
    actionLabel: 'View',
    createdAt: new Date().toISOString(),
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcNotificationCenter', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    mockMarkRead.mockClear();
    mockDismiss.mockClear();
    mockMarkAllRead.mockClear();
    mockFetchNextPage.mockClear();
    mockUseNotificationCenter.mockReturnValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
  });

  it('returns null when tier is essential (D-08)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(<HbcNotificationCenter />);
    expect(container.innerHTML).toBe('');
  });

  it('renders all four tab buttons', () => {
    render(<HbcNotificationCenter />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Immediate')).toBeInTheDocument();
    expect(screen.getByText('Watch')).toBeInTheDocument();
    expect(screen.getByText('Digest')).toBeInTheDocument();
  });

  it('default tab is All (aria-selected)', () => {
    render(<HbcNotificationCenter />);
    const allTab = screen.getByText('All').closest('button');
    expect(allTab).toHaveAttribute('aria-selected', 'true');
  });

  it('shows loading state', () => {
    mockUseNotificationCenter.mockReturnValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);
    expect(screen.getByText('Loading notifications…')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<HbcNotificationCenter />);
    expect(screen.getByText('No notifications in this category.')).toBeInTheDocument();
  });

  it('renders notification cards with tier border classes', () => {
    const items = [
      makeNotification({ id: 'n1', effectiveTier: 'immediate', title: 'Urgent' }),
      makeNotification({ id: 'n2', effectiveTier: 'watch', title: 'Watching' }),
      makeNotification({ id: 'n3', effectiveTier: 'digest', title: 'Summary' }),
    ];
    mockUseNotificationCenter.mockReturnValue({
      items,
      totalCount: 3,
      immediateUnreadCount: 1,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveClass('notification-card--immediate');
    expect(cards[1]).toHaveClass('notification-card--watch');
    expect(cards[2]).toHaveClass('notification-card--digest');
  });

  it('mark-read button calls markRead with notification id', () => {
    const items = [makeNotification({ id: 'n42' })];
    mockUseNotificationCenter.mockReturnValue({
      items,
      totalCount: 1,
      immediateUnreadCount: 1,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);
    fireEvent.click(screen.getByLabelText('Mark as read'));
    expect(mockMarkRead).toHaveBeenCalledWith('n42');
  });

  it('dismiss button calls dismiss with notification id', () => {
    const items = [makeNotification({ id: 'n42' })];
    mockUseNotificationCenter.mockReturnValue({
      items,
      totalCount: 1,
      immediateUnreadCount: 1,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(mockDismiss).toHaveBeenCalledWith('n42');
  });

  it('mark all read button visible when unread items exist', () => {
    const items = [makeNotification({ readAt: null })];
    mockUseNotificationCenter.mockReturnValue({
      items,
      totalCount: 1,
      immediateUnreadCount: 1,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);
    const markAllBtn = screen.getByText('Mark all as read');
    expect(markAllBtn).toBeInTheDocument();
    fireEvent.click(markAllBtn);
    expect(mockMarkAllRead).toHaveBeenCalledWith('all');
  });

  it('tab switching updates active tab', () => {
    render(<HbcNotificationCenter />);
    const watchTab = screen.getByText('Watch').closest('button')!;
    fireEvent.click(watchTab);
    expect(watchTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('All').closest('button')).toHaveAttribute('aria-selected', 'false');
  });

  it('load more button appears when hasNextPage is true', () => {
    mockUseNotificationCenter.mockReturnValue({
      items: [makeNotification()],
      totalCount: 50,
      immediateUnreadCount: 0,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);
    const loadMore = screen.getByText('Load more');
    expect(loadMore).toBeInTheDocument();
    fireEvent.click(loadMore);
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('load more button shows Loading… when isFetchingNextPage', () => {
    mockUseNotificationCenter.mockReturnValue({
      items: [makeNotification()],
      totalCount: 50,
      immediateUnreadCount: 0,
      isLoading: false,
      isFetchingNextPage: true,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      error: null,
      markRead: mockMarkRead,
      dismiss: mockDismiss,
      markAllRead: mockMarkAllRead,
    });
    render(<HbcNotificationCenter />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});

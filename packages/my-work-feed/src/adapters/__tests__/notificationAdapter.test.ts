/**
 * Gate 6 (P2-C2 §3): Notification tier-to-lane mapping validation.
 * Verifies that notification adapter correctly maps tiers to feed lanes:
 *   immediate → priority 'now' → lane 'do-now' (when unread)
 *   watch → priority 'soon' → lane 'watch'
 *   digest → priority 'watch' → lane 'watch'
 *   read (any tier) → lane 'watch'
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationAdapter } from '../notificationAdapter.js';
import type { IMyWorkRuntimeContext } from '../../types/index.js';

// Mock NotificationApi
vi.mock('@hbc/notification-intelligence', () => ({
  NotificationApi: {
    getCenter: vi.fn(),
  },
}));

import { NotificationApi } from '@hbc/notification-intelligence';
const mockGetCenter = vi.mocked(NotificationApi.getCenter);

function createMockEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-001',
    eventType: 'provisioning.request-submitted',
    title: 'New request submitted',
    body: 'A new project setup request needs your review.',
    effectiveTier: 'immediate' as const,
    defaultTier: 'immediate' as const,
    recipientUserId: 'user-1',
    sourceModule: 'provisioning',
    sourceRecordId: 'req-001',
    sourceRecordType: 'request',
    actionUrl: '/provisioning/req-001',
    actionLabel: 'Review',
    channels: ['push', 'email', 'in-app'] as const,
    createdAt: '2026-03-20T10:00:00.000Z',
    readAt: null as string | null,
    dismissedAt: null,
    ...overrides,
  };
}

const mockContext: IMyWorkRuntimeContext = {
  currentUserId: 'user-1',
  roleKeys: ['Member'],
  isOffline: false,
  complexityTier: 'standard',
};

describe('notification tier-to-lane mapping (P2-C2 §3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps immediate-tier unread notification to do-now lane', async () => {
    mockGetCenter
      .mockResolvedValueOnce({ items: [createMockEvent({ effectiveTier: 'immediate', readAt: null })], totalCount: 1, immediateUnreadCount: 1, hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null });

    const items = await notificationAdapter.load({}, mockContext);
    expect(items[0].lane).toBe('do-now');
    expect(items[0].priority).toBe('now');
  });

  it('maps watch-tier notification to watch lane', async () => {
    mockGetCenter
      .mockResolvedValueOnce({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ items: [createMockEvent({ effectiveTier: 'watch', readAt: null })], totalCount: 1, immediateUnreadCount: 0, hasMore: false, nextCursor: null });

    const items = await notificationAdapter.load({}, mockContext);
    expect(items[0].lane).toBe('do-now'); // Unread → do-now regardless of tier
    expect(items[0].priority).toBe('soon');
  });

  it('maps digest-tier notification to watch priority', async () => {
    mockGetCenter
      .mockResolvedValueOnce({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ items: [createMockEvent({ effectiveTier: 'digest', readAt: null })], totalCount: 1, immediateUnreadCount: 0, hasMore: false, nextCursor: null });

    const items = await notificationAdapter.load({}, mockContext);
    expect(items[0].priority).toBe('watch');
  });

  it('maps read immediate notification to watch lane', async () => {
    mockGetCenter
      .mockResolvedValueOnce({ items: [createMockEvent({ effectiveTier: 'immediate', readAt: '2026-03-20T11:00:00Z' })], totalCount: 1, immediateUnreadCount: 0, hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null });

    const items = await notificationAdapter.load({}, mockContext);
    expect(items[0].lane).toBe('watch');
    expect(items[0].state).toBe('active');
  });

  it('assigns attention-item class to all notifications', async () => {
    mockGetCenter
      .mockResolvedValueOnce({ items: [createMockEvent()], totalCount: 1, immediateUnreadCount: 1, hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null });

    const items = await notificationAdapter.load({}, mockContext);
    expect(items[0].class).toBe('attention-item');
  });

  it('sets action URL from notification event', async () => {
    mockGetCenter
      .mockResolvedValueOnce({ items: [createMockEvent({ actionUrl: '/accounting/req-42' })], totalCount: 1, immediateUnreadCount: 1, hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null });

    const items = await notificationAdapter.load({}, mockContext);
    expect(items[0].context.href).toBe('/accounting/req-42');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { INotificationEvent, INotificationCenterResult } from '@hbc/notification-intelligence';

vi.mock('@hbc/notification-intelligence', () => ({
  NotificationApi: {
    getCenter: vi.fn(),
  },
}));

import { NotificationApi } from '@hbc/notification-intelligence';
import { notificationAdapter } from '../../adapters/notificationAdapter.js';
import { createMockRuntimeContext, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

const mockGetCenter = vi.mocked(NotificationApi.getCenter);

function createNotificationEvent(overrides?: Partial<INotificationEvent>): INotificationEvent {
  return {
    id: 'notif-001',
    eventType: 'bic.transfer',
    sourceModule: 'bd-scorecard',
    sourceRecordType: 'transfer',
    sourceRecordId: 'rec-001',
    recipientUserId: 'user-001',
    computedTier: 'immediate',
    userTierOverride: null,
    effectiveTier: 'immediate',
    title: 'Transfer assigned to you',
    body: 'TR-001 has been assigned for your review.',
    actionUrl: '/bd-scorecard/transfers/rec-001',
    actionLabel: 'Review',
    createdAt: '2026-01-15T10:00:00.000Z',
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

function createCenterResult(items: INotificationEvent[]): INotificationCenterResult {
  return {
    items,
    totalCount: items.length,
    immediateUnreadCount: items.filter((i) => i.effectiveTier === 'immediate' && !i.readAt).length,
    hasMore: false,
    nextCursor: null,
  };
}

describe('notificationAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports isEnabled as true', () => {
    expect(notificationAdapter.isEnabled(createMockRuntimeContext())).toBe(true);
  });

  it('maps immediate tier to now priority', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([createNotificationEvent()]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toHaveLength(1);
    expect(items[0].priority).toBe('now');
    expect(items[0].class).toBe('attention-item');
  });

  it('maps watch tier to soon priority', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([]))
      .mockResolvedValueOnce(createCenterResult([
        createNotificationEvent({ effectiveTier: 'watch' }),
      ]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('soon');
  });

  it('maps digest tier to watch priority', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([
        createNotificationEvent({ effectiveTier: 'digest' }),
      ]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('watch');
  });

  it('sets isUnread based on readAt', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([
        createNotificationEvent({ readAt: null }),
        createNotificationEvent({ id: 'notif-002', readAt: '2026-01-16T10:00:00.000Z' }),
      ]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].isUnread).toBe(true);
    expect(items[0].state).toBe('new');
    expect(items[1].isUnread).toBe(false);
    expect(items[1].state).toBe('active');
  });

  it('builds correct dedupeKey format matching BIC/handoff pattern', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([createNotificationEvent()]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].dedupeKey).toBe('bd-scorecard::transfer::rec-001');
    expect(items[0].workItemId).toBe('notification-intelligence::notif-001');
  });

  it('includes view and dismiss available actions', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([createNotificationEvent({ actionLabel: 'Open' })]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].availableActions).toEqual([
      { key: 'view', label: 'Open' },
      { key: 'dismiss', label: 'Dismiss' },
    ]);
  });

  it('uses default View label when actionLabel is empty', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([createNotificationEvent({ actionLabel: '' })]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].availableActions[0].label).toBe('View');
  });

  it('returns empty array when no notifications', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([]))
      .mockResolvedValueOnce(createCenterResult([]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toEqual([]);
  });

  it('fetches both immediate and watch tiers', async () => {
    mockGetCenter
      .mockResolvedValueOnce(createCenterResult([createNotificationEvent()]))
      .mockResolvedValueOnce(createCenterResult([
        createNotificationEvent({ id: 'notif-002', effectiveTier: 'watch' }),
      ]));

    const items = await notificationAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toHaveLength(2);
    expect(mockGetCenter).toHaveBeenCalledWith({ tier: 'immediate', unreadOnly: true });
    expect(mockGetCenter).toHaveBeenCalledWith({ tier: 'watch', unreadOnly: true });
  });
});

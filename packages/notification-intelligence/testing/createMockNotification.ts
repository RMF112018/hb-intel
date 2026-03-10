import type { INotificationEvent } from '../src/types';

/** Factory for mock notification instances */
export function createMockNotification(overrides?: Partial<INotificationEvent>): INotificationEvent {
  return {
    id: 'notif-001',
    eventType: 'test.event',
    sourceModule: 'test-module',
    sourceRecordType: 'test-record',
    sourceRecordId: 'rec-001',
    recipientUserId: 'user-001',
    computedTier: 'watch',
    userTierOverride: null,
    effectiveTier: 'watch',
    title: 'Test Notification',
    body: 'This is a test notification.',
    actionUrl: '/test/rec-001',
    actionLabel: 'View',
    createdAt: '2026-01-01T00:00:00.000Z',
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

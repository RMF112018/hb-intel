/**
 * SharePoint list CRUD helpers for the HbcNotifications list.
 * Uses the service-factory adapter pattern: real SharePoint in production,
 * in-memory Map in test/mock mode.
 *
 * SF10-T08 — D-01: HbcNotifications SharePoint list persistence.
 */

import type {
  INotificationEvent,
  INotificationCenterFilter,
  INotificationCenterResult,
  NotificationTier,
} from '@hbc/notification-intelligence';

interface CreateNotificationInput {
  eventType: string;
  sourceModule: string;
  sourceRecordType: string;
  sourceRecordId: string;
  recipientUserId: string;
  computedTier: NotificationTier;
  userTierOverride: NotificationTier | null;
  effectiveTier: NotificationTier;
  title: string;
  body: string;
  actionUrl: string;
  actionLabel?: string;
  readAt: string | null;
  dismissedAt: string | null;
}

function toEvent(id: string, input: CreateNotificationInput): INotificationEvent {
  return {
    id,
    eventType: input.eventType,
    sourceModule: input.sourceModule,
    sourceRecordType: input.sourceRecordType,
    sourceRecordId: input.sourceRecordId,
    recipientUserId: input.recipientUserId,
    computedTier: input.computedTier,
    userTierOverride: input.userTierOverride,
    effectiveTier: input.effectiveTier,
    title: input.title,
    body: input.body,
    actionUrl: input.actionUrl,
    actionLabel: input.actionLabel ?? 'View',
    createdAt: new Date().toISOString(),
    readAt: input.readAt,
    dismissedAt: input.dismissedAt,
  };
}

// ─── In-Memory Mock Store ──────────────────────────────────────────────────────

const mockStore = new Map<string, INotificationEvent>();
let mockIdCounter = 1;

function createMockStore() {
  return {
    async create(input: CreateNotificationInput): Promise<string> {
      const id = String(mockIdCounter++);
      mockStore.set(id, toEvent(id, input));
      return id;
    },

    async getCenter(userId: string, filter: INotificationCenterFilter): Promise<INotificationCenterResult> {
      const all = Array.from(mockStore.values())
        .filter((n) => n.recipientUserId === userId && !n.dismissedAt)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      let filtered = all;
      if (filter.tier && filter.tier !== 'all') {
        filtered = filtered.filter((n) => n.effectiveTier === filter.tier);
      }
      if (filter.unreadOnly) {
        filtered = filtered.filter((n) => !n.readAt);
      }

      const pageSize = filter.pageSize ?? 20;
      const startIndex = filter.cursor ? parseInt(filter.cursor, 10) : 0;
      const page = filtered.slice(startIndex, startIndex + pageSize);
      const hasMore = startIndex + pageSize < filtered.length;

      return {
        items: page,
        totalCount: filtered.length,
        immediateUnreadCount: all.filter((n) => n.effectiveTier === 'immediate' && !n.readAt).length,
        hasMore,
        nextCursor: hasMore ? String(startIndex + pageSize) : null,
      };
    },

    async getById(id: string): Promise<INotificationEvent | null> {
      return mockStore.get(id) ?? null;
    },

    async markRead(id: string): Promise<void> {
      const item = mockStore.get(id);
      if (item) {
        item.readAt = new Date().toISOString();
      }
    },

    async dismiss(id: string): Promise<void> {
      const item = mockStore.get(id);
      if (item) {
        item.dismissedAt = new Date().toISOString();
      }
    },

    async markAllRead(userId: string, tier?: NotificationTier): Promise<void> {
      const now = new Date().toISOString();
      for (const item of mockStore.values()) {
        if (item.recipientUserId === userId && !item.readAt) {
          if (!tier || item.effectiveTier === tier) {
            item.readAt = now;
          }
        }
      }
    },

    async getUnreadDigestItems(userId: string): Promise<INotificationEvent[]> {
      return Array.from(mockStore.values()).filter(
        (n) =>
          n.recipientUserId === userId &&
          n.effectiveTier === 'digest' &&
          !n.readAt &&
          !n.dismissedAt,
      );
    },

    async markDigestSent(userId: string, ids: string[]): Promise<void> {
      const now = new Date().toISOString();
      for (const id of ids) {
        const item = mockStore.get(id);
        if (item && item.recipientUserId === userId) {
          item.readAt = now;
        }
      }
    },
  };
}

// ─── Real SharePoint Store (Phase 1: delegates to mock) ────────────────────────

function createRealStore() {
  // Phase 1: real SharePoint list operations will be implemented when
  // infrastructure is deployed. For now, delegate to mock store.
  // TODO: Replace with createServiceFactory().sharePoint list operations
  return createMockStore();
}

// ─── Exported Singleton ─────────────────────────────────────────────────────────

const isMock = process.env.HBC_ADAPTER_MODE === 'mock' || process.env.NODE_ENV === 'test';

export const notificationStore = isMock ? createMockStore() : createRealStore();

/**
 * SharePoint list CRUD helpers for the HbcNotificationPreferences list.
 * Uses the service-factory adapter pattern: real SharePoint in production,
 * in-memory Map in test/mock mode.
 *
 * SF10-T08 — D-06: User notification preferences persistence.
 */

import type { INotificationPreferences } from '@hbc/notification-intelligence';

const DEFAULT_PREFERENCES: Omit<INotificationPreferences, 'userId'> = {
  tierOverrides: {},
  pushEnabled: false,
  digestDay: 0,
  digestHour: 8,
};

function createDefaultPreferences(userId: string): INotificationPreferences {
  return { userId, ...DEFAULT_PREFERENCES };
}

// ─── In-Memory Mock Store ──────────────────────────────────────────────────────

const mockStore = new Map<string, INotificationPreferences>();

function createMockStore() {
  return {
    async get(userId: string): Promise<INotificationPreferences | null> {
      return mockStore.get(userId) ?? null;
    },

    async getOrDefault(userId: string): Promise<INotificationPreferences> {
      return mockStore.get(userId) ?? createDefaultPreferences(userId);
    },

    async update(
      userId: string,
      updates: Partial<Omit<INotificationPreferences, 'userId'>>,
    ): Promise<INotificationPreferences> {
      const existing = mockStore.get(userId) ?? createDefaultPreferences(userId);
      const updated: INotificationPreferences = { ...existing, ...updates, userId };
      mockStore.set(userId, updated);
      return updated;
    },

    async getUsersWithDigestDue(day: number, hour: number): Promise<INotificationPreferences[]> {
      const results: INotificationPreferences[] = [];
      for (const prefs of mockStore.values()) {
        if (prefs.digestDay === day && prefs.digestHour === hour) {
          results.push(prefs);
        }
      }
      return results;
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

export const preferencesStore = isMock ? createMockStore() : createRealStore();

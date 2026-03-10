# SF10-T04 — API Layer: `NotificationApi` + `PreferencesApi`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-01 (Azure Functions backend; HbcNotifications SharePoint list), D-02 (tier model), D-06 (digest schedule in preferences), D-07 (SPFx API routing)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T02 (contracts), T03 (registry — send validates event type is registered)

> **Doc Classification:** Canonical Normative Plan — SF10-T04 API task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement `src/api/NotificationApi.ts` and `src/api/PreferencesApi.ts`. `NotificationApi` provides `send()`, `markRead()`, `dismiss()`, `markAllRead()`, and `getCenter()`. `PreferencesApi` provides `getPreferences()` and `updatePreferences()`. All methods are thin REST clients that call the Azure Functions backend — no local state management.

---

## 3-Line Plan

1. Implement `NotificationApi` with five methods; `send()` validates the event type is registered before dispatching; `getCenter()` accepts `INotificationCenterFilter` and returns `INotificationCenterResult`.
2. Implement `PreferencesApi` with `getPreferences()` and `updatePreferences()`.
3. Write unit tests for all seven methods using `vi.mock('node-fetch')` / `global.fetch` mock from T01 test-setup.

---

## `src/api/NotificationApi.ts`

```typescript
/**
 * NotificationApi — SF10-T04
 *
 * Thin REST client for the Azure Functions notification backend.
 * All routes are prefixed with /api/notifications/.
 *
 * D-01: Azure Functions backend; HbcNotifications SharePoint list as in-app store.
 * D-07: API calls route through Azure Functions regardless of surface (PWA or SPFx).
 */

import type {
  INotificationCenterFilter,
  INotificationCenterResult,
  INotificationEvent,
  NotificationSendPayload,
} from '../types/INotification';
import { NotificationRegistry } from '../registry/NotificationRegistry';

const BASE_URL = '/api/notifications';

async function fetchJSON<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`NotificationApi: ${res.status} — ${error}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Send a notification event to the Azure Functions queue processor.
 * The processor resolves the effective tier, looks up user preferences,
 * and routes to the appropriate delivery channels (push, email, in-app).
 *
 * @throws {Error} If the eventType is not registered in the NotificationRegistry.
 */
async function send(payload: NotificationSendPayload): Promise<void> {
  const registration = NotificationRegistry.getByEventType(payload.eventType);
  if (!registration) {
    throw new Error(
      `NotificationApi.send: unknown eventType "${payload.eventType}". ` +
        `Register it with NotificationRegistry.register() at package initialization.`
    );
  }

  await fetchJSON<void>(`${BASE_URL}/send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieve paginated notification center items for the current user.
 */
async function getCenter(
  filter: INotificationCenterFilter = {}
): Promise<INotificationCenterResult> {
  const params = new URLSearchParams();
  if (filter.tier) params.set('tier', filter.tier);
  if (filter.unreadOnly) params.set('unreadOnly', 'true');
  if (filter.cursor) params.set('cursor', filter.cursor);
  if (filter.pageSize) params.set('pageSize', String(filter.pageSize));

  return fetchJSON<INotificationCenterResult>(
    `${BASE_URL}/center?${params.toString()}`
  );
}

/**
 * Mark a single notification as read.
 */
async function markRead(notificationId: string): Promise<void> {
  await fetchJSON<void>(`${BASE_URL}/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/**
 * Mark all notifications in a tier as read.
 * Pass 'all' to mark all tiers.
 */
async function markAllRead(
  tier: 'immediate' | 'watch' | 'digest' | 'all' = 'all'
): Promise<void> {
  await fetchJSON<void>(`${BASE_URL}/mark-all-read`, {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}

/**
 * Dismiss a notification (removes it from the active center view).
 */
async function dismiss(notificationId: string): Promise<void> {
  await fetchJSON<void>(`${BASE_URL}/${notificationId}/dismiss`, {
    method: 'PATCH',
  });
}

export const NotificationApi = {
  send,
  getCenter,
  markRead,
  markAllRead,
  dismiss,
} as const;
```

---

## `src/api/PreferencesApi.ts`

```typescript
/**
 * PreferencesApi — SF10-T04
 *
 * Manages per-user notification preferences stored in the
 * HbcNotificationPreferences SharePoint list (one row per user).
 * Accessed via the Azure Functions /api/notifications/preferences route.
 *
 * D-06: Digest schedule (digestDay, digestHour) managed here.
 */

import type { INotificationPreferences } from '../types/INotification';

const PREFERENCES_URL = '/api/notifications/preferences';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`PreferencesApi: ${res.status} — ${error}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Retrieve the notification preferences for the current user.
 * Returns platform defaults if no preferences have been saved.
 */
async function getPreferences(): Promise<INotificationPreferences> {
  return fetchJSON<INotificationPreferences>(PREFERENCES_URL);
}

/**
 * Update notification preferences for the current user.
 * Supports partial updates — only the provided fields are changed.
 */
async function updatePreferences(
  updates: Partial<Omit<INotificationPreferences, 'userId'>>
): Promise<INotificationPreferences> {
  return fetchJSON<INotificationPreferences>(PREFERENCES_URL, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export const PreferencesApi = {
  getPreferences,
  updatePreferences,
} as const;
```

---

## Azure Functions Endpoint Reference

The API client calls these Azure Functions routes. Implementation in T08.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/notifications/send` | Queue a notification event for processing |
| `GET` | `/api/notifications/center` | Retrieve paginated in-app center items |
| `PATCH` | `/api/notifications/{id}/read` | Mark single notification as read |
| `POST` | `/api/notifications/mark-all-read` | Mark all (or tier-specific) notifications as read |
| `PATCH` | `/api/notifications/{id}/dismiss` | Dismiss a notification |
| `GET` | `/api/notifications/preferences` | Get user preferences |
| `PATCH` | `/api/notifications/preferences` | Partial update to user preferences |

---

## Unit Tests: `src/api/NotificationApi.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationApi } from './NotificationApi';
import { NotificationRegistry } from '../registry/NotificationRegistry';

describe('NotificationApi', () => {
  beforeEach(() => {
    NotificationRegistry._clearForTesting();
    vi.mocked(global.fetch).mockReset();
  });

  describe('send()', () => {
    it('throws if eventType is not registered', async () => {
      await expect(
        NotificationApi.send({
          eventType: 'unregistered.event',
          sourceModule: 'test',
          sourceRecordType: 'record',
          sourceRecordId: '1',
          recipientUserId: 'user-1',
          title: 'Test',
          body: 'Body',
          actionUrl: '/test',
        })
      ).rejects.toThrow('unknown eventType "unregistered.event"');
    });

    it('calls the /send endpoint when eventType is registered', async () => {
      NotificationRegistry.register([
        { eventType: 'test.send', defaultTier: 'watch', description: 'Test', tierOverridable: true, channels: ['in-app'] },
      ]);
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      await NotificationApi.send({
        eventType: 'test.send',
        sourceModule: 'test',
        sourceRecordType: 'record',
        sourceRecordId: '1',
        recipientUserId: 'user-1',
        title: 'Test',
        body: 'Body',
        actionUrl: '/test',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/send',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('getCenter()', () => {
    it('calls the /center endpoint with tier filter', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], totalCount: 0, immediateUnreadCount: 0, hasMore: false, nextCursor: null }),
      } as Response);

      await NotificationApi.getCenter({ tier: 'immediate', pageSize: 20 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('tier=immediate'),
        expect.any(Object)
      );
    });
  });

  describe('markAllRead()', () => {
    it('calls mark-all-read with the specified tier', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);
      await NotificationApi.markAllRead('watch');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-all-read',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ tier: 'watch' }) })
      );
    });
  });
});
```

---

## Verification Commands

```bash
# Type-check
pnpm --filter @hbc/notification-intelligence check-types

# Run unit tests
pnpm --filter @hbc/notification-intelligence test

# Confirm API module exports
node -e "
const { NotificationApi } = require('./packages/notification-intelligence/dist/api/NotificationApi.js');
console.log('send:', typeof NotificationApi.send);
console.log('getCenter:', typeof NotificationApi.getCenter);
console.log('markRead:', typeof NotificationApi.markRead);
console.log('dismiss:', typeof NotificationApi.dismiss);
"
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T04 completed: 2026-03-10
- NotificationApi: 5 methods (send, getCenter, markRead, markAllRead, dismiss) + fetchJSON helper
- PreferencesApi: 2 methods (getPreferences, updatePreferences) + fetchJSON helper
- send() validates eventType against NotificationRegistry before dispatching
- ADR reference corrected to ADR-0099 (per SF10 master plan)
- 7 NotificationApi tests + 2 PreferencesApi tests = 9 API tests passing
- All 19 tests passing (registry + API), check-types clean, build clean
Documentation updated: SF10-Notification-Intelligence.md progress notes
Next: SF10-T05 (React Hooks)
-->

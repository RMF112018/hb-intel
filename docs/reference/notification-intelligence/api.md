# @hbc/notification-intelligence — API Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; developer audience; notification-intelligence API reference.

**Package:** `packages/notification-intelligence/`
**Locked ADR:** [ADR-0099](../../architecture/adr/0099-notification-intelligence-tiered-model.md)

---

## Main Exports (`@hbc/notification-intelligence`)

### Types

| Export | Kind | Description |
|--------|------|-------------|
| `INotificationEvent` | Interface | Persisted notification in HbcNotifications SharePoint list |
| `INotificationRegistration` | Interface | Registered event type definition (singleton registry) |
| `INotificationPreferences` | Interface | Per-user preferences stored in HbcNotificationPreferences list |
| `NotificationSendPayload` | Interface | Input payload for `NotificationApi.send()` |
| `INotificationCenterResult` | Interface | Paginated response from `NotificationApi.getCenter()` |
| `INotificationCenterFilter` | Interface | Query options for notification center |
| `NotificationTier` | Union type | `'immediate' \| 'watch' \| 'digest'` |
| `NotificationChannel` | Union type | `'push' \| 'email' \| 'in-app' \| 'digest-email'` |

### Registry

| Export | Kind | Description |
|--------|------|-------------|
| `NotificationRegistry.register(registrations)` | Function | Register event types; throws on duplicate or invalid tier (D-05) |
| `NotificationRegistry.getAll()` | Function | All registrations in insertion order |
| `NotificationRegistry.getByEventType(eventType)` | Function | Single registration lookup; returns `undefined` if not found |
| `NotificationRegistry.getByModule(module)` | Function | Filter registrations by eventType prefix |
| `NotificationRegistry.size()` | Function | Count of registered event types |
| `NotificationRegistry._clearForTesting()` | Function | Testing only — resets registry state |

### API Client

| Export | Kind | Description |
|--------|------|-------------|
| `NotificationApi.send(payload)` | Function | POST `/api/notifications/send` — validates eventType against registry |
| `NotificationApi.getCenter(filter?)` | Function | GET `/api/notifications/center` — paginated notification items |
| `NotificationApi.markRead(notificationId)` | Function | PATCH `/api/notifications/{id}/read` |
| `NotificationApi.markAllRead(tier?)` | Function | POST `/api/notifications/mark-all-read` — defaults to `'all'` |
| `NotificationApi.dismiss(notificationId)` | Function | PATCH `/api/notifications/{id}/dismiss` |

| Export | Kind | Description |
|--------|------|-------------|
| `PreferencesApi.getPreferences()` | Function | GET `/api/notifications/preferences` |
| `PreferencesApi.updatePreferences(updates)` | Function | PATCH `/api/notifications/preferences` — partial update |

### Hooks

| Export | Kind | Description |
|--------|------|-------------|
| `useNotificationBadge()` | Hook | Immediate-tier unread count with 60s polling (D-03) |
| `useNotificationCenter(filter?)` | Hook | Paginated items with tier filtering; returns mutations for markRead, dismiss, markAllRead |
| `useNotificationPreferences()` | Hook | Get/update preferences with optimistic update and rollback |
| `notificationKeys` | Constant | TanStack Query key factory for cache management |

### Components

| Export | Kind | Description |
|--------|------|-------------|
| `HbcNotificationBadge` | Component | Header bell icon with Immediate unread count badge (D-03, D-08) |
| `HbcNotificationCenter` | Component | Full notification panel with tier tabs, infinite scroll, per-item controls (D-02, D-08) |
| `HbcNotificationBanner` | Component | Immediate-tier dismissible in-page alert with 30s auto-dismiss (D-04, D-08) |
| `HbcNotificationPreferences` | Component | Expert-mode preference panel with tier overrides, digest schedule, push toggle (D-05–D-08) |

---

## Component Props

### HbcNotificationBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | — | Click handler; typically opens the notification center panel |

### HbcNotificationCenter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultFilter` | `NotificationTier \| 'all'` | `'all'` | Initial tab selection |
| `maxItems` | `number` | `25` | Page size for infinite scroll |

### HbcNotificationBanner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notification` | `INotificationEvent \| null \| undefined` | — | Current notification to display |
| `onDismiss` | `(notificationId: string) => void` | — | Called on user dismiss or auto-dismiss |

### HbcNotificationPreferences

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | `() => void` | — | Called after preferences are saved |

---

## Hook Return Values

### useNotificationBadge

| Field | Type | Description |
|-------|------|-------------|
| `immediateUnreadCount` | `number` | Unread count for Immediate tier only |
| `hasImmediateUnread` | `boolean` | `true` when `immediateUnreadCount > 0` |
| `isLoading` | `boolean` | Initial load state |
| `error` | `Error \| null` | Query error |

### useNotificationCenter

| Field | Type | Description |
|-------|------|-------------|
| `items` | `INotificationEvent[]` | Flattened items from all pages |
| `totalCount` | `number` | Total notification count |
| `immediateUnreadCount` | `number` | Unread Immediate-tier count |
| `isLoading` | `boolean` | Initial load state |
| `isFetchingNextPage` | `boolean` | Next page loading state |
| `hasNextPage` | `boolean` | More pages available |
| `fetchNextPage` | `() => void` | Load next page |
| `error` | `Error \| null` | Query error |
| `markRead` | `(id: string) => void` | Mark single notification as read |
| `dismiss` | `(id: string) => void` | Dismiss notification |
| `markAllRead` | `(tier: NotificationTier \| 'all') => void` | Mark all as read in tier |

### useNotificationPreferences

| Field | Type | Description |
|-------|------|-------------|
| `preferences` | `INotificationPreferences \| undefined` | Current user preferences |
| `isLoading` | `boolean` | Initial load state |
| `error` | `Error \| null` | Query error |
| `updatePreferences` | `(updates: Partial<INotificationPreferences>) => void` | Optimistic update |
| `isUpdating` | `boolean` | Mutation pending state |
| `updateError` | `Error \| null` | Mutation error |

---

## Testing Sub-Path (`@hbc/notification-intelligence/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockNotification(overrides?)` | Factory | `INotificationEvent` with sensible defaults (watch tier, test module) |
| `createMockNotificationPreferences(overrides?)` | Factory | `INotificationPreferences` with userId, empty tierOverrides, Sunday 08:00 digest |
| `createMockNotificationRegistration(overrides?)` | Factory | `INotificationRegistration` with watch tier, in-app channel, overridable |
| `mockNotificationTiers` | Constant | `readonly ['immediate', 'watch', 'digest']` |
| `mockNotificationChannels` | Constant | `readonly ['push', 'email', 'in-app', 'digest-email']` |

> **Note:** The `testing/` sub-path is excluded from the production bundle. Import only in test files.

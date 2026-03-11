# @hbc/notification-intelligence

Priority-tiered smart notification system for HB Intel.

## Overview

`@hbc/notification-intelligence` replaces flat-broadcast notifications with a three-tier priority model (`immediate | watch | digest`) that routes through tier-appropriate channels and respects user preferences. All HB Intel modules register event types here and send notifications through this package's API.

**ADR:** [ADR-0099 — Notification Intelligence Tiered Model](../../docs/architecture/adr/0099-notification-intelligence-tiered-model.md)

## Quick Start

```typescript
import {
  NotificationRegistry,
  NotificationApi,
  useNotificationBadge,
  useNotificationCenter,
  HbcNotificationBadge,
  HbcNotificationCenter,
} from '@hbc/notification-intelligence';

// 1. Register event types at module init (D-05)
NotificationRegistry.register([
  {
    eventType: 'mymodule.item.created',
    defaultTier: 'watch',
    description: 'New item created',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },
]);

// 2. Send notifications via API
await NotificationApi.send({
  eventType: 'mymodule.item.created',
  sourceModule: 'my-module',
  sourceRecordType: 'item',
  sourceRecordId: 'item-001',
  recipientUserId: 'user-042',
  title: 'New Item',
  body: 'A new item was created.',
  actionUrl: '/my-module/items/item-001',
});

// 3. Consume hooks for real-time UI
const { immediateUnreadCount } = useNotificationBadge();
const { items, markRead, dismiss } = useNotificationCenter();
```

## Exports

| Export | Description |
|--------|-------------|
| `NotificationRegistry` | Singleton event type registry (D-05) |
| `NotificationApi` | REST client: send, getCenter, markRead, markAllRead, dismiss |
| `PreferencesApi` | REST client: getPreferences, updatePreferences |
| `useNotificationBadge` | Immediate-tier unread count with 60s polling (D-03) |
| `useNotificationCenter` | Paginated items + mutations (markRead, dismiss, markAllRead) |
| `useNotificationPreferences` | Preferences with optimistic update/rollback |
| `HbcNotificationBadge` | Header bell icon (Standard/Expert) |
| `HbcNotificationCenter` | Full notification panel with tier tabs |
| `HbcNotificationBanner` | Immediate-tier auto-dismiss banner (D-04) |
| `HbcNotificationPreferences` | Expert-mode preference panel |

## Testing

```bash
pnpm --filter @hbc/notification-intelligence test
pnpm --filter @hbc/notification-intelligence test --coverage
```

Test fixtures available via the `testing` sub-path:

```typescript
import {
  createMockNotification,
  createMockNotificationPreferences,
  createMockNotificationRegistration,
  mockNotificationTiers,
  mockNotificationChannels,
} from '@hbc/notification-intelligence/testing';
```

## Documentation

- [Adoption Guide](../../docs/how-to/developer/notification-intelligence-adoption-guide.md)
- [API Reference](../../docs/reference/notification-intelligence/api.md)
- [ADR-0099](../../docs/architecture/adr/0099-notification-intelligence-tiered-model.md)

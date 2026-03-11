# How to Add Notifications to a Module

> **Doc Classification:** Living Reference (Diátaxis) — How-to quadrant; developer audience; notification-intelligence module adoption.

This guide walks you through wiring `@hbc/notification-intelligence` into a consuming module for priority-tiered notifications.

**Locked ADR:** [ADR-0099](../../architecture/adr/0099-notification-intelligence-tiered-model.md)
**API Reference:** [notification-intelligence/api.md](../../reference/notification-intelligence/api.md)

---

## 1. When to Add Notifications

Add notification intelligence when your module needs to alert users about events that require attention, acknowledgment, or periodic review. Typical use cases:

- **BIC Next Move** — immediate alert when a transfer is assigned to the user
- **Workflow Handoff** — immediate alert when a handoff package arrives
- **Field Annotations** — watch notification when a field comment is added
- **Data Seeding** — digest summary of completed imports

If your module only needs a one-time confirmation (e.g., "Record saved"), use a local toast instead.

---

## 2. Registering Event Types (D-05)

Register your module's event types at package initialization:

```typescript
import { NotificationRegistry } from '@hbc/notification-intelligence';

NotificationRegistry.register([
  {
    eventType: 'mymodule.record.created',
    defaultTier: 'watch',
    description: 'New record created in My Module',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },
  {
    eventType: 'mymodule.transfer.assigned',
    defaultTier: 'immediate',
    description: 'Transfer assigned to you',
    tierOverridable: false, // Immediate events cannot be downgraded
    channels: ['in-app', 'push', 'email'],
  },
]);
```

Registration is additive and validated. Duplicate `eventType` values or invalid tiers throw at registration time.

---

## 3. Sending Notifications

Use `NotificationApi.send()` from your module's backend or API layer:

```typescript
import { NotificationApi } from '@hbc/notification-intelligence';

await NotificationApi.send({
  eventType: 'mymodule.transfer.assigned',
  sourceModule: 'my-module',
  sourceRecordType: 'transfer',
  sourceRecordId: 'xfer-001',
  recipientUserId: 'user-042',
  title: 'Transfer Assigned',
  body: 'Project Alpha transfer has been assigned to you.',
  actionUrl: '/my-module/transfers/xfer-001',
  actionLabel: 'Review Transfer',
});
```

`send()` validates the `eventType` against the registry — unregistered events throw an error.

---

## 4. Consuming Hooks

### Badge Count (Header)

```typescript
import { useNotificationBadge } from '@hbc/notification-intelligence';

function MyHeader() {
  const { immediateUnreadCount, hasImmediateUnread } = useNotificationBadge();
  // Polls every 60 seconds; Immediate-tier only (D-03)
}
```

### Notification Center

```typescript
import { useNotificationCenter } from '@hbc/notification-intelligence';

function MyNotificationPanel() {
  const {
    items,
    totalCount,
    isLoading,
    hasNextPage,
    fetchNextPage,
    markRead,
    dismiss,
    markAllRead,
  } = useNotificationCenter({ tier: 'all', pageSize: 25 });
}
```

### User Preferences (Expert Mode)

```typescript
import { useNotificationPreferences } from '@hbc/notification-intelligence';

function MyPreferencesPanel() {
  const { preferences, updatePreferences, isUpdating } = useNotificationPreferences();
  // Optimistic update with rollback on error
}
```

---

## 5. Mounting Components

Wire the four notification components in your layout:

```typescript
import {
  HbcNotificationBadge,
  HbcNotificationCenter,
  HbcNotificationBanner,
  HbcNotificationPreferences,
} from '@hbc/notification-intelligence';

function AppLayout() {
  return (
    <>
      <header>
        <HbcNotificationBadge onClick={() => openPanel()} />
      </header>
      <HbcNotificationBanner
        notification={currentImmediate}
        onDismiss={handleDismiss}
      />
      {showCenter && <HbcNotificationCenter defaultFilter="all" />}
      {showPreferences && <HbcNotificationPreferences onSave={closePanel} />}
    </>
  );
}
```

All components are complexity-aware (D-08):
- **Essential mode:** All components return `null`
- **Standard mode:** Badge, Center, and Banner render; Preferences hidden
- **Expert mode:** All components render

---

## 6. Using Testing Factories

In your module's tests, use the canonical testing sub-path:

```typescript
import {
  createMockNotification,
  createMockNotificationPreferences,
  createMockNotificationRegistration,
  mockNotificationTiers,
  mockNotificationChannels,
} from '@hbc/notification-intelligence/testing';

describe('MyModuleNotifications', () => {
  it('renders notification card', () => {
    const notification = createMockNotification({
      eventType: 'mymodule.transfer.assigned',
      effectiveTier: 'immediate',
    });
    // ... test with mock notification
  });
});
```

---

## Architecture Boundaries

`@hbc/notification-intelligence` must **not** be imported by:
- `@hbc/auth-core`
- `@hbc/shell`
- `@hbc/shared-kernel`
- `@hbc/app-types`

It **may** be imported by all feature packages and the PWA/SPFx application layers.

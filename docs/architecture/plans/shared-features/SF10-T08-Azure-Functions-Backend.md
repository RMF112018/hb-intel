# SF10-T08 — Azure Functions Backend: Event Processor, Push, Email, Digest

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages) / PH8 Backend
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-01 (Azure Functions; Azure Notification Hubs; SendGrid; HbcNotifications SharePoint list), D-06 (Azure Timer Function for digest), D-07 (SPFx: email + in-app only)
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02 (contracts), T03 (registry — tier resolution uses defaultTier); Azure Functions infrastructure (PH8)

> **Doc Classification:** Canonical Normative Plan — SF10-T08 backend task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement the Azure Functions backend for notification intelligence: an HTTP-triggered queue writer (`SendNotification`), a Queue-triggered event processor (`ProcessNotification`), a Queue-triggered email sender (`SendNotificationEmail`), and a Timer-triggered digest aggregator (`SendDigestEmail`). Also implement the `GET /center` and preferences CRUD endpoints. All functions live in `backend/functions/src/functions/notifications/`.

---

## 3-Line Plan

1. Implement `SendNotification` (HTTP POST `/api/notifications/send`) — validates the payload and enqueues to `hbc-notifications-queue`; implement `GetCenter`, `MarkRead`, `Dismiss`, `MarkAllRead`, `GetPreferences`, `UpdatePreferences` CRUD endpoints against the `HbcNotifications` and `HbcNotificationPreferences` SharePoint lists.
2. Implement `ProcessNotification` (Queue trigger on `hbc-notifications-queue`) — resolves effective tier from registry defaults + user preferences, routes to push (Azure Notification Hubs), email (SendGrid immediate), and in-app (SharePoint list write) based on tier and user channel configuration.
3. Implement `SendNotificationEmail` (Queue trigger on `hbc-email-queue`) and `SendDigestEmail` (Timer trigger, per-user schedule from `INotificationPreferences`) via SendGrid.

---

## Directory Structure

```
backend/functions/src/functions/notifications/
├── SendNotification.ts          # HTTP: POST /api/notifications/send
├── GetCenter.ts                 # HTTP: GET /api/notifications/center
├── MarkRead.ts                  # HTTP: PATCH /api/notifications/{id}/read
├── Dismiss.ts                   # HTTP: PATCH /api/notifications/{id}/dismiss
├── MarkAllRead.ts               # HTTP: POST /api/notifications/mark-all-read
├── GetPreferences.ts            # HTTP: GET /api/notifications/preferences
├── UpdatePreferences.ts         # HTTP: PATCH /api/notifications/preferences
├── ProcessNotification.ts       # Queue trigger: hbc-notifications-queue
├── SendNotificationEmail.ts     # Queue trigger: hbc-email-queue
├── SendDigestEmail.ts           # Timer trigger: per-user digest schedule
└── lib/
    ├── notificationStore.ts     # SharePoint list CRUD helpers (HbcNotifications)
    ├── preferencesStore.ts      # SharePoint list CRUD helpers (HbcNotificationPreferences)
    ├── tierResolver.ts          # Resolves effective tier from defaults + user overrides
    ├── channelRouter.ts         # Routes delivery to push/email/in-app per tier + prefs
    ├── pushDelivery.ts          # Azure Notification Hubs integration
    └── emailDelivery.ts         # SendGrid integration
```

---

## SharePoint Lists

Two SharePoint lists are required per HB Intel site collection:

### `HbcNotifications`

| Column | Type | Description |
|--------|------|-------------|
| `Title` | Text | Notification title |
| `EventType` | Text | Registered event type key |
| `SourceModule` | Text | Source package name |
| `SourceRecordType` | Text | Record type in source module |
| `SourceRecordId` | Text | ID of the source record |
| `RecipientUserId` | Text | SharePoint user ID |
| `ComputedTier` | Choice | `immediate`, `watch`, `digest` |
| `UserTierOverride` | Choice | `immediate`, `watch`, `digest`, (empty) |
| `Body` | Note | Notification body |
| `ActionUrl` | Text | Deep link |
| `ActionLabel` | Text | CTA label |
| `ReadAt` | DateTime | Null until read |
| `DismissedAt` | DateTime | Null until dismissed |

### `HbcNotificationPreferences`

| Column | Type | Description |
|--------|------|-------------|
| `UserId` | Text | SharePoint user ID |
| `TierOverrides` | Note | JSON object: `Record<string, NotificationTier>` |
| `PushEnabled` | Boolean | Whether push is enabled |
| `DigestDay` | Number | Day of week (0–6) |
| `DigestHour` | Number | Hour (0–23) |

---

## `lib/tierResolver.ts`

```typescript
/**
 * Resolves the effective tier for a notification event.
 *
 * Phase 1 (D-09 static): effective tier = user override if set, else registry defaultTier.
 * Phase 2 (future): adaptive downshift based on response patterns.
 */

import type { INotificationRegistration, INotificationPreferences, NotificationTier } from '@hbc/notification-intelligence';

export function resolveEffectiveTier(
  registration: INotificationRegistration,
  preferences: INotificationPreferences | null
): NotificationTier {
  if (!preferences || !registration.tierOverridable) {
    return registration.defaultTier;
  }

  const override = preferences.tierOverrides[registration.eventType];
  return override ?? registration.defaultTier;
}
```

---

## `lib/channelRouter.ts`

```typescript
/**
 * Determines which delivery channels should fire for a given tier
 * and user preference set.
 *
 * D-01: Immediate → push + email + in-app
 * D-01: Watch    → in-app (+ daily digest email if opted in)
 * D-01: Digest   → in-app + digest-email
 * D-07: SPFx users never receive push (surface detection via context claim)
 */

import type { INotificationPreferences, NotificationChannel, NotificationTier } from '@hbc/notification-intelligence';

export function resolveChannels(
  tier: NotificationTier,
  preferences: INotificationPreferences | null,
  registeredChannels: NotificationChannel[],
  isSPFxContext: boolean
): NotificationChannel[] {
  const active: NotificationChannel[] = [];

  // Always write to in-app store
  if (registeredChannels.includes('in-app')) {
    active.push('in-app');
  }

  if (tier === 'immediate') {
    // Push: only if user has enabled it and surface supports it (D-07)
    if (
      registeredChannels.includes('push') &&
      preferences?.pushEnabled &&
      !isSPFxContext
    ) {
      active.push('push');
    }
    // Email: always for Immediate
    if (registeredChannels.includes('email')) {
      active.push('email');
    }
  }

  if (tier === 'digest') {
    if (registeredChannels.includes('digest-email')) {
      active.push('digest-email');
    }
  }

  return active;
}
```

---

## `SendNotification.ts` (HTTP Function)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { NotificationSendPayload } from '@hbc/notification-intelligence';

app.http('SendNotification', {
  methods: ['POST'],
  route: 'notifications/send',
  authLevel: 'anonymous', // Auth handled by Azure AD middleware
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const payload = await req.json() as NotificationSendPayload;

    if (!payload.eventType || !payload.recipientUserId) {
      return { status: 400, body: 'Missing required fields: eventType, recipientUserId' };
    }

    // Enqueue for async processing by ProcessNotification
    context.extraOutputs.set('notificationQueue', JSON.stringify(payload));

    return { status: 202, body: 'Notification queued.' };
  },
  extraOutputs: [{
    type: 'storageQueue',
    queueName: 'hbc-notifications-queue',
    connection: 'AzureWebJobsStorage',
    name: 'notificationQueue',
  }],
});
```

---

## `ProcessNotification.ts` (Queue Trigger)

```typescript
import { app, StorageQueueTrigger, InvocationContext } from '@azure/functions';
import type { NotificationSendPayload } from '@hbc/notification-intelligence';
import { resolveEffectiveTier } from './lib/tierResolver';
import { resolveChannels } from './lib/channelRouter';
import { notificationStore } from './lib/notificationStore';
import { preferencesStore } from './lib/preferencesStore';
import { pushDelivery } from './lib/pushDelivery';

app.storageQueue('ProcessNotification', {
  queueName: 'hbc-notifications-queue',
  connection: 'AzureWebJobsStorage',
  handler: async (message: unknown, context: InvocationContext): Promise<void> => {
    const payload = JSON.parse(message as string) as NotificationSendPayload;

    // 1. Resolve tier from registry + user preferences
    const prefs = await preferencesStore.get(payload.recipientUserId);
    // Registration lookup is done here — registry must be initialized
    // before this function runs (ensured by module-level import of @hbc/notification-intelligence)
    const { NotificationRegistry } = await import('@hbc/notification-intelligence');
    const registration = NotificationRegistry.getByEventType(payload.eventType);

    if (!registration) {
      context.warn(`ProcessNotification: unregistered eventType "${payload.eventType}" — skipping.`);
      return;
    }

    const effectiveTier = resolveEffectiveTier(registration, prefs);
    const channels = resolveChannels(effectiveTier, prefs, registration.channels, false);

    // 2. Write to in-app store (SharePoint HbcNotifications list)
    if (channels.includes('in-app')) {
      await notificationStore.create({
        ...payload,
        computedTier: effectiveTier,
        userTierOverride: prefs?.tierOverrides[payload.eventType] ?? null,
        effectiveTier,
        readAt: null,
        dismissedAt: null,
      });
    }

    // 3. Push notification (Azure Notification Hubs)
    if (channels.includes('push')) {
      await pushDelivery.send({
        userId: payload.recipientUserId,
        title: payload.title,
        body: payload.body,
        data: { actionUrl: payload.actionUrl },
      });
    }

    // 4. Immediate email — enqueue to email queue
    if (channels.includes('email')) {
      context.extraOutputs.set('emailQueue', JSON.stringify({
        type: 'immediate',
        recipientUserId: payload.recipientUserId,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
        actionLabel: payload.actionLabel,
      }));
    }

    // Digest items are collected by SendDigestEmail timer function — no immediate action needed
  },
  extraOutputs: [{
    type: 'storageQueue',
    queueName: 'hbc-email-queue',
    connection: 'AzureWebJobsStorage',
    name: 'emailQueue',
  }],
});
```

---

## `SendDigestEmail.ts` (Timer Function)

```typescript
/**
 * SendDigestEmail — Timer trigger.
 * Runs every hour; for each user whose digestDay/digestHour matches
 * the current UTC-adjusted local time, queries their unread Digest items
 * and sends a SendGrid digest email.
 */
import { app, Timer, InvocationContext } from '@azure/functions';
import { preferencesStore } from './lib/preferencesStore';
import { notificationStore } from './lib/notificationStore';
import { emailDelivery } from './lib/emailDelivery';

app.timer('SendDigestEmail', {
  schedule: '0 0 * * * *', // Top of every hour
  handler: async (timer: Timer, context: InvocationContext): Promise<void> => {
    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentHour = now.getUTCHours();

    // Find users whose digest is due this hour
    const dueUsers = await preferencesStore.getUsersWithDigestDue(
      currentDay,
      currentHour
    );

    for (const prefs of dueUsers) {
      const digestItems = await notificationStore.getUnreadDigestItems(
        prefs.userId
      );
      if (digestItems.length === 0) continue;

      await emailDelivery.sendDigest({
        recipientUserId: prefs.userId,
        items: digestItems,
      });

      await notificationStore.markDigestSent(
        prefs.userId,
        digestItems.map((i) => i.id)
      );
    }

    context.log(`SendDigestEmail: processed ${dueUsers.length} user(s).`);
  },
});
```

---

## Verification Commands

```bash
# Build backend functions
pnpm --filter @hbc/azure-functions build

# Type-check backend
pnpm --filter @hbc/azure-functions check-types

# Confirm notification function files exist
ls backend/functions/src/functions/notifications/*.ts
# Expected: all 10 function files listed

# Confirm lib helpers exist
ls backend/functions/src/functions/notifications/lib/*.ts
# Expected: 6 lib files listed

# Run backend unit tests (written in T09)
pnpm --filter @hbc/azure-functions test

# Local simulation: confirm SendNotification endpoint accepts a test payload
# (requires Azure Functions Core Tools v4)
func start --port 7071 &
curl -X POST http://localhost:7071/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"eventType":"bic.transfer","sourceModule":"bic-next-move","sourceRecordType":"scorecard","sourceRecordId":"1","recipientUserId":"user-1","title":"Test","body":"Test body","actionUrl":"/test"}'
# Expected: 202 Accepted
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T08 completed: 2026-03-10
- Created 17 new files: 10 function files + 1 barrel + 6 lib helpers
- Functions: SendNotification (HTTP POST), GetCenter (HTTP GET), MarkRead (HTTP PATCH),
  Dismiss (HTTP PATCH), MarkAllRead (HTTP POST), GetPreferences (HTTP GET),
  UpdatePreferences (HTTP PATCH), ProcessNotification (queue trigger),
  SendNotificationEmail (queue trigger), SendDigestEmail (timer trigger)
- Lib helpers: tierResolver, channelRouter, notificationStore, preferencesStore,
  pushDelivery (stub), emailDelivery (stub)
- SDK adaptation: Used output.storageQueue() binding objects instead of inline extraOutputs
  with string keys (plan code used pre-v4 SDK patterns)
- Added @hbc/notification-intelligence workspace dependency to @hbc/functions
- Fixed notification-intelligence barrel imports for Node16 moduleResolution compatibility
  (added .js extensions to all barrel re-exports)
- Override paths: {} in functions tsconfig.json to use node_modules resolution
  instead of source paths (Node16 compatibility)
- Verification: check-types zero errors; build zero errors; existing tests unaffected
  (pre-existing validateToken.test.ts failure is separate)
Next: SF10-T09 (Testing Strategy and Deployment)
-->

# PH7-SF-10: `@hbc/notification-intelligence` — Priority-Tiered Smart Notification System

**Priority Tier:** 2 — Application Layer (required before any module sends notifications)
**Package:** `packages/notification-intelligence/`
**Interview Decision:** Q18 — Option B confirmed
**Mold Breaker Source:** UX-MB §9 (Notification Intelligence); ux-mold-breaker.md Signature Solution #9; con-tech-ux-study §13 (Notification management as a platform weakness)

---

## Problem Solved

Construction management platforms are universally criticized for notification fatigue: every activity generates an email, every status change generates an alert, and users disable all notifications within weeks because the signal-to-noise ratio is too low. The con-tech UX study §13 documents this as a consistent pain point across all seven evaluated platforms — Procore's notification volume is cited as "overwhelming" by experienced users.

HB Intel's answer is not fewer notifications but **smarter prioritization**. Every notification event is classified into one of three tiers:

- **Immediate**: Requires action within 24 hours (BIC transfers, overdue items, blocked workflows)
- **Watch**: Situation-awareness without urgency (record updates by others, upcoming milestones)
- **Digest**: Weekly roll-up of informational items (import completions, version creations, coaching tips)

This classification is computed by the platform — not by the user configuring 47 individual toggles — and it adapts over time based on the user's actual response patterns (an item the user always ignores eventually downshifts to Digest).

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #9 (Notification Intelligence) specifies: "Priority tiers replace per-event toggles. The system learns from user behavior." Operating Principle §7.5 (Signal over noise) states: "Every notification is evaluated for urgency before delivery; low-value interruptions are batched."

The con-tech UX study §13 explicitly recommends adaptive notification systems as the #1 platform improvement opportunity. No current construction platform implements tiered adaptive notifications — all use the same broadcast model. `@hbc/notification-intelligence` is the first attempt to apply UX-intelligence principles from consumer software (Gmail Priority Inbox, iOS Focus Modes) to construction management.

---

## Three-Tier Notification Model

| Tier | Delivery | Examples | Adaptivity |
|---|---|---|---|
| **Immediate** | Push notification (PWA) + email + in-app banner | BIC transfer to you, overdue item, handoff received, acknowledgment required | Tier cannot be downgraded by user; can be snoozed |
| **Watch** | In-app notification center + daily digest email (opt-in) | Record updated by colleague, upcoming milestone in 3 days, annotation responded to | User can promote to Immediate or demote to Digest |
| **Digest** | Weekly digest email + notification center archive | Import completed, version snapshot created, coaching tip, low-urgency system events | User can promote to Watch |

---

## Interface Contract

```typescript
// packages/notification-intelligence/src/types/INotification.ts

export type NotificationTier = 'immediate' | 'watch' | 'digest';
export type NotificationChannel = 'push' | 'email' | 'in-app' | 'digest-email';

export interface INotificationEvent {
  eventType: string;           // e.g., 'bic.transfer', 'handoff.received', 'record.overdue'
  sourceModule: string;
  sourceRecordType: string;
  sourceRecordId: string;
  recipientUserId: string;
  /** System-computed tier */
  computedTier: NotificationTier;
  /** User-adjusted tier override (null = use computed) */
  userTierOverride?: NotificationTier;
  title: string;
  body: string;
  /** Deep link to the relevant record/action */
  actionUrl: string;
  /** CTA label for the action link */
  actionLabel?: string;
  createdAt: string; // ISO 8601
  readAt: string | null;
  dismissedAt: string | null;
}

export interface INotificationRegistration {
  /** Event type being registered */
  eventType: string;
  /** Default tier assignment */
  defaultTier: NotificationTier;
  /** Human-readable description (shown in notification preferences) */
  description: string;
  /** Whether users can override the tier */
  tierOverridable: boolean;
  /** Channels included in this event type */
  channels: NotificationChannel[];
}

export interface INotificationPreferences {
  userId: string;
  /** Per-event-type tier overrides */
  tierOverrides: Record<string, NotificationTier>;
  /** Whether push notifications are enabled */
  pushEnabled: boolean;
  /** Digest email: which day of week (0=Sun) */
  digestDay: number;
  /** Digest email: time of day (hour, 0-23) */
  digestHour: number;
}
```

---

## Package Architecture

```
packages/notification-intelligence/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── INotification.ts
│   │   └── index.ts
│   ├── registry/
│   │   └── NotificationRegistry.ts       # all modules register event types here
│   ├── api/
│   │   ├── NotificationApi.ts            # send, read, dismiss, get center items
│   │   └── PreferencesApi.ts             # get/update user preferences
│   ├── hooks/
│   │   ├── useNotificationCenter.ts      # in-app notification center items
│   │   ├── useNotificationPreferences.ts # get/update user preferences
│   │   └── useNotificationBadge.ts       # unread count for header badge
│   └── components/
│       ├── HbcNotificationCenter.tsx     # full notification center panel
│       ├── HbcNotificationBadge.tsx      # header badge with unread count
│       ├── HbcNotificationBanner.tsx     # in-page Immediate-tier banner
│       ├── HbcNotificationPreferences.tsx # user preference panel
│       └── index.ts
```

---

## Component Specifications

### `HbcNotificationCenter` — In-App Notification Panel

```typescript
interface HbcNotificationCenterProps {
  defaultFilter?: NotificationTier | 'all';
  maxItems?: number;
}
```

**Visual behavior:**
- Tab bar: All | Immediate | Watch | Digest
- Each notification card: tier badge, source module icon, title, body, relative timestamp, action CTA, mark-read/dismiss controls
- Immediate items shown with red left border; Watch with amber; Digest with grey
- "Mark all as read" CTA per tab
- Infinite scroll / load more

### `HbcNotificationBadge` — Header Unread Count

```typescript
interface HbcNotificationBadgeProps {
  onClick?: () => void;
}
```

**Visual behavior:**
- Bell icon with count badge
- Count shows Immediate-only unread count (not total — avoiding notification fatigue irony)
- Red badge for Immediate; grey for Watch-only

### `HbcNotificationBanner` — Immediate-Tier In-Page Alert

```typescript
interface HbcNotificationBannerProps {
  notification: INotificationEvent;
  onDismiss: () => void;
}
```

**Visual behavior:**
- Dismissible banner at top of page viewport
- Title, short body, action CTA button
- Auto-dismisses after 30 seconds if not interacted with
- Maximum 1 banner visible at a time (queue manages overflow)

### `HbcNotificationPreferences` — User Preference Panel

```typescript
interface HbcNotificationPreferencesProps {
  onSave?: () => void;
}
```

**Visual behavior:**
- List of all registered event types grouped by module
- For each: description, current tier, override selector (if `tierOverridable`)
- Digest settings: day-of-week picker, time-of-day picker
- Push notification toggle with browser permission request

---

## Notification Registration Pattern

Every package in the platform registers its event types with the `NotificationRegistry` at startup:

```typescript
// In @hbc/bic-next-move package initialization
import { NotificationRegistry } from '@hbc/notification-intelligence';

NotificationRegistry.register([
  {
    eventType: 'bic.transfer',
    defaultTier: 'immediate',
    description: 'You have been assigned ownership of an item (Ball In Court)',
    tierOverridable: false, // accountability primitive — cannot downgrade
    channels: ['push', 'email', 'in-app'],
  },
  {
    eventType: 'bic.overdue',
    defaultTier: 'immediate',
    description: 'An item assigned to you is overdue',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },
]);
```

```typescript
// In @hbc/versioned-record package initialization
NotificationRegistry.register([
  {
    eventType: 'version.created',
    defaultTier: 'digest',
    description: 'A new version of a record you follow was created',
    tierOverridable: true,
    channels: ['digest-email', 'in-app'],
  },
]);
```

---

## Sending a Notification

Any package sends notifications via `NotificationApi`:

```typescript
import { NotificationApi } from '@hbc/notification-intelligence';

await NotificationApi.send({
  eventType: 'bic.transfer',
  sourceModule: 'business-development',
  sourceRecordType: 'bd-scorecard',
  sourceRecordId: scorecard.id,
  recipientUserId: newOwner.userId,
  title: 'Go/No-Go Scorecard — Action Required',
  body: `${previousOwner.displayName} has submitted the ${scorecard.projectName} scorecard for your review.`,
  actionUrl: `/bd/scorecards/${scorecard.id}`,
  actionLabel: 'Review Scorecard',
});
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | BIC transfers and overdue events → Immediate; escalation → Immediate to escalation owner |
| `@hbc/acknowledgment` | Acknowledgment request → Immediate; completion → Watch |
| `@hbc/workflow-handoff` | Handoff sent → Immediate to recipient; acknowledged → Watch to sender |
| `@hbc/field-annotations` | New annotation → Immediate to assignee; resolution → Watch |
| `@hbc/versioned-record` | New version → Digest |
| `@hbc/data-seeding` | Import complete → Digest |
| `@hbc/sharepoint-docs` | Upload failure → Watch; migration complete → Digest |
| `@hbc/complexity` | Preferences panel (Expert mode); badge visible in all tiers; banner in Immediate only |
| PH9b My Work Feed (§A) | Immediate-tier notifications are the highest-priority feed items |

---

## Backend Architecture

Notifications are processed by an Azure Functions event processor:
- **Trigger**: Queue message from any HB Intel package
- **Processing**: Tier computation, preference lookup, channel routing
- **Delivery**: Push (via Azure Notification Hubs), Email (via SendGrid), In-app (via SharePoint list `HbcNotifications`)
- **Digest**: Azure Timer Function runs on user's preferred digest schedule

---

## SPFx Constraints

- `HbcNotificationBadge` and `HbcNotificationCenter` are SPFx-compatible via Application Customizer
- Push notifications require PWA service worker — not available in SPFx context; SPFx users receive email + in-app only
- Notification API calls route through Azure Functions backend

---

## Priority & ROI

**Priority:** P1 — Every other module's notification integration depends on this package; without it, all notifications default to email blasts with no intelligence
**Estimated build effort:** 5–6 sprint-weeks (registry, four components, Azure Functions event processor, push integration, digest scheduler)
**ROI:** Solves the #1 user complaint about construction platforms (notification fatigue); maintains accountability without overwhelming users; adaptive tier system improves over time without user configuration effort

---

## Definition of Done

- [ ] `INotificationRegistration` registry defined; all packages can register event types
- [ ] `NotificationRegistry.register()` available at package initialization
- [ ] `NotificationApi.send()` routes to Azure Functions queue processor
- [ ] Azure Functions: tier computation, preference lookup, channel routing
- [ ] Push delivery via Azure Notification Hubs (PWA service worker integration)
- [ ] Email delivery via SendGrid (Immediate + Watch daily summary + Digest weekly)
- [ ] In-app storage: `HbcNotifications` SharePoint list
- [ ] `useNotificationCenter` loads paginated notifications with tier filtering
- [ ] `useNotificationBadge` returns Immediate unread count with real-time update
- [ ] `useNotificationPreferences` gets/sets user preferences
- [ ] `HbcNotificationCenter` renders all tiers with tab filtering
- [ ] `HbcNotificationBadge` renders in app header with correct unread count
- [ ] `HbcNotificationBanner` renders Immediate-tier banners with queue management
- [ ] `HbcNotificationPreferences` renders event type list with tier overrides
- [ ] `@hbc/complexity` integration: full preferences in Expert, badge+banner in all tiers
- [ ] Unit tests ≥95% on tier computation and delivery routing logic
- [ ] E2E test: BIC transfer event → Immediate notification delivered → in-app center shows item

---

## ADR Reference

Create `docs/architecture/adr/0019-notification-intelligence-tiered-model.md` documenting the three-tier model rationale, the registry pattern for cross-package event registration, the adaptive tier computation strategy, and the Azure Notification Hubs + SendGrid delivery architecture.

# SF10-T02 — TypeScript Contracts: `@hbc/notification-intelligence`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-02 (three-tier model), D-03 (badge count semantics), D-04 (banner behavior), D-05 (registry pattern), D-06 (digest schedule), D-09 (Phase 1 static tiers)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01 (scaffold in place)

> **Doc Classification:** Canonical Normative Plan — SF10-T02 types task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement `src/types/INotification.ts` — the complete TypeScript contract for the notification intelligence package. All other tasks consume these types directly. No runtime code; types only.

---

## 3-Line Plan

1. Write `INotification.ts` with `NotificationTier`, `NotificationChannel`, `INotificationEvent`, `INotificationRegistration`, `INotificationPreferences`, and the `NotificationSendPayload` input type.
2. Export all from `src/types/index.ts`.
3. Run type-check — zero errors; confirm all consuming barrels (stubs from T01) resolve cleanly.

---

## `src/types/INotification.ts`

```typescript
/**
 * @hbc/notification-intelligence — Core TypeScript Contracts
 * SF10-T02 — D-02: Three-tier model; D-05: Registry pattern; D-06: Digest schedule
 *
 * @see docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md
 * @see docs/architecture/adr/0096-notification-intelligence-tiered-model.md
 */

// ─── Primitive Union Types ────────────────────────────────────────────────────

/**
 * The three priority tiers of the HB Intel notification system.
 *
 * - `immediate`: Requires action within 24 hours. Push + email + in-app.
 *   Non-downgradable by users for event types where `tierOverridable: false`.
 * - `watch`: Situation awareness without urgency. In-app + optional daily digest.
 *   Users may promote to Immediate or demote to Digest.
 * - `digest`: Weekly roll-up of informational items. Digest email + in-app archive.
 *   Users may promote to Watch.
 */
export type NotificationTier = 'immediate' | 'watch' | 'digest';

/**
 * Delivery channels available for notification events.
 *
 * - `push`: PWA service worker push notification (unavailable in SPFx — D-07)
 * - `email`: Direct email via SendGrid (Immediate events)
 * - `in-app`: `HbcNotifications` SharePoint list item (all tiers)
 * - `digest-email`: Weekly digest email via SendGrid (Digest events)
 */
export type NotificationChannel = 'push' | 'email' | 'in-app' | 'digest-email';

// ─── Notification Event ────────────────────────────────────────────────────────

/**
 * A persisted notification event in the `HbcNotifications` SharePoint list.
 * Returned by `NotificationApi.getCenter()` and `useNotificationCenter`.
 */
export interface INotificationEvent {
  /** Unique notification ID (SharePoint list item ID as string) */
  id: string;
  /** Registered event type key, e.g. 'bic.transfer', 'handoff.received' */
  eventType: string;
  /** Source package / module name */
  sourceModule: string;
  /** Record type within the source module */
  sourceRecordType: string;
  /** ID of the source record */
  sourceRecordId: string;
  /** SharePoint user ID of the recipient */
  recipientUserId: string;
  /**
   * Platform-computed tier for this event.
   * Set by the Azure Functions event processor at dispatch time.
   */
  computedTier: NotificationTier;
  /**
   * User-overridden tier (null = use computedTier).
   * Only applicable when INotificationRegistration.tierOverridable is true.
   */
  userTierOverride: NotificationTier | null;
  /**
   * Effective tier: userTierOverride if set, otherwise computedTier.
   * Read-only — computed by the API layer; not stored separately.
   */
  effectiveTier: NotificationTier;
  /** Display title shown in the notification center */
  title: string;
  /** Display body / description */
  body: string;
  /** Deep link to the relevant record or action */
  actionUrl: string;
  /** CTA button label. Defaults to 'View' if not provided. */
  actionLabel: string;
  /** ISO 8601 timestamp when the notification was created */
  createdAt: string;
  /** ISO 8601 timestamp when the user marked the notification read; null if unread */
  readAt: string | null;
  /** ISO 8601 timestamp when the user dismissed the notification; null if not dismissed */
  dismissedAt: string | null;
}

// ─── Notification Registration ─────────────────────────────────────────────────

/**
 * Registration record for a notification event type.
 * Packages call NotificationRegistry.register([]) at initialization time.
 */
export interface INotificationRegistration {
  /** Unique event type key, namespaced by module. E.g. 'bic.transfer' */
  eventType: string;
  /** Default tier assigned by the platform when no user override exists */
  defaultTier: NotificationTier;
  /** Human-readable description shown in HbcNotificationPreferences */
  description: string;
  /**
   * Whether users can override the tier for this event type.
   * Set to false for accountability primitives (e.g., BIC transfer) that
   * must always be Immediate.
   */
  tierOverridable: boolean;
  /** Delivery channels enabled for this event type by default */
  channels: NotificationChannel[];
}

// ─── User Preferences ─────────────────────────────────────────────────────────

/**
 * Per-user notification preferences stored in the `HbcNotificationPreferences`
 * SharePoint list (one row per user). Managed by PreferencesApi.
 */
export interface INotificationPreferences {
  /** SharePoint user ID */
  userId: string;
  /**
   * Per-event-type tier overrides.
   * Key: eventType; Value: user-selected tier.
   * Only entries for event types where tierOverridable: true are honoured.
   */
  tierOverrides: Record<string, NotificationTier>;
  /** Whether push notifications are enabled for this user (PWA only — D-07) */
  pushEnabled: boolean;
  /**
   * Digest email delivery day of week (0 = Sunday, 6 = Saturday).
   * Default: 0 (Sunday).
   */
  digestDay: number;
  /**
   * Digest email delivery hour (0–23, local time).
   * Default: 8 (08:00).
   */
  digestHour: number;
}

// ─── API Input Types ───────────────────────────────────────────────────────────

/**
 * Input payload for NotificationApi.send().
 * The computedTier is resolved by the Azure Functions event processor
 * from the registry defaults + user preferences — callers do not set it.
 */
export interface NotificationSendPayload {
  eventType: string;
  sourceModule: string;
  sourceRecordType: string;
  sourceRecordId: string;
  recipientUserId: string;
  title: string;
  body: string;
  actionUrl: string;
  actionLabel?: string;
}

/**
 * Result shape returned by NotificationApi.getCenter().
 */
export interface INotificationCenterResult {
  items: INotificationEvent[];
  /** Total count across all tiers (for badge and pagination) */
  totalCount: number;
  /** Count of unread Immediate-tier items */
  immediateUnreadCount: number;
  /** Whether more items exist beyond the current page */
  hasMore: boolean;
  /** Cursor token for the next page */
  nextCursor: string | null;
}

/**
 * Filter options for the notification center query.
 */
export interface INotificationCenterFilter {
  tier?: NotificationTier | 'all';
  unreadOnly?: boolean;
  cursor?: string;
  pageSize?: number;
}
```

---

## Verification Commands

```bash
# Type-check the package with the new types file in place
pnpm --filter @hbc/notification-intelligence check-types
# Expected: zero TypeScript errors

# Confirm the types barrel re-exports correctly
node -e "
const { execSync } = require('child_process');
execSync('pnpm --filter @hbc/notification-intelligence build', { stdio: 'inherit' });
"
# Expected: build succeeds

# Confirm all type names are exported from the dist
grep -l "NotificationTier\|INotificationEvent\|INotificationRegistration" \
  packages/notification-intelligence/dist/types/INotification.d.ts
# Expected: file path returned (file exists and contains type declarations)
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T02 not yet started.
Next: SF10-T03 (NotificationRegistry)
-->

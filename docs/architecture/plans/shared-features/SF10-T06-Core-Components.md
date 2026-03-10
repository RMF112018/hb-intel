# SF10-T06 — Core Components: `HbcNotificationCenter` + `HbcNotificationBadge`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-02 (tier visual conventions), D-03 (badge count semantics), D-07 (SPFx Application Customizer compatibility), D-08 (complexity rendering: Standard/Expert)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T05 (hooks), `@hbc/ui-kit`, `@hbc/complexity`

> **Doc Classification:** Canonical Normative Plan — SF10-T06 components task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement `HbcNotificationCenter` (the full notification panel with tab-filtered view) and `HbcNotificationBadge` (the header bell icon with Immediate unread count). Both are rendered in Standard and Expert complexity modes; the badge is also SPFx-compatible via Application Customizer.

---

## 3-Line Plan

1. Implement `HbcNotificationBadge` — bell icon from `@hbc/ui-kit/icons`, Immediate unread count from `useNotificationBadge`; red badge (Immediate) vs grey (Watch-only) per D-03.
2. Implement `HbcNotificationCenter` — tab bar (All / Immediate / Watch / Digest), infinite-scroll item list, notification cards with tier border, action CTA, mark-read and dismiss controls.
3. Guard both components with `@hbc/complexity` (Standard/Expert only); write RTL unit tests.

---

## `src/components/HbcNotificationBadge.tsx`

```typescript
/**
 * HbcNotificationBadge — SF10-T06
 *
 * Header bell icon with Immediate unread count badge.
 * Rendered in Standard and Expert complexity modes.
 * SPFx-compatible: uses only UI Kit app-shell exports (D-07).
 *
 * D-03: Shows Immediate-only unread count (not total).
 *       Red badge when immediateUnread > 0; grey when Watch-only unread.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { BellIcon } from '@hbc/ui-kit/icons';
import { useNotificationBadge } from '../hooks/useNotificationBadge';
import type { INotificationEvent } from '../types/INotification';

export interface HbcNotificationBadgeProps {
  /** Click handler — typically opens the notification center panel */
  onClick?: () => void;
}

export function HbcNotificationBadge({ onClick }: HbcNotificationBadgeProps) {
  const { tier } = useComplexity();
  const { immediateUnreadCount, hasImmediateUnread } = useNotificationBadge();

  // D-08: Badge rendered in Standard and Expert only
  if (tier === 'essential') return null;

  const badgeColor = hasImmediateUnread ? 'badge--red' : 'badge--grey';
  const showBadge = immediateUnreadCount > 0;

  return (
    <button
      type="button"
      className="hbc-notification-badge"
      aria-label={
        immediateUnreadCount > 0
          ? `${immediateUnreadCount} unread notifications requiring attention`
          : 'Notifications'
      }
      onClick={onClick}
    >
      <BellIcon size={20} />
      {showBadge && (
        <span
          className={`hbc-notification-badge__count ${badgeColor}`}
          aria-hidden="true"
        >
          {immediateUnreadCount > 99 ? '99+' : immediateUnreadCount}
        </span>
      )}
    </button>
  );
}
```

---

## `src/components/HbcNotificationCenter.tsx`

```typescript
/**
 * HbcNotificationCenter — SF10-T06
 *
 * Full notification center panel with tier tab filtering,
 * infinite scroll, and per-item controls.
 *
 * D-02: Tier visual conventions:
 *   Immediate — red left border
 *   Watch     — amber left border
 *   Digest    — grey left border
 * D-08: Rendered in Standard and Expert complexity modes.
 */

import React, { useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useNotificationCenter } from '../hooks/useNotificationCenter';
import type { INotificationEvent, NotificationTier } from '../types/INotification';

export interface HbcNotificationCenterProps {
  /** Initial tab selection. Defaults to 'all'. */
  defaultFilter?: NotificationTier | 'all';
  /** Maximum items per page. Defaults to 25. */
  maxItems?: number;
}

const TIER_TABS: Array<{ key: NotificationTier | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'immediate', label: 'Immediate' },
  { key: 'watch', label: 'Watch' },
  { key: 'digest', label: 'Digest' },
];

const TIER_BORDER_CLASS: Record<NotificationTier, string> = {
  immediate: 'notification-card--immediate',
  watch: 'notification-card--watch',
  digest: 'notification-card--digest',
};

export function HbcNotificationCenter({
  defaultFilter = 'all',
  maxItems = 25,
}: HbcNotificationCenterProps) {
  const { tier } = useComplexity();
  const [activeTab, setActiveTab] = useState<NotificationTier | 'all'>(
    defaultFilter
  );

  const {
    items,
    totalCount,
    immediateUnreadCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    markRead,
    dismiss,
    markAllRead,
  } = useNotificationCenter({
    tier: activeTab,
    pageSize: maxItems,
  });

  // D-08: Not rendered in Essential
  if (tier === 'essential') return null;

  return (
    <div className="hbc-notification-center" role="region" aria-label="Notifications">
      {/* Tab bar */}
      <div className="hbc-notification-center__tabs" role="tablist">
        {TIER_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`hbc-tab ${activeTab === tab.key ? 'hbc-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === 'immediate' && immediateUnreadCount > 0 && (
              <span className="hbc-tab__badge">{immediateUnreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Mark all as read CTA */}
      {items.some((n) => !n.readAt) && (
        <div className="hbc-notification-center__actions">
          <button
            type="button"
            className="hbc-link-button"
            onClick={() => markAllRead(activeTab)}
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification list */}
      <div className="hbc-notification-center__list" role="tabpanel">
        {isLoading && (
          <div className="hbc-notification-center__loading" aria-live="polite">
            Loading notifications…
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="hbc-notification-center__empty">
            No notifications in this category.
          </div>
        )}

        {items.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkRead={() => markRead(notification.id)}
            onDismiss={() => dismiss(notification.id)}
          />
        ))}

        {hasNextPage && (
          <button
            type="button"
            className="hbc-notification-center__load-more"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── NotificationCard (internal) ─────────────────────────────────────────────

interface NotificationCardProps {
  notification: INotificationEvent;
  onMarkRead: () => void;
  onDismiss: () => void;
}

function NotificationCard({
  notification,
  onMarkRead,
  onDismiss,
}: NotificationCardProps) {
  const tierClass = TIER_BORDER_CLASS[notification.effectiveTier];
  const isUnread = !notification.readAt;

  return (
    <article
      className={`notification-card ${tierClass} ${isUnread ? 'notification-card--unread' : ''}`}
      aria-label={notification.title}
    >
      <div className="notification-card__content">
        <p className="notification-card__title">{notification.title}</p>
        <p className="notification-card__body">{notification.body}</p>
        <time
          className="notification-card__time"
          dateTime={notification.createdAt}
        >
          {formatRelativeTime(notification.createdAt)}
        </time>
      </div>

      <div className="notification-card__actions">
        <a
          href={notification.actionUrl}
          className="hbc-button hbc-button--sm"
          onClick={onMarkRead}
        >
          {notification.actionLabel}
        </a>
        {isUnread && (
          <button
            type="button"
            className="hbc-icon-button"
            aria-label="Mark as read"
            onClick={onMarkRead}
          >
            ✓
          </button>
        )}
        <button
          type="button"
          className="hbc-icon-button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          ✕
        </button>
      </div>
    </article>
  );
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

---

## Tier Visual Conventions (CSS reference)

```css
/* Tier left-border colors — D-02 */
.notification-card--immediate { border-left: 3px solid var(--hbc-color-danger-500); }
.notification-card--watch     { border-left: 3px solid var(--hbc-color-warning-400); }
.notification-card--digest    { border-left: 3px solid var(--hbc-color-neutral-300); }

/* Badge colors — D-03 */
.hbc-notification-badge__count.badge--red  { background-color: var(--hbc-color-danger-500); }
.hbc-notification-badge__count.badge--grey { background-color: var(--hbc-color-neutral-400); }
```

---

## Verification Commands

```bash
# Type-check all components
pnpm --filter @hbc/notification-intelligence check-types

# Run component unit tests (written in T09)
pnpm --filter @hbc/notification-intelligence test

# Confirm components are exported from the package barrel
node -e "
const pkg = require('./packages/notification-intelligence/dist/index.js');
['HbcNotificationCenter','HbcNotificationBadge']
  .forEach(k => console.log(k + ':', typeof pkg[k]));
"
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T06 completed: 2026-03-10
- HbcNotificationBadge: Bell icon (Notifications from @hbc/ui-kit/icons, size="md"), Immediate unread count badge, red/grey color, 99+ cap, D-08 essential guard.
- HbcNotificationCenter: 4-tab bar (All/Immediate/Watch/Digest), tier border classes (D-02), mark-read/dismiss/mark-all-read controls, loading/empty states, load-more pagination, internal NotificationCard + formatRelativeTime.
- Icon adaptation: Notifications replaces BellIcon (plan specified BellIcon but actual export is Notifications); size="md" replaces size={20} (prop accepts string union, not number).
- @hbc/ui-kit/icons alias added to vitest.config.ts resolve.alias.
- @testing-library/jest-dom added to devDependencies and test-setup.ts.
- 21 new component tests (9 badge + 12 center); all 40 package tests pass.
- Barrel (src/components/index.ts) already correct from T01 — no edit needed.
- check-types: zero errors. build: zero errors.
Next: SF10-T07 (Interaction Components — HbcNotificationBanner + HbcNotificationPreferences)
-->

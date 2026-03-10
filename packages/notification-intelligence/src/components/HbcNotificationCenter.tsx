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

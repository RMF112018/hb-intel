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
import { Notifications } from '@hbc/ui-kit/icons';
import { useNotificationBadge } from '../hooks/useNotificationBadge';

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
      <Notifications size="md" />
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

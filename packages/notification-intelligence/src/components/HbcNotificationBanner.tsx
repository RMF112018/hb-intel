/**
 * HbcNotificationBanner — SF10-T07
 *
 * Immediate-tier dismissible in-page alert.
 *
 * D-04 (Banner behavior):
 *   - Immediate tier only
 *   - Auto-dismisses after 30 seconds if not interacted with
 *   - Maximum 1 banner visible at a time; overflow queued
 *   - Clicking the action CTA or dismiss button cancels auto-dismiss
 *
 * D-08: Rendered in Standard and Expert complexity modes.
 *
 * The parent component is responsible for passing the queue of Immediate
 * notifications. HbcNotificationBanner renders only the first item and
 * notifies the parent when it should advance to the next.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useComplexity } from '@hbc/complexity';
import type { INotificationEvent } from '../types/INotification';

const AUTO_DISMISS_MS = 30_000; // D-04: 30 seconds

export interface HbcNotificationBannerProps {
  /** The current notification to display. Pass null/undefined to hide banner. */
  notification: INotificationEvent | null | undefined;
  /** Called when the banner is dismissed (user action or auto-dismiss) */
  onDismiss: (notificationId: string) => void;
}

export function HbcNotificationBanner({
  notification,
  onDismiss,
}: HbcNotificationBannerProps) {
  const { tier } = useComplexity();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    clearTimer();
    if (notification) {
      onDismiss(notification.id);
    }
  }, [notification, onDismiss, clearTimer]);

  // Start / restart auto-dismiss timer when notification changes
  useEffect(() => {
    if (!notification) return;

    clearTimer();
    timerRef.current = setTimeout(handleDismiss, AUTO_DISMISS_MS);

    return clearTimer;
  }, [notification?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // D-08: Not rendered in Essential
  if (tier === 'essential') return null;

  // D-04: Immediate tier only
  if (!notification || notification.effectiveTier !== 'immediate') return null;

  return (
    <div
      className="hbc-notification-banner hbc-notification-banner--immediate"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="hbc-notification-banner__content">
        <p className="hbc-notification-banner__title">{notification.title}</p>
        <p className="hbc-notification-banner__body">{notification.body}</p>
      </div>

      <div className="hbc-notification-banner__actions">
        <a
          href={notification.actionUrl}
          className="hbc-button hbc-button--sm hbc-button--primary"
          onClick={() => {
            clearTimer();
            onDismiss(notification.id);
          }}
        >
          {notification.actionLabel ?? 'View'}
        </a>
        <button
          type="button"
          className="hbc-icon-button"
          aria-label="Dismiss notification"
          onClick={handleDismiss}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

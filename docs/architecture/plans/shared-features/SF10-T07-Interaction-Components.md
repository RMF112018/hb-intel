# SF10-T07 — Interaction Components: `HbcNotificationBanner` + `HbcNotificationPreferences`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-02 (Immediate tier only for banner), D-04 (banner auto-dismiss 30s, max 1 visible, queue), D-05 (registry provides event type list for preferences), D-08 (preferences in Expert mode only)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T05 (hooks), T06 (UI patterns established), `@hbc/ui-kit`, `@hbc/complexity`

> **Doc Classification:** Canonical Normative Plan — SF10-T07 components task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement `HbcNotificationBanner` (dismissible Immediate-tier in-page alert with 30-second auto-dismiss and a single-visible-at-a-time queue) and `HbcNotificationPreferences` (event type list with per-type tier overrides and digest schedule settings, Expert mode only).

---

## 3-Line Plan

1. Implement `HbcNotificationBanner` — single-visible banner with internal queue; 30-second auto-dismiss timer; cancel timer on user interaction; dismiss callback marks the notification read.
2. Implement `HbcNotificationPreferences` — list all registered event types grouped by module (from `NotificationRegistry`); per-type tier override selector; digest day/hour pickers; push toggle; save via `useNotificationPreferences.updatePreferences`.
3. Guard banner with Standard/Expert check; guard preferences with Expert-only check; write RTL unit tests.

---

## `src/components/HbcNotificationBanner.tsx`

```typescript
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
```

---

## `src/components/HbcNotificationPreferences.tsx`

```typescript
/**
 * HbcNotificationPreferences — SF10-T07
 *
 * User-facing notification preference panel.
 *
 * D-05: Uses NotificationRegistry.getAll() to enumerate all event types.
 * D-06: Includes digest day-of-week and time-of-day pickers.
 * D-07: Push notification toggle shown only in PWA context (not SPFx).
 * D-08: Expert mode only.
 */

import React, { useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import { NotificationRegistry } from '../registry/NotificationRegistry';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationTier } from '../types/INotification';

export interface HbcNotificationPreferencesProps {
  /** Called after preferences are successfully saved */
  onSave?: () => void;
}

const TIER_OPTIONS: Array<{ value: NotificationTier; label: string }> = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'watch', label: 'Watch' },
  { value: 'digest', label: 'Digest' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Detect SPFx context to hide push toggle (D-07)
const IS_SPFx = typeof (globalThis as Record<string, unknown>)['_spPageContextInfo'] !== 'undefined';

export function HbcNotificationPreferences({ onSave }: HbcNotificationPreferencesProps) {
  const { tier } = useComplexity();
  const { preferences, isLoading, updatePreferences, isUpdating } =
    useNotificationPreferences();
  const [saved, setSaved] = useState(false);

  // D-08: Expert mode only
  if (tier !== 'expert') return null;

  if (isLoading || !preferences) {
    return <div className="hbc-preferences__loading">Loading preferences…</div>;
  }

  const allRegistrations = NotificationRegistry.getAll();

  // Group event types by module prefix
  const byModule = allRegistrations.reduce<Record<string, typeof allRegistrations>>(
    (acc, reg) => {
      const module = reg.eventType.split('.')[0] ?? 'other';
      if (!acc[module]) acc[module] = [];
      acc[module]!.push(reg);
      return acc;
    },
    {}
  );

  function handleTierOverride(eventType: string, newTier: NotificationTier) {
    updatePreferences({
      tierOverrides: { ...preferences!.tierOverrides, [eventType]: newTier },
    });
  }

  function handleSave() {
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="hbc-preferences">
      <h2 className="hbc-preferences__title">Notification Preferences</h2>

      {/* Event type tier overrides */}
      {Object.entries(byModule).map(([module, regs]) => (
        <section key={module} className="hbc-preferences__module">
          <h3 className="hbc-preferences__module-title">{module}</h3>
          {regs.map((reg) => {
            const currentTier =
              preferences.tierOverrides[reg.eventType] ?? reg.defaultTier;
            return (
              <div key={reg.eventType} className="hbc-preferences__event-row">
                <div className="hbc-preferences__event-description">
                  {reg.description}
                  {!reg.tierOverridable && (
                    <span className="hbc-preferences__locked" aria-label="Tier locked">
                      🔒
                    </span>
                  )}
                </div>
                <select
                  value={currentTier}
                  disabled={!reg.tierOverridable || isUpdating}
                  aria-label={`Notification tier for ${reg.description}`}
                  onChange={(e) =>
                    handleTierOverride(reg.eventType, e.target.value as NotificationTier)
                  }
                >
                  {TIER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </section>
      ))}

      {/* Digest schedule settings */}
      <section className="hbc-preferences__digest">
        <h3 className="hbc-preferences__module-title">Weekly Digest</h3>
        <div className="hbc-preferences__row">
          <label htmlFor="digest-day">Delivery day</label>
          <select
            id="digest-day"
            value={preferences.digestDay}
            onChange={(e) =>
              updatePreferences({ digestDay: Number(e.target.value) })
            }
          >
            {DAY_NAMES.map((day, i) => (
              <option key={day} value={i}>{day}</option>
            ))}
          </select>
        </div>
        <div className="hbc-preferences__row">
          <label htmlFor="digest-hour">Delivery time</label>
          <select
            id="digest-hour"
            value={preferences.digestHour}
            onChange={(e) =>
              updatePreferences({ digestHour: Number(e.target.value) })
            }
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Push notification toggle (D-07: PWA only) */}
      {!IS_SPFx && (
        <section className="hbc-preferences__push">
          <h3 className="hbc-preferences__module-title">Push Notifications</h3>
          <label className="hbc-toggle">
            <input
              type="checkbox"
              checked={preferences.pushEnabled}
              onChange={(e) =>
                updatePreferences({ pushEnabled: e.target.checked })
              }
            />
            <span>Enable push notifications (Immediate tier only)</span>
          </label>
        </section>
      )}

      <div className="hbc-preferences__footer">
        <button
          type="button"
          className="hbc-button hbc-button--primary"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {saved ? '✓ Saved' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
```

---

## Verification Commands

```bash
# Type-check
pnpm --filter @hbc/notification-intelligence check-types

# Run component unit tests (written in T09)
pnpm --filter @hbc/notification-intelligence test

# Confirm components are exported
node -e "
const pkg = require('./packages/notification-intelligence/dist/index.js');
['HbcNotificationBanner','HbcNotificationPreferences']
  .forEach(k => console.log(k + ':', typeof pkg[k]));
"
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T07 completed: 2026-03-10
- HbcNotificationBanner: Immediate-tier dismissible banner with 30s auto-dismiss (D-04), ARIA role="alert" (D-08)
- HbcNotificationPreferences: Expert-only registry-driven preferences panel with tier overrides, digest schedule, push toggle (D-05/D-06/D-07/D-08)
- 11 HbcNotificationBanner tests + 15 HbcNotificationPreferences tests (26 new, 66 total)
- All verification gates passed: check-types, test, build
Next: SF10-T08 (Azure Functions Backend)
-->

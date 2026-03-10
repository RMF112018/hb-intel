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

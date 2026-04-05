/**
 * TopPlaceholder — Premium utility/signal layer for the shell top region.
 *
 * Phase 15-03 — Shell re-authoring:
 * - Removed placeholder-grade text-abbreviation icon pattern
 * - True non-render when no content (no residual empty container)
 * - Premium ribbon and alert band styling via rebuilt CSS module
 */
import { useState, useCallback } from 'react';
import * as React from 'react';
import type { TopPlaceholderConfig, AlertBandItem } from './types.js';
import styles from '../shell-extension.module.css';

export interface TopPlaceholderProps {
  /** Whether this placeholder region is available in the current page */
  available: boolean;
  /** Configuration for ribbon and alert band content */
  config?: TopPlaceholderConfig;
}

const SEVERITY_CLASS: Record<string, string> = {
  info: styles.alertInfo,
  warning: styles.alertWarning,
  critical: styles.alertCritical,
};

export function TopPlaceholder({ available, config }: TopPlaceholderProps): React.JSX.Element | null {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  if (!available) {
    return null;
  }

  const ribbonItems = config?.ribbon?.items ?? [];
  const allAlerts = config?.alerts?.items ?? [];
  const visibleAlerts = allAlerts.filter(
    (alert: AlertBandItem) => !dismissedIds.has(alert.id),
  );

  const hasRibbon = ribbonItems.length > 0;
  const hasAlerts = visibleAlerts.length > 0;

  // True non-render: no content = no DOM output
  if (!hasRibbon && !hasAlerts) {
    return null;
  }

  return (
    <div
      data-hbc-shell-extension="top-placeholder"
      className={styles.topContainer}
      role="banner"
      aria-label="HB Central utility bar"
    >
      {hasRibbon ? (
        <nav
          data-hbc-shell-extension="top-ribbon"
          className={styles.ribbon}
          aria-label="Quick utilities"
        >
          {ribbonItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={styles.ribbonLink}
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}

      {hasAlerts ? (
        <div
          data-hbc-shell-extension="alert-band"
          className={styles.alertBand}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {visibleAlerts.map((alert: AlertBandItem) => (
            <div
              key={alert.id}
              className={`${styles.alertItem} ${SEVERITY_CLASS[alert.severity] ?? styles.alertInfo}`}
              data-severity={alert.severity}
            >
              <span className={styles.alertMessage}>{alert.message}</span>
              {alert.href && alert.ctaLabel ? (
                <a href={alert.href} className={styles.alertCta}>
                  {alert.ctaLabel}
                </a>
              ) : null}
              {alert.dismissible ? (
                <button
                  type="button"
                  className={styles.alertDismiss}
                  aria-label={`Dismiss ${alert.severity} alert`}
                  onClick={() => handleDismiss(alert.id)}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

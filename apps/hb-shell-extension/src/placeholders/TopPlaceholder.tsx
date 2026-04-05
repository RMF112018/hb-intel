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

/**
 * Top placeholder content for the shell extension.
 *
 * Renders into SharePoint's Top placeholder region. Contains:
 * 1. A lightweight ribbon/utility strip with concise navigation links
 * 2. An alert/announcement band with severity, dismissibility, and CTAs
 *
 * Gracefully renders nothing when the placeholder is unavailable.
 * Renders minimal structure when no content is configured.
 *
 * This is a shell-adjacent surface — premium but restrained, not editorial.
 */
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

  if (!hasRibbon && !hasAlerts) {
    return (
      <div data-hbc-shell-extension="top-placeholder" className={styles.topContainer}>
        {/* No content configured — safe empty render */}
      </div>
    );
  }

  return (
    <div
      data-hbc-shell-extension="top-placeholder"
      className={styles.topContainer}
      role="banner"
      aria-label="HB Intel top ribbon"
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
              {item.iconKey ? (
                <span aria-hidden="true" style={{ marginRight: 4 }}>
                  {item.iconKey.slice(0, 3).toUpperCase()}
                </span>
              ) : null}
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

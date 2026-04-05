/**
 * BottomPlaceholder — Premium support/status rail for the shell bottom region.
 *
 * Phase 15-03 — Shell re-authoring:
 * - Own container class (bottomContainer) instead of reusing topContainer
 * - Dedicated footer nav with footerLink styling instead of reusing ribbon
 * - True non-render when no content (no residual empty container)
 * - Premium gradient background and brand-colored top border
 */
import * as React from 'react';
import type { BottomPlaceholderConfig } from './types.js';
import styles from '../shell-extension.module.css';

export interface BottomPlaceholderProps {
  /** Whether this placeholder region is available in the current page */
  available: boolean;
  /** Configuration for footer rail and support band content */
  config?: BottomPlaceholderConfig;
}

export function BottomPlaceholder({ available, config }: BottomPlaceholderProps): React.JSX.Element | null {
  if (!available) {
    return null;
  }

  const footerLinks = config?.footerLinks ?? [];
  const supportItems = config?.supportItems ?? [];
  const operationalText = config?.operationalText;

  const hasFooter = footerLinks.length > 0;
  const hasSupport = supportItems.length > 0 || Boolean(operationalText);

  // True non-render: no content = no DOM output
  if (!hasFooter && !hasSupport) {
    return null;
  }

  return (
    <div
      data-hbc-shell-extension="bottom-placeholder"
      className={styles.bottomContainer}
      role="contentinfo"
      aria-label="HB Central footer"
    >
      {hasFooter ? (
        <nav
          data-hbc-shell-extension="footer-rail"
          className={styles.footerNav}
          aria-label="Footer utilities"
        >
          {footerLinks.map((item) => (
            <a key={item.id} href={item.href} className={styles.footerLink}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}

      {hasSupport ? (
        <div data-hbc-shell-extension="support-band" className={styles.supportBand}>
          {supportItems.map((item) => (
            <span key={item.id} className={styles.supportItem}>
              {item.href ? (
                <a href={item.href} className={styles.footerLink}>{item.label}</a>
              ) : (
                item.label
              )}
              {item.description ? (
                <span className={styles.supportDescription}>{item.description}</span>
              ) : null}
            </span>
          ))}
          {operationalText ? (
            <span className={styles.operationalText}>{operationalText}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

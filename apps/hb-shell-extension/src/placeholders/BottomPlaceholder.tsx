import * as React from 'react';
import type { BottomPlaceholderConfig } from './types.js';
import styles from '../shell-extension.module.css';

export interface BottomPlaceholderProps {
  /** Whether this placeholder region is available in the current page */
  available: boolean;
  /** Configuration for footer rail and support band content */
  config?: BottomPlaceholderConfig;
}

/**
 * Bottom placeholder content for the shell extension.
 *
 * Renders into SharePoint's Bottom placeholder region. Contains:
 * 1. A footer utility strip with concise navigation links
 * 2. A support band with help resources and operational text
 *
 * Gracefully renders nothing when the placeholder is unavailable.
 * Renders minimal structure when no content is configured.
 */
export function BottomPlaceholder({ available, config }: BottomPlaceholderProps): React.JSX.Element | null {
  if (!available) {
    return null;
  }

  const footerLinks = config?.footerLinks ?? [];
  const supportItems = config?.supportItems ?? [];
  const operationalText = config?.operationalText;

  const hasFooter = footerLinks.length > 0;
  const hasSupport = supportItems.length > 0 || Boolean(operationalText);

  if (!hasFooter && !hasSupport) {
    return (
      <div data-hbc-shell-extension="bottom-placeholder" className={styles.topContainer}>
        {/* No content configured — safe empty render */}
      </div>
    );
  }

  return (
    <div
      data-hbc-shell-extension="bottom-placeholder"
      className={styles.topContainer}
      role="contentinfo"
      aria-label="HB Intel footer rail"
    >
      {hasFooter ? (
        <nav
          data-hbc-shell-extension="footer-rail"
          className={styles.ribbon}
          aria-label="Footer utilities"
        >
          {footerLinks.map((item) => (
            <a key={item.id} href={item.href} className={styles.ribbonLink}>
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
                <a href={item.href} className={styles.ribbonLink}>{item.label}</a>
              ) : (
                item.label
              )}
              {item.description ? (
                <span className={styles.supportDescription}> — {item.description}</span>
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

/**
 * HbcOperationalSurface — Dashboard-adjacent operational data surface
 * Phase 17-03 — Shared primitive system rebuild
 *
 * Purpose-built surface for safety, project spotlight, intelligence
 * signals, and status framing. Structured, data-credible presentation
 * with severity-aware signal items and prominent featured highlights.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import * as Separator from '@radix-ui/react-separator';
import type { LucideIcon } from 'lucide-react';
import styles from './operational-surface.module.css';

export type OperationalSignalSeverity = 'default' | 'success' | 'warning' | 'danger';

const severityIconMap: Record<OperationalSignalSeverity, string> = {
  default: styles.signalIconDefault,
  success: styles.signalIconSuccess,
  warning: styles.signalIconWarning,
  danger: styles.signalIconDanger,
};

export interface OperationalFeatured {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
}

export interface OperationalSignal {
  id: string;
  title: string;
  meta?: string;
  icon?: LucideIcon;
  severity?: OperationalSignalSeverity;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface HbcOperationalSurfaceProps {
  title: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;
  featured?: OperationalFeatured;
  signals?: OperationalSignal[];
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function HbcOperationalSurface({
  title,
  icon: HeaderIcon,
  headerAction,
  featured,
  signals,
  children,
  className,
  'aria-label': ariaLabel,
}: HbcOperationalSurfaceProps): React.JSX.Element {
  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(styles.root, className)}
      data-hbc-premium="operational-surface"
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {HeaderIcon ? (
            <span className={styles.headerIcon} aria-hidden="true">
              <HeaderIcon size={16} strokeWidth={2} />
            </span>
          ) : null}
          <span>{title}</span>
        </div>
        {headerAction ? <div className={styles.headerAction}>{headerAction}</div> : null}
      </div>

      <Separator.Root className={styles.separator} decorative />

      {/* Content */}
      <div className={styles.content}>
        {/* Featured highlight */}
        {featured ? (
          <motion.div
            className={styles.featured}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className={styles.featuredHeader}>
              <span className={styles.featuredTitle}>{featured.title}</span>
              {featured.badge ? <span className={styles.featuredBadge}>{featured.badge}</span> : null}
            </div>
            {featured.description ? (
              <p className={styles.featuredDescription}>{featured.description}</p>
            ) : null}
            {featured.meta ? <div className={styles.featuredMeta}>{featured.meta}</div> : null}
          </motion.div>
        ) : null}

        {/* Signal items */}
        {signals && signals.length > 0 ? (
          <div className={styles.signals}>
            {signals.map((signal, i) => {
              const SignalIcon = signal.icon;
              const severity = signal.severity ?? 'default';
              const iconClass = severityIconMap[severity];
              const Tag = signal.href ? 'a' : 'div';
              const tagProps = signal.href
                ? { href: signal.href }
                : { role: 'button' as const, tabIndex: 0, onClick: signal.onClick };

              return (
                <React.Fragment key={signal.id}>
                  {i > 0 ? <Separator.Root className={styles.signalSeparator} decorative /> : null}
                  <Tag className={styles.signal} {...tagProps}>
                    {SignalIcon ? (
                      <span className={clsx(styles.signalIcon, iconClass)} aria-hidden="true">
                        <SignalIcon size={14} strokeWidth={2} />
                      </span>
                    ) : null}
                    <div className={styles.signalContent}>
                      <span className={styles.signalTitle}>{signal.title}</span>
                      {signal.meta ? (
                        <span className={styles.signalMeta}>{signal.meta}</span>
                      ) : null}
                    </div>
                    {signal.badge ? <span className={styles.signalBadge}>{signal.badge}</span> : null}
                  </Tag>
                </React.Fragment>
              );
            })}
          </div>
        ) : null}

        {/* Custom children */}
        {children}
      </div>
    </section>
  );
}

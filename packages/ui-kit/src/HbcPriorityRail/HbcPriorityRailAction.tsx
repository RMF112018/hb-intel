/**
 * HbcPriorityRailAction — Launcher tile (flagship) / action row (default).
 *
 * Flagship context (homepage-flagship): a premium HB-branded launcher
 * tile. Vertical stack — icon-on-top, title below. Brand-tinted filled
 * background (not a white card). One dominant click target. No
 * description, no badge, no trailing launch chip.
 *
 * Default context: stacked action row for admin preview and non-
 * homepage embeds. Horizontal layout with icon + title + optional
 * description + optional badge.
 *
 * A single component serves both contexts; the launcher-vs-row layout
 * is carried by CSS module class selectors on the surface root.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { HbcPremiumBadge } from '../HbcPremiumBadge/index.js';
import type { HbcPriorityRailActionProps, PriorityRailBadgeVariant } from './types.js';
import styles from './priority-rail.module.css';

const BADGE_MAP: Record<PriorityRailBadgeVariant, 'neutral' | 'info' | 'warning' | 'success' | 'critical'> = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
  critical: 'critical',
};

export function HbcPriorityRailAction({
  action,
  showBadge = true,
  compact = false,
  className,
}: HbcPriorityRailActionProps): React.JSX.Element {
  const IconComponent = action.icon;
  const isExternal = Boolean(action.external);
  const prefersReducedMotion = useReducedMotion();
  const linkProps = isExternal
    ? { href: action.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: action.href };

  return (
    <motion.a
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className={clsx(styles.item, compact && styles.itemCompact, className)}
      data-hbc-ui="priority-rail-action"
      data-hbc-action-external={isExternal ? 'true' : undefined}
      {...linkProps}
    >
      {IconComponent ? (
        <span className={styles.itemIcon} aria-hidden="true">
          <IconComponent size={compact ? 16 : 24} strokeWidth={2} />
        </span>
      ) : null}
      <span className={styles.itemContent}>
        <span className={styles.itemTitle}>{action.title}</span>
        {action.description && !compact ? (
          <span className={styles.itemDescription}>{action.description}</span>
        ) : null}
      </span>
      {showBadge && action.badge ? (
        <span className={styles.itemBadge}>
          <HbcPremiumBadge
            label={action.badge.label}
            status={BADGE_MAP[action.badge.variant]}
            size="sm"
          />
        </span>
      ) : null}
      {isExternal ? (
        <span className={styles.visuallyHidden}>(opens in new tab)</span>
      ) : null}
    </motion.a>
  );
}

/**
 * HbcPriorityRailAction — Quick-launch tile.
 *
 * Renders a single action as a premium branded launcher tile with one
 * dominant click target: icon frame + title. External links carry a
 * small corner cue; internal links render nothing else. No trailing
 * launch chip, no description line, no badge in the tile body — the
 * flagship homepage surface is a quick-launch grid, not a command band.
 *
 * Default (non-flagship) consumers still get description + badge via
 * the CSS layer so admin-preview and non-homepage embeds keep the
 * richer row treatment.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
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
      whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.12 }}
      className={clsx(styles.item, compact && styles.itemCompact, className)}
      data-hbc-ui="priority-rail-action"
      data-hbc-action-external={isExternal ? 'true' : undefined}
      {...linkProps}
    >
      {IconComponent ? (
        <span className={styles.itemIcon} aria-hidden="true">
          <IconComponent size={compact ? 16 : 20} strokeWidth={2} />
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
        <span className={clsx(styles.itemLaunch, styles.itemLaunchExternal)} aria-hidden="true">
          <ArrowUpRight size={12} strokeWidth={2.25} className={styles.itemExternal} />
        </span>
      ) : null}
      {isExternal ? (
        <span className={styles.visuallyHidden}>(opens in new tab)</span>
      ) : null}
    </motion.a>
  );
}

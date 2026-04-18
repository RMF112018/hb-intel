/**
 * HbcPriorityRailAction — Single action row in the priority rail.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ExternalLink } from 'lucide-react';
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
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { x: 2 }}
      transition={{ duration: 0.12 }}
    >
      <a
        className={clsx(styles.item, compact && styles.itemCompact, className)}
        data-hbc-ui="priority-rail-action"
        data-hbc-action-external={isExternal ? 'true' : undefined}
        {...linkProps}
      >
        {IconComponent ? (
          <span className={styles.itemIcon} aria-hidden="true">
            <IconComponent size={compact ? 14 : 18} strokeWidth={2} />
          </span>
        ) : null}
        <div className={styles.itemContent}>
          <span className={styles.itemTitle}>{action.title}</span>
          {action.description && !compact ? (
            <span className={styles.itemDescription}>{action.description}</span>
          ) : null}
        </div>
        {showBadge && action.badge ? (
          <span className={styles.itemBadge}>
            <HbcPremiumBadge
              label={action.badge.label}
              status={BADGE_MAP[action.badge.variant]}
              size="sm"
            />
          </span>
        ) : null}
        <span
          className={clsx(styles.itemLaunch, isExternal && styles.itemLaunchExternal)}
          aria-hidden="true"
        >
          {isExternal ? (
            <ExternalLink size={14} strokeWidth={2} className={styles.itemExternal} />
          ) : (
            <ArrowRight size={14} strokeWidth={2} className={styles.itemArrow} />
          )}
        </span>
        {isExternal ? (
          <span className={styles.visuallyHidden}>(opens in new tab)</span>
        ) : null}
      </a>
    </motion.div>
  );
}

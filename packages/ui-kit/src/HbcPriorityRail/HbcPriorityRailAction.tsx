/**
 * HbcPriorityRailAction — Single action row in the priority rail.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
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
  const linkProps = isExternal
    ? { href: action.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: action.href };

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.12 }}>
      <a
        className={clsx(styles.item, compact && styles.itemCompact, className)}
        data-hbc-ui="priority-rail-action"
        {...linkProps}
      >
        {IconComponent ? (
          <span className={styles.itemIcon} aria-hidden="true">
            <IconComponent size={compact ? 14 : 16} strokeWidth={2} />
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
        {isExternal ? (
          <ExternalLink size={12} className={styles.itemExternal} aria-label="Opens in new tab" />
        ) : (
          <ArrowRight size={12} className={styles.itemArrow} aria-hidden="true" />
        )}
      </a>
    </motion.div>
  );
}

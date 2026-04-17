/**
 * HbcPriorityRailSurface — Primary priority actions command band.
 *
 * Dense, operational command band surface for urgent actions, approvals,
 * and task queues. Supports urgency variants, layout modes, and
 * breakpoint-driven overflow.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { Briefcase } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import { priorityRailSurface } from './variants.js';
import { HbcPriorityRailAction } from './HbcPriorityRailAction.js';
import { HbcPriorityRailOverflow } from './HbcPriorityRailOverflow.js';
import type { HbcPriorityRailSurfaceProps } from './types.js';
import styles from './priority-rail.module.css';

export function HbcPriorityRailSurface({
  title = 'Priority Actions',
  urgency = 'default',
  layout = 'rail',
  items,
  overflowItems,
  overflowLabel = 'More tools',
  showBadges = true,
  className,
  'aria-label': ariaLabel,
}: HbcPriorityRailSurfaceProps): React.JSX.Element {
  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(priorityRailSurface({ urgency, layout }), className)}
      data-hbc-premium="priority-rail"
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon} aria-hidden="true">
            <Briefcase size={16} strokeWidth={2} />
          </span>
          <span>{title}</span>
        </div>
      </div>

      <Separator.Root className={styles.separator} decorative />

      <div className={styles.items} role="list">
        {items.map((action, i) => (
          <React.Fragment key={action.id}>
            {i > 0 ? <Separator.Root className={styles.itemSeparator} decorative /> : null}
            <div role="listitem">
              <HbcPriorityRailAction
                action={action}
                showBadge={showBadges}
                compact={layout === 'compact'}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      {overflowItems && overflowItems.length > 0 ? (
        <HbcPriorityRailOverflow
          items={overflowItems}
          label={overflowLabel}
          showBadges={showBadges}
        />
      ) : null}
    </section>
  );
}

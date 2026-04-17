/**
 * HbcPriorityRailEmptyState — No actions configured state.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { Briefcase } from 'lucide-react';
import { priorityRailSurface } from './variants.js';
import type { HbcPriorityRailEmptyStateProps } from './types.js';
import styles from './priority-rail.module.css';

export function HbcPriorityRailEmptyState({
  title = 'No priority actions',
  description = 'No actions are configured for this band.',
  className,
}: HbcPriorityRailEmptyStateProps): React.JSX.Element {
  return (
    <div
      className={clsx(priorityRailSurface({}), className)}
      role="status"
    >
      <div className={styles.emptyState}>
        <Briefcase size={28} className={styles.emptyStateIcon} aria-hidden="true" />
        <div className={styles.emptyStateTitle}>{title}</div>
        <div className={styles.emptyStateDescription}>{description}</div>
      </div>
    </div>
  );
}

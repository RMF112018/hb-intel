/**
 * HbcPriorityRailSkeleton — Loading placeholder.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { priorityRailSurface } from './variants.js';
import type { HbcPriorityRailSkeletonProps } from './types.js';
import styles from './priority-rail.module.css';

export function HbcPriorityRailSkeleton({
  count = 4,
  layout = 'rail',
  className,
}: HbcPriorityRailSkeletonProps): React.JSX.Element {
  return (
    <div
      className={clsx(priorityRailSurface({ layout }), className)}
      role="status"
      aria-label="Loading priority actions"
    >
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonBar} style={{ width: 28, height: 28, borderRadius: 6 }} />
        <div className={styles.skeletonBar} style={{ width: 140, height: 14 }} />
      </div>
      <div className={styles.separator} />
      <div className={styles.skeleton}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.skeletonItem}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonText}>
              <div
                className={styles.skeletonBar}
                style={{ width: `${60 + (i % 3) * 15}%`, height: 12 }}
              />
              <div className={styles.skeletonBar} style={{ width: '40%', height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

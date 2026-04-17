/**
 * HbcPriorityRailErrorState — Failed load error state.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';
import { priorityRailSurface } from './variants.js';
import type { HbcPriorityRailErrorStateProps } from './types.js';
import styles from './priority-rail.module.css';

export function HbcPriorityRailErrorState({
  title = 'Unable to load actions',
  description = 'Priority actions could not be loaded. Try again or check your connection.',
  onRetry,
  className,
}: HbcPriorityRailErrorStateProps): React.JSX.Element {
  return (
    <div
      className={clsx(priorityRailSurface({}), className)}
      role="alert"
    >
      <div className={styles.errorState}>
        <AlertCircle size={28} className={styles.errorStateIcon} aria-hidden="true" />
        <div className={styles.errorStateTitle}>{title}</div>
        <div className={styles.errorStateDescription}>{description}</div>
        {onRetry ? (
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * PublisherScrollArea — thin wrapper over `@radix-ui/react-scroll-area`.
 *
 * Provides a token-disciplined scrollbar for bounded lists (asset
 * grids, result rails, flyout bodies) so the Publisher presents a
 * coherent overflow treatment instead of falling back to the default
 * browser scrollbar. Host-safe for SPFx: no sticky chrome, no viewport
 * hijacking.
 */

import * as React from 'react';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import { clsx } from 'clsx';
import styles from './publisherScrollArea.module.css';

export interface PublisherScrollAreaProps {
  readonly children: React.ReactNode;
  readonly maxHeight?: number | string;
  readonly orientation?: 'vertical' | 'horizontal' | 'both';
  readonly className?: string;
  readonly viewportClassName?: string;
  readonly role?: string;
  readonly 'aria-label'?: string;
}

export function PublisherScrollArea({
  children,
  maxHeight,
  orientation = 'vertical',
  className,
  viewportClassName,
  role,
  'aria-label': ariaLabel,
}: PublisherScrollAreaProps): JSX.Element {
  return (
    <RadixScrollArea.Root
      className={clsx(styles.root, className)}
      style={maxHeight !== undefined ? { maxHeight } : undefined}
      type="auto"
    >
      <RadixScrollArea.Viewport
        className={clsx(styles.viewport, viewportClassName)}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
      </RadixScrollArea.Viewport>
      {(orientation === 'vertical' || orientation === 'both') && (
        <RadixScrollArea.Scrollbar
          className={clsx(styles.scrollbar, styles.scrollbarVertical)}
          orientation="vertical"
        >
          <RadixScrollArea.Thumb className={styles.thumb} />
        </RadixScrollArea.Scrollbar>
      )}
      {(orientation === 'horizontal' || orientation === 'both') && (
        <RadixScrollArea.Scrollbar
          className={clsx(styles.scrollbar, styles.scrollbarHorizontal)}
          orientation="horizontal"
        >
          <RadixScrollArea.Thumb className={styles.thumb} />
        </RadixScrollArea.Scrollbar>
      )}
      <RadixScrollArea.Corner className={styles.corner} />
    </RadixScrollArea.Root>
  );
}

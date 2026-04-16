/**
 * PublisherSeparator — thin wrapper over `@radix-ui/react-separator`.
 *
 * Preferred over ad-hoc `border-right` / `hr` for hierarchy rhythm in
 * toolbars, chip rails, meta strips, and premium composition surfaces.
 * Defaults to a decorative vertical separator matching the Publisher
 * token system.
 */

import * as React from 'react';
import * as RadixSeparator from '@radix-ui/react-separator';
import { clsx } from 'clsx';
import styles from './publisherSeparator.module.css';

export interface PublisherSeparatorProps {
  readonly orientation?: 'horizontal' | 'vertical';
  readonly decorative?: boolean;
  readonly tone?: 'default' | 'faint' | 'strong';
  readonly className?: string;
}

export function PublisherSeparator({
  orientation = 'vertical',
  decorative = true,
  tone = 'default',
  className,
}: PublisherSeparatorProps): JSX.Element {
  return (
    <RadixSeparator.Root
      orientation={orientation}
      decorative={decorative}
      className={clsx(
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        styles[`tone_${tone}` as const] ?? styles.tone_default,
        className,
      )}
    />
  );
}

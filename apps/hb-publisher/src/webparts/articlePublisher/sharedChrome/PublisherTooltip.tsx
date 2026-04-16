/**
 * PublisherTooltip — thin wrapper over `@radix-ui/react-tooltip` that
 * gives the Publisher a single, token-disciplined tooltip primitive.
 *
 * Consumers import `PublisherTooltipProvider` once near the surface
 * root (e.g., the editor toolbar) and wrap individual triggers in
 * `PublisherTooltip`. The content renders through a portal so it is
 * not clipped by overflow containers or SPFx host stacking.
 *
 * Motion is intentionally light to honor Governing Standard §6.2
 * ("lighter, faster, more restrained" inside SPFx).
 */

import * as React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './publisherTooltip.module.css';

export interface PublisherTooltipProviderProps {
  readonly children: React.ReactNode;
  readonly delayDuration?: number;
  readonly skipDelayDuration?: number;
}

export function PublisherTooltipProvider({
  children,
  delayDuration = 350,
  skipDelayDuration = 200,
}: PublisherTooltipProviderProps): JSX.Element {
  return (
    <RadixTooltip.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent
    >
      {children}
    </RadixTooltip.Provider>
  );
}

export interface PublisherTooltipProps {
  readonly label: React.ReactNode;
  readonly children: React.ReactNode;
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
  readonly align?: 'start' | 'center' | 'end';
  readonly sideOffset?: number;
}

export function PublisherTooltip({
  label,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
}: PublisherTooltipProps): JSX.Element {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={styles.content}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
        >
          {label}
          <RadixTooltip.Arrow className={styles.arrow} width={10} height={5} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

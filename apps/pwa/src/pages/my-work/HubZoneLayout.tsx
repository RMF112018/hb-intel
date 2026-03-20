/**
 * HubZoneLayout — P2-D2 adaptive three-zone layout, P2-B4 cross-device.
 *
 * Primary zone: task runway (dominant, full-width, NOT canvas-governed).
 * Secondary zone: analytics/oversight cards (12-column sub-grid).
 * Tertiary zone: utility/quick-access cards (12-column sub-grid).
 *
 * Responsive breakpoints per P2-B4:
 *   Desktop (≥1024px): 12-column grid
 *   Tablet (768–1023px): 6-column grid for secondary/tertiary
 *   Mobile (≤767px): single-column stack
 */
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_BREAKPOINT_TABLET, HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';

export interface HubZoneLayoutProps {
  primaryContent: ReactNode;
  secondaryContent?: ReactNode;
  tertiaryContent?: ReactNode;
}

const useStyles = makeStyles({
  hubGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('16px'),
    width: '100%',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('12px'),
    },
  },
  primaryZone: {
    gridColumn: '1 / -1',
    minHeight: '400px',
    [`@media (max-width: ${HBC_BREAKPOINT_TABLET}px)`]: {
      minHeight: '300px',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      minHeight: 'auto',
    },
  },
  secondaryZone: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('16px'),
    [`@media (max-width: ${HBC_BREAKPOINT_TABLET}px)`]: {
      gridTemplateColumns: 'repeat(6, 1fr)',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('12px'),
    },
  },
  tertiaryZone: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('16px'),
    [`@media (max-width: ${HBC_BREAKPOINT_TABLET}px)`]: {
      gridTemplateColumns: 'repeat(6, 1fr)',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('12px'),
    },
  },
});

export function HubZoneLayout({
  primaryContent,
  secondaryContent,
  tertiaryContent,
}: HubZoneLayoutProps): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.hubGrid}>
      <section className={styles.primaryZone} data-hub-zone="primary">
        {primaryContent}
      </section>

      {secondaryContent ? (
        <section className={styles.secondaryZone} data-hub-zone="secondary">
          {secondaryContent}
        </section>
      ) : null}

      {tertiaryContent ? (
        <section className={styles.tertiaryZone} data-hub-zone="tertiary">
          {tertiaryContent}
        </section>
      ) : null}
    </div>
  );
}

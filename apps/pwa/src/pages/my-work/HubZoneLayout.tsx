/**
 * HubZoneLayout — P2-D2 adaptive layout, P2-B4 cross-device.
 *
 * UIF-002: Master-detail two-column layout at desktop (≥1200px).
 *   Left column (7fr): task runway feed (primary zone).
 *   Right column (5fr): contextual panel — item detail when selected,
 *     otherwise analytics/utility cards (secondary + tertiary zones).
 *
 * Responsive breakpoints per P2-B4:
 *   Desktop (≥1200px): two-column master-detail grid
 *   Tablet (768–1199px): single-column stack
 *   Mobile (≤767px): single-column stack with tighter gap
 */
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';

/** Desktop breakpoint for master-detail two-column layout (UIF-002). */
const BREAKPOINT_DESKTOP = 1200;

export interface HubZoneLayoutProps {
  primaryContent: ReactNode;
  secondaryContent?: ReactNode;
  tertiaryContent?: ReactNode;
  /** When provided, replaces secondary/tertiary in the right panel (item detail). */
  detailContent?: ReactNode;
}

const useStyles = makeStyles({
  hubGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('24px'),
    width: '100%',
    [`@media (min-width: ${BREAKPOINT_DESKTOP}px)`]: {
      gridTemplateColumns: '7fr 5fr',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      ...shorthands.gap('16px'),
    },
  },
  primaryZone: {
    gridColumn: '1 / -1',
    minHeight: '400px',
    [`@media (min-width: ${BREAKPOINT_DESKTOP}px)`]: {
      gridColumn: '1 / 2',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      minHeight: 'auto',
    },
  },
  rightPanel: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('0px'),
    [`@media (min-width: ${BREAKPOINT_DESKTOP}px)`]: {
      gridColumn: '2 / 3',
      position: 'sticky' as const,
      top: '24px',
      alignSelf: 'start',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
    },
  },
  secondaryZone: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('20px'),
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('12px'),
    },
  },
  tertiaryZone: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('20px'),
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
  detailContent,
}: HubZoneLayoutProps): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.hubGrid}>
      <section className={styles.primaryZone} data-hub-zone="primary">
        {primaryContent}
      </section>

      <div className={styles.rightPanel}>
        {detailContent ?? (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

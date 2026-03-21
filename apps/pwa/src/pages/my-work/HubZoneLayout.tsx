/**
 * HubZoneLayout — P2-D2 adaptive layout, P2-B4 cross-device, UIF-015 breakpoints.
 *
 * All breakpoints use canonical HBC_BREAKPOINT_* tokens from @hbc/ui-kit.
 * No hardcoded pixel breakpoints (MB-08). No fixed pixel widths (MB-04).
 * SPFx-safe: uses percentage/flex/grid-fraction widths only.
 *
 * Responsive tiers per UIF-015:
 *   Desktop (≥1200px / HBC_BREAKPOINT_DESKTOP): full two-column 7fr 5fr
 *   Tablet  (1024–1199px / HBC_BREAKPOINT_SIDEBAR–CONTENT_MEDIUM): two-column 3fr 2fr
 *   Below tablet (768–1023px): single-column stack
 *   Mobile  (≤767px / HBC_BREAKPOINT_MOBILE): single-column, tighter gap
 *
 * UIF-002: Master-detail — selected item shows detail panel in right column,
 *   replacing secondary/tertiary zones.
 */
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  HBC_BREAKPOINT_MOBILE,
  HBC_BREAKPOINT_SIDEBAR,
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_DESKTOP,
} from '@hbc/ui-kit';

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
    // Tablet tier: two-column with narrower right panel
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px) and (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: {
      gridTemplateColumns: '3fr 2fr',
    },
    // Desktop tier: full two-column master-detail
    [`@media (min-width: ${HBC_BREAKPOINT_DESKTOP}px)`]: {
      gridTemplateColumns: '7fr 5fr',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      ...shorthands.gap('16px'),
    },
  },
  primaryZone: {
    gridColumn: '1 / -1',
    minHeight: '400px',
    // Tablet + Desktop: primary takes left column
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
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
    // Tablet: right panel present but not sticky
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      gridColumn: '2 / 3',
    },
    // Desktop: sticky right panel
    [`@media (min-width: ${HBC_BREAKPOINT_DESKTOP}px)`]: {
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
    <div className={styles.hubGrid} data-spfx-safe="true">
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

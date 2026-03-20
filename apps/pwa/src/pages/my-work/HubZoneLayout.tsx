/**
 * HubZoneLayout — P2-D2 adaptive three-zone layout.
 *
 * Primary zone: task runway (dominant, full-width, NOT canvas-governed).
 * Secondary zone: analytics/oversight cards (12-column sub-grid).
 * Tertiary zone: utility/quick-access cards (12-column sub-grid).
 *
 * Grid uses 12 columns matching CANVAS_GRID_COLUMNS for future
 * @hbc/project-canvas migration in secondary/tertiary zones.
 */
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';

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
  },
  primaryZone: {
    gridColumn: '1 / -1',
    minHeight: '400px',
  },
  secondaryZone: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('16px'),
  },
  tertiaryZone: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    ...shorthands.gap('16px'),
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

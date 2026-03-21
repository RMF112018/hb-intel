/**
 * HubTertiaryZone — P2-D2 §2: utility/quick-access zone.
 *
 * G0 — P2-F1 §2.2: Renders utility tiles via @hbc/project-canvas tile
 * registry through MyWorkCanvas. Quick action shortcuts and recent context.
 *
 * Hidden at essential tier. All roles have access per P2-D1 §5.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { heading3 } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import { MyWorkCanvas } from './tiles/index.js';

const useStyles = makeStyles({
  heading: {
    gridColumn: '1 / -1',
    ...heading3,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
    marginTop: '20px',
    marginBottom: '8px',
  },
});

export function HubTertiaryZone(): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  if (tier === 'essential') return null;

  return (
    <>
      <h3 className={styles.heading}>Quick Access</h3>
      <MyWorkCanvas tilePrefix="my-work.utility" complexityTier={tier} />
    </>
  );
}

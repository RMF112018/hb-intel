/**
 * BuyoutPostureHeader — R1: completion %, exposure, status, commands.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BuyoutSurfaceState } from '../hooks/useBuyoutSurface.js';

const STATE_LABELS: Record<BuyoutSurfaceState, string> = { working: 'Working', review: 'In Review', approved: 'Approved' };
const STATE_COLORS: Record<BuyoutSurfaceState, string> = { working: HBC_STATUS_COLORS.info, review: HBC_STATUS_COLORS.success, approved: HBC_STATUS_COLORS.completed };

const useStyles = makeStyles({
  root: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`, borderBottom: '1px solid var(--colorNeutralStroke1)', backgroundColor: 'var(--colorNeutralBackground1)' },
  infoGroup: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, flex: 1, minWidth: '200px', flexWrap: 'wrap' },
  stateBadge: { display: 'inline-flex', padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--colorNeutralBackground1)' },
  metaLabel: { color: 'var(--colorNeutralForeground3)' },
  actionsGroup: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, flexWrap: 'wrap' },
});

export interface BuyoutPostureHeaderProps {
  readonly surfaceState: BuyoutSurfaceState;
  readonly percentComplete: number;
  readonly canEdit: boolean;
  readonly onBack: () => void;
}

export function BuyoutPostureHeader({ surfaceState, percentComplete, canEdit, onBack }: BuyoutPostureHeaderProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="buyout-posture-header" className={styles.root}>
      <div className={styles.infoGroup}>
        <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>
        <Text weight="semibold" size={400}>Buyout</Text>
        <span className={styles.stateBadge} style={{ backgroundColor: STATE_COLORS[surfaceState] }}>{STATE_LABELS[surfaceState]}</span>
        <Text size={200} className={styles.metaLabel}>{percentComplete}% dollar-weighted complete</Text>
      </div>
      <div className={styles.actionsGroup}>
        {canEdit && <HbcButton variant="secondary" onClick={() => {}}>Update Status</HbcButton>}
        <HbcButton variant="secondary" onClick={() => {}}>View Savings Disposition</HbcButton>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_SPACE_SM,
  HBC_SPACE_XS,
  Text,
} from '@hbc/ui-kit';

import type { FieldSyncStatus } from '../hooks/useFieldFocusSummary.js';

const SYNC_COLORS: Record<FieldSyncStatus['state'], string> = {
  synced: '#107C10',
  syncing: '#0078D4',
  pending: '#CA5010',
  failed: '#A4262C',
};

const SYNC_LABELS: Record<FieldSyncStatus['state'], string> = {
  synced: 'Synced',
  syncing: 'Syncing...',
  pending: 'Pending',
  failed: 'Sync failed',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    borderTop: '1px solid #edebe9',
    backgroundColor: '#faf9f8',
    minHeight: '28px',
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  warningText: {
    color: '#A4262C',
    fontWeight: 600,
  },
});

export interface FieldSyncStatusBarProps {
  readonly syncStatus: FieldSyncStatus;
}

export function FieldSyncStatusBar({
  syncStatus,
}: FieldSyncStatusBarProps): ReactNode {
  const styles = useStyles();

  return (
    <div
      data-testid="field-sync-status-bar"
      data-sync-state={syncStatus.state}
      className={styles.root}
    >
      <div className={styles.statusGroup}>
        <span
          className={styles.statusDot}
          style={{ backgroundColor: SYNC_COLORS[syncStatus.state] }}
        />
        <Text size={200} weight="semibold">
          {SYNC_LABELS[syncStatus.state]}
        </Text>
        <Text size={200} style={{ color: '#605e5c' }}>
          Last sync: {syncStatus.lastSyncLabel}
        </Text>
      </div>
      <div className={styles.statusGroup}>
        {syncStatus.pendingUploads > 0 && (
          <Text size={200}>{syncStatus.pendingUploads} pending</Text>
        )}
        {syncStatus.failedUploads > 0 && (
          <Text size={200} className={styles.warningText}>
            {syncStatus.failedUploads} failed
          </Text>
        )}
      </div>
    </div>
  );
}

/**
 * HbcSyncStatusBar — generic sync status indicator bar.
 *
 * Theme-aware: uses Fluent CSS custom properties that resolve per theme.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';

import { HBC_SPACE_SM, HBC_SPACE_XS } from '../theme/grid.js';
import { HBC_STATUS_COLORS } from '../theme/tokens.js';
import { Text } from '@fluentui/react-components';
import type { HbcSyncStatusBarProps, SyncState } from '../layouts/multi-column-types.js';

const SYNC_COLORS: Record<SyncState, string> = {
  synced: HBC_STATUS_COLORS.success,
  syncing: HBC_STATUS_COLORS.info,
  pending: HBC_STATUS_COLORS.warning,
  failed: HBC_STATUS_COLORS.critical,
};

const SYNC_LABELS: Record<SyncState, string> = {
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
    borderTop: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
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
  mutedText: {
    color: 'var(--colorNeutralForeground3)',
  },
  warningText: {
    color: HBC_STATUS_COLORS.critical,
    fontWeight: 600,
  },
});

export function HbcSyncStatusBar({
  state,
  pendingCount,
  failedCount,
  lastSyncLabel,
  testId,
}: HbcSyncStatusBarProps): ReactNode {
  const styles = useStyles();

  return (
    <div
      data-testid={testId ?? 'hbc-sync-status-bar'}
      data-sync-state={state}
      className={styles.root}
    >
      <div className={styles.statusGroup}>
        <span
          className={styles.statusDot}
          style={{ backgroundColor: SYNC_COLORS[state] }}
        />
        <Text size={200} weight="semibold">{SYNC_LABELS[state]}</Text>
        <Text size={200} className={styles.mutedText}>
          Last sync: {lastSyncLabel}
        </Text>
      </div>
      <div className={styles.statusGroup}>
        {pendingCount > 0 && (
          <Text size={200}>{pendingCount} pending</Text>
        )}
        {failedCount > 0 && (
          <Text size={200} className={styles.warningText}>
            {failedCount} failed
          </Text>
        )}
      </div>
    </div>
  );
}

export type { HbcSyncStatusBarProps, SyncState } from '../layouts/multi-column-types.js';

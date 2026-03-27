/**
 * FinancialPeriodHeader — R1 region.
 *
 * Shows active period, version state, custody, freshness, primary CTA,
 * and secondary command-bar actions. Theme-aware.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcButton, HBC_SPACE_SM, HBC_SPACE_XS, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';

import type {
  FinancialPeriodInfo,
  FinancialCustodyInfo,
  FinancialFreshnessInfo,
  FinancialPrimaryAction,
} from '../hooks/useFinancialControlCenter.js';

const VERSION_STATE_COLORS: Record<string, string> = {
  Working: HBC_STATUS_COLORS.info,
  ConfirmedInternal: HBC_STATUS_COLORS.success,
  PublishedMonthly: HBC_STATUS_COLORS.completed,
  Superseded: HBC_STATUS_COLORS.neutral,
};

const VERSION_STATE_LABELS: Record<string, string> = {
  Working: 'In PM Custody',
  ConfirmedInternal: 'Confirmed Internal',
  PublishedMonthly: 'Published',
  Superseded: 'Superseded',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_MD}px`,
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  topRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  periodGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flex: 1,
    minWidth: '200px',
  },
  versionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--colorNeutralBackground1)',
  },
  custodyLabel: {
    color: 'var(--colorNeutralForeground3)',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
  },
  bottomRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
  },
  freshnessGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
    flex: 1,
  },
  freshnessItem: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
  },
  freshDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  freshnessLabel: {
    color: 'var(--colorNeutralForeground3)',
  },
});

/** Secondary actions that may appear based on version state. */
const SECONDARY_ACTIONS: Record<string, readonly { label: string; action: string }[]> = {
  Working: [
    { label: 'Refresh Snapshot', action: 'refresh-snapshot' },
    { label: 'Open History', action: 'open-history' },
  ],
  ConfirmedInternal: [
    { label: 'Return for Revision', action: 'return-for-revision' },
    { label: 'Approve', action: 'approve' },
    { label: 'Open History', action: 'open-history' },
  ],
  PublishedMonthly: [
    { label: 'Reopen', action: 'reopen' },
    { label: 'Open History', action: 'open-history' },
  ],
  Superseded: [
    { label: 'Open History', action: 'open-history' },
  ],
};

export interface FinancialPeriodHeaderProps {
  readonly period: FinancialPeriodInfo;
  readonly custody: FinancialCustodyInfo;
  readonly freshness: FinancialFreshnessInfo;
  readonly primaryAction: FinancialPrimaryAction | null;
  readonly onPrimaryAction?: () => void;
  readonly onSecondaryAction?: (action: string) => void;
}

export function FinancialPeriodHeader({
  period,
  custody,
  freshness,
  primaryAction,
  onPrimaryAction,
  onSecondaryAction,
}: FinancialPeriodHeaderProps): ReactNode {
  const styles = useStyles();
  const stateColor = VERSION_STATE_COLORS[period.versionState] ?? HBC_STATUS_COLORS.neutral;
  const stateLabel = VERSION_STATE_LABELS[period.versionState] ?? period.versionState;
  const secondaryActions = SECONDARY_ACTIONS[period.versionState] ?? [];

  return (
    <div data-testid="financial-period-header" className={styles.root}>
      {/* Top row: period + version + custody + actions */}
      <div className={styles.topRow}>
        <div className={styles.periodGroup}>
          <Text weight="semibold" size={400}>
            {period.reportingMonth}
          </Text>
          <span
            className={styles.versionBadge}
            style={{ backgroundColor: stateColor }}
          >
            V{period.versionNumber} · {stateLabel}
          </span>
          <Text size={200} className={styles.custodyLabel}>
            {custody.role}: {custody.owner}
          </Text>
        </div>
        <div className={styles.actionGroup}>
          {primaryAction && (
            <HbcButton variant="primary" onClick={onPrimaryAction}>
              {primaryAction.label}
            </HbcButton>
          )}
          {secondaryActions.map((sa) => (
            <HbcButton
              key={sa.action}
              variant="secondary"
              onClick={() => onSecondaryAction?.(sa.action)}
            >
              {sa.label}
            </HbcButton>
          ))}
        </div>
      </div>

      {/* Bottom row: freshness indicators */}
      <div className={styles.bottomRow}>
        <div className={styles.freshnessGroup}>
          <div className={styles.freshnessItem}>
            <span
              className={styles.freshDot}
              style={{ backgroundColor: freshness.budgetFresh ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.warning }}
            />
            <Text size={100} className={styles.freshnessLabel}>
              Budget snapshot: {freshness.budgetLabel}
            </Text>
          </div>
          <div className={styles.freshnessItem}>
            <span
              className={styles.freshDot}
              style={{ backgroundColor: freshness.actualsFresh ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.warning }}
            />
            <Text size={100} className={styles.freshnessLabel}>
              Actuals: {freshness.actualsLabel}
            </Text>
          </div>
          <div className={styles.freshnessItem}>
            <span
              className={styles.freshDot}
              style={{ backgroundColor: freshness.payAppFresh ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.critical }}
            />
            <Text size={100} className={styles.freshnessLabel}>
              Pay-app evidence: {freshness.payAppLabel}
            </Text>
          </div>
        </div>
        {custody.lastUpdated && (
          <Text size={100} className={styles.freshnessLabel}>
            Last update: {new Date(custody.lastUpdated).toLocaleDateString()}
          </Text>
        )}
      </div>
    </div>
  );
}

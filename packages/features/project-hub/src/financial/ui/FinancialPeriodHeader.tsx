/**
 * FinancialPeriodHeader — R1 region.
 *
 * Shows active period, version state, custody, freshness, and primary CTA.
 * Theme-aware: uses Fluent CSS custom properties.
 */

import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Text, HbcButton, HBC_SPACE_SM, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';

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

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  periodGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    flex: 1,
    minWidth: '200px',
  },
  versionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--colorNeutralBackground1)',
  },
  freshnessGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
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
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
});

export interface FinancialPeriodHeaderProps {
  readonly period: FinancialPeriodInfo;
  readonly custody: FinancialCustodyInfo;
  readonly freshness: FinancialFreshnessInfo;
  readonly primaryAction: FinancialPrimaryAction | null;
  readonly onPrimaryAction?: () => void;
}

export function FinancialPeriodHeader({
  period,
  custody,
  freshness,
  primaryAction,
  onPrimaryAction,
}: FinancialPeriodHeaderProps): ReactNode {
  const styles = useStyles();

  const stateColor = VERSION_STATE_COLORS[period.versionState] ?? HBC_STATUS_COLORS.neutral;

  return (
    <div data-testid="financial-period-header" className={styles.root}>
      <div className={styles.periodGroup}>
        <Text weight="semibold" size={300}>
          {period.reportingMonth}
        </Text>
        <span
          className={styles.versionBadge}
          style={{ backgroundColor: stateColor }}
        >
          V{period.versionNumber} · {period.versionState}
        </span>
        <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>
          {custody.role}: {custody.owner}
        </Text>
      </div>

      <div className={styles.freshnessGroup}>
        <div className={styles.freshnessItem}>
          <span
            className={styles.freshDot}
            style={{ backgroundColor: freshness.budgetFresh ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.warning }}
          />
          <Text size={100} style={{ color: 'var(--colorNeutralForeground3)' }}>
            Budget: {freshness.budgetLabel}
          </Text>
        </div>
        <div className={styles.freshnessItem}>
          <span
            className={styles.freshDot}
            style={{ backgroundColor: freshness.actualsFresh ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.warning }}
          />
          <Text size={100} style={{ color: 'var(--colorNeutralForeground3)' }}>
            Actuals: {freshness.actualsLabel}
          </Text>
        </div>
        <div className={styles.freshnessItem}>
          <span
            className={styles.freshDot}
            style={{ backgroundColor: freshness.payAppFresh ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.critical }}
          />
          <Text size={100} style={{ color: 'var(--colorNeutralForeground3)' }}>
            Pay-app: {freshness.payAppLabel}
          </Text>
        </div>
      </div>

      {primaryAction && (
        <div className={styles.actionGroup}>
          <HbcButton variant="primary" onClick={onPrimaryAction}>
            {primaryAction.label}
          </HbcButton>
        </div>
      )}
    </div>
  );
}

/**
 * ForecastVersionHeader — R1 region for Forecast Summary.
 * Shows version state, custody, compare toggle, and command actions.
 * State-aware: action set changes based on surface state.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';

import type { ForecastVersionContext } from '../hooks/useForecastSummary.js';

const STATE_COLORS: Record<string, string> = {
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
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  infoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flex: 1,
    minWidth: '200px',
    flexWrap: 'wrap',
  },
  versionBadge: {
    display: 'inline-flex',
    padding: '2px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--colorNeutralBackground1)',
  },
  custodyLabel: {
    color: 'var(--colorNeutralForeground3)',
  },
  surfaceStateBadge: {
    display: 'inline-flex',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'var(--colorNeutralBackground3)',
    color: 'var(--colorNeutralForeground2)',
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
  },
});

const SURFACE_STATE_LABELS: Record<string, string> = {
  editing: 'Editing',
  comparing: 'Compare Mode',
  reviewing: 'In Review',
  'read-only': 'Read Only',
};

export interface ForecastVersionHeaderProps {
  readonly version: ForecastVersionContext;
  readonly onBack: () => void;
  readonly onSave?: () => void;
  readonly onSubmitForReview?: () => void;
  readonly onToggleCompare?: () => void;
  readonly isCompareMode?: boolean;
  readonly isSaving?: boolean;
}

export function ForecastVersionHeader({
  version,
  onBack,
  onSave,
  onSubmitForReview,
  onToggleCompare,
  isCompareMode,
  isSaving,
}: ForecastVersionHeaderProps): ReactNode {
  const styles = useStyles();
  const stateColor = STATE_COLORS[version.versionState] ?? HBC_STATUS_COLORS.neutral;

  return (
    <div data-testid="forecast-version-header" className={styles.root}>
      <div className={styles.infoGroup}>
        <HbcButton variant="secondary" onClick={onBack}>
          Back
        </HbcButton>
        <Text weight="semibold" size={400}>Forecast Summary</Text>
        <Text size={200}>{version.reportingMonth}</Text>
        <span className={styles.versionBadge} style={{ backgroundColor: stateColor }}>
          V{version.versionNumber} · {version.versionState}
        </span>
        <Text size={200} className={styles.custodyLabel}>
          {version.custodyRole}: {version.custodyOwner}
        </Text>
        <span className={styles.surfaceStateBadge}>
          {SURFACE_STATE_LABELS[version.surfaceState] ?? version.surfaceState}
        </span>
      </div>
      <div className={styles.actionsGroup}>
        {onToggleCompare && (
          <HbcButton
            variant={isCompareMode ? 'primary' : 'secondary'}
            onClick={onToggleCompare}
          >
            {isCompareMode ? 'Exit Compare' : 'Compare to Prior'}
          </HbcButton>
        )}
        {onSave && (
          <HbcButton variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </HbcButton>
        )}
        {onSubmitForReview && (
          <HbcButton variant="secondary" onClick={onSubmitForReview}>
            Submit for Review
          </HbcButton>
        )}
      </div>
    </div>
  );
}

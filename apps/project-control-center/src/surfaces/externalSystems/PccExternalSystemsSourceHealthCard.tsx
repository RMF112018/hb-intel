import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadHealthRow,
  IPccLaunchPadSourceHealthGroup,
  IPccLaunchPadSourceHealthViewModel,
  PccLaunchPadHealthSeverity,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const SEVERITY_TONES: Readonly<Record<PccLaunchPadHealthSeverity, PccStatusPillTone>> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
};

const SEVERITY_LABELS: Readonly<Record<PccLaunchPadHealthSeverity, string>> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

export interface PccExternalSystemsSourceHealthCardProps {
  readonly sourceHealth: IPccLaunchPadSourceHealthViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

export const PccExternalSystemsSourceHealthCard: FC<PccExternalSystemsSourceHealthCardProps> = ({
  sourceHealth,
  cardState,
  isAvailable,
}) => (
  <PccDashboardCard
    footprint="full"
    tier="tier3"
    region="reference"
    eyebrow="Source health"
    title="External source health"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="source-health"
    >
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : sourceHealth.totalSnapshots === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.healthGroupList} data-pcc-launch-pad-health-groups="">
          {sourceHealth.groups.map((group) =>
            group.rows.length === 0 ? null : (
              <HealthGroupSection key={group.severity} group={group} />
            ),
          )}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface HealthGroupSectionProps {
  readonly group: IPccLaunchPadSourceHealthGroup;
}

const HealthGroupSection: FC<HealthGroupSectionProps> = ({ group }) => (
  <li className={styles.healthGroup} data-pcc-launch-pad-health-group={group.severity}>
    <h4 className={styles.healthGroupTitle}>
      <PccStatusPill tone={SEVERITY_TONES[group.severity]}>
        {SEVERITY_LABELS[group.severity]} ({group.rows.length})
      </PccStatusPill>
    </h4>
    <ul className={styles.healthRowList} data-pcc-launch-pad-health-rows={group.severity}>
      {group.rows.map((row) => (
        <HealthRow key={row.healthSnapshotId} row={row} />
      ))}
    </ul>
  </li>
);

interface HealthRowProps {
  readonly row: IPccLaunchPadHealthRow;
}

const HealthRow: FC<HealthRowProps> = ({ row }) => (
  <li
    className={styles.healthRow}
    data-pcc-launch-pad-health-row={row.healthSnapshotId}
    data-pcc-launch-pad-health-state={row.healthState}
    data-pcc-launch-pad-health-system={row.systemKey}
  >
    <div className={styles.healthRowTitleRow}>
      <span className={styles.healthRowTitle}>{row.systemDisplayName}</span>
      <PccStatusPill tone={SEVERITY_TONES[row.severity]}>{row.healthState}</PccStatusPill>
    </div>
    <p className={styles.healthRowMessage}>{row.statusMessage}</p>
    {row.recommendedAction !== null ? (
      <p
        className={styles.healthRowRecommendedAction}
        data-pcc-launch-pad-health-recommended-action={row.healthSnapshotId}
      >
        Recommended action: {row.recommendedAction}
      </p>
    ) : null}
    <div className={styles.healthRowMetaRow}>
      <span className={styles.healthRowMetaItem}>Observed: {row.observedAtDisplay}</span>
      {row.lastSuccessfulReadDisplay !== undefined ? (
        <span className={styles.healthRowMetaItem}>
          Last successful read: {row.lastSuccessfulReadDisplay}
        </span>
      ) : null}
    </div>
  </li>
);

export default PccExternalSystemsSourceHealthCard;

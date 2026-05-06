import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { PccProjectHomeCardProps } from './shared';
import { TEAM_SNAPSHOT_PLACEHOLDER } from './teamSnapshotPlaceholder';
import styles from './PccProjectHome.module.css';

const TeamSnapshotBody: FC = () => (
  <div className={styles.avatarRow} data-pcc-team-snapshot-body="">
    {TEAM_SNAPSHOT_PLACEHOLDER.map((entry, index) => (
      <span
        key={`${entry.persona}-${index}`}
        className={styles.avatar}
        data-pcc-team-entry-persona={entry.persona}
      >
        <span className={styles.avatarInitials} aria-hidden="true">
          {entry.initials}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.avatarLabel}>{entry.displayName}</span>
          <span className={styles.avatarPersona}>{entry.persona}</span>
        </span>
      </span>
    ))}
  </div>
);

export const PccTeamSnapshotCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="rail"
    tier="tier3"
    region="rail"
    eyebrow="People"
    title="Team Snapshot"
  >
    {state === 'preview' ? <TeamSnapshotBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccTeamSnapshotCard;

import type { FC } from 'react';
import type { ExternalSystemPostureKind } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadRegistryGroup,
  IPccLaunchPadRegistryRow,
  IPccLaunchPadRegistryViewModel,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const POSTURE_LABELS: Readonly<Record<ExternalSystemPostureKind, string>> = {
  'mvp-required': 'MVP required',
  'mvp-optional': 'MVP optional',
  conditional: 'Conditional',
  'project-configurable': 'Project configurable',
  'project-configurable-approval-gated': 'Project configurable · approval gated',
};

const POSTURE_TONES: Readonly<Record<ExternalSystemPostureKind, PccStatusPillTone>> = {
  'mvp-required': 'success',
  'mvp-optional': 'info',
  conditional: 'neutral',
  'project-configurable': 'info',
  'project-configurable-approval-gated': 'warning',
};

export interface PccExternalSystemsRegistryCardProps {
  readonly registry: IPccLaunchPadRegistryViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

export const PccExternalSystemsRegistryCard: FC<PccExternalSystemsRegistryCardProps> = ({
  registry,
  cardState,
  isAvailable,
}) => (
  <PccDashboardCard footprint="full" eyebrow="Registry" title="External system registry">
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="registry"
    >
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : registry.totalSystems === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.registryGroupList} data-pcc-launch-pad-registry-groups="">
          {registry.groups.map((group) =>
            group.rows.length === 0 ? null : (
              <RegistryGroupSection key={group.posture} group={group} />
            ),
          )}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface RegistryGroupSectionProps {
  readonly group: IPccLaunchPadRegistryGroup;
}

const RegistryGroupSection: FC<RegistryGroupSectionProps> = ({ group }) => (
  <li className={styles.registryGroup} data-pcc-launch-pad-registry-group={group.posture}>
    <h4 className={styles.registryGroupTitle}>
      <PccStatusPill tone={POSTURE_TONES[group.posture]}>
        {POSTURE_LABELS[group.posture]} ({group.rows.length})
      </PccStatusPill>
    </h4>
    <ul className={styles.registryRowList} data-pcc-launch-pad-registry-rows={group.posture}>
      {group.rows.map((row) => (
        <RegistryRow key={row.systemKey} row={row} />
      ))}
    </ul>
  </li>
);

interface RegistryRowProps {
  readonly row: IPccLaunchPadRegistryRow;
}

const RegistryRow: FC<RegistryRowProps> = ({ row }) => (
  <li
    className={styles.registryRow}
    data-pcc-launch-pad-registry-row={row.systemKey}
    data-pcc-launch-pad-registry-active={row.activeState}
    data-pcc-launch-pad-registry-mvp-mode={row.mvpMode}
    data-pcc-launch-pad-registry-live-read={row.liveReadPosture}
  >
    <div className={styles.registryRowTitleRow}>
      <span className={styles.registryRowTitle}>{row.displayName}</span>
      <span className={styles.registryRowCategory}>{row.category}</span>
    </div>
    <div className={styles.registryRowMetaRow}>
      <span className={styles.registryRowMetaItem}>MVP mode: {row.mvpMode}</span>
      <span className={styles.registryRowMetaItem}>Live read: {row.liveReadPosture}</span>
      <span className={styles.registryRowMetaItem}>Writeback: {row.writebackPolicy}</span>
      {row.activeState === 'launch-only-inactive' ? (
        <PccStatusPill tone="neutral">Launch-only · live read inactive</PccStatusPill>
      ) : (
        <PccStatusPill tone="success">Active</PccStatusPill>
      )}
    </div>
    <div className={styles.registryRowMetaRow}>
      <span className={styles.registryRowMetaItem}>Owner: {row.recordOwner}</span>
    </div>
  </li>
);

export default PccExternalSystemsRegistryCard;

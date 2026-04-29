import type { FC } from 'react';
import { SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

function severityToneFor(severity: string): 'danger' | 'warning' | 'info' | 'neutral' {
  switch (severity) {
    case 'Blocking':
    case 'Security Risk':
    case 'Repair Required':
      return 'danger';
    case 'Warning':
      return 'warning';
    case 'Info':
      return 'info';
    default:
      return 'neutral';
  }
}

const MissingConfigurationsBody: FC = () => (
  <ul className={styles.list} data-pcc-missing-configurations-body="">
    {SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.map((config) => (
      <li
        key={config.systemId}
        className={styles.listRow}
        data-pcc-missing-config-system={config.systemId}
        data-pcc-missing-config-severity={config.severity}
      >
        <div className={styles.listRowMain}>
          <span className={styles.listRowTitle}>{config.systemId}</span>
          <span className={styles.listRowSummary}>{config.message}</span>
          <span className={styles.listRowMeta}>
            <span>Owner: {config.ownerPersona}</span>
            <span className={styles.listRowMetaSep}>
              Required before: {config.requiredBefore}
            </span>
          </span>
        </div>
        <PccStatusPill tone={severityToneFor(config.severity)} filled>
          {config.severity}
        </PccStatusPill>
      </li>
    ))}
  </ul>
);

export const PccMissingConfigurationsCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard footprint="compact" eyebrow="Setup" title="Missing Configurations">
    {state === 'preview' ? <MissingConfigurationsBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccMissingConfigurationsCard;

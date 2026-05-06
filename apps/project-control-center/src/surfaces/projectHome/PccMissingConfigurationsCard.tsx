import type { FC } from 'react';
import {
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  type IExternalSystemMissingConfig,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

interface PccMissingConfigurationsCardProps extends PccProjectHomeCardProps {
  /** Optional read-model data; when omitted, falls back to SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS. */
  readonly missingConfigurations?: readonly IExternalSystemMissingConfig[];
}

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

const MissingConfigurationsBody: FC<{
  missingConfigurations: readonly IExternalSystemMissingConfig[];
}> = ({ missingConfigurations }) => (
  <ul className={styles.list} data-pcc-missing-configurations-body="">
    {missingConfigurations.map((config) => (
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
            <span className={styles.listRowMetaSep}>Required before: {config.requiredBefore}</span>
          </span>
        </div>
        <PccStatusPill tone={severityToneFor(config.severity)} filled>
          {config.severity}
        </PccStatusPill>
      </li>
    ))}
  </ul>
);

export const PccMissingConfigurationsCard: FC<PccMissingConfigurationsCardProps> = ({
  state = 'preview',
  missingConfigurations,
}) => (
  <PccDashboardCard
    footprint="standard"
    tier="state"
    region="state"
    eyebrow="Setup"
    title="Missing Configurations"
  >
    {state === 'preview' ? (
      <MissingConfigurationsBody
        missingConfigurations={missingConfigurations ?? SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS}
      />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccMissingConfigurationsCard;

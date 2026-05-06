import type { FC } from 'react';
import { SAMPLE_DRIFT_INDICATORS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccSiteHealthSurface.module.css';

const DriftBody: FC = () => {
  if (SAMPLE_DRIFT_INDICATORS.length === 0) {
    return <PccPreviewState state="unavailable-fixture" />;
  }
  return (
    <ul className={styles.list} data-pcc-site-health-drift-body="">
      {SAMPLE_DRIFT_INDICATORS.map((indicator) => (
        <li
          key={indicator.key}
          className={styles.listRow}
          data-pcc-drift-key={indicator.key}
          data-pcc-site-health-severity={indicator.severity}
        >
          <span className={styles.rowTitle}>{indicator.key}</span>
          <span className={styles.rowMeta}>
            <PccStatusPill tone="warning">{indicator.severity}</PccStatusPill>
            {indicator.expected ? <span>expected: {indicator.expected}</span> : null}
            {indicator.actual ? <span>actual: {indicator.actual}</span> : null}
          </span>
          {indicator.detail ? <span className={styles.rowDetail}>{indicator.detail}</span> : null}
        </li>
      ))}
    </ul>
  );
};

export const PccSiteHealthDriftCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Drift"
    title="Drift Indicators"
  >
    {state === 'preview' ? <DriftBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccSiteHealthDriftCard;

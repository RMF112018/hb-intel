import type { FC } from 'react';
import { SAMPLE_SITE_HEALTH_CHECKS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccSiteHealthSurface.module.css';

const ChecksBody: FC = () => (
  <ul className={styles.list} data-pcc-site-health-checks-body="">
    {SAMPLE_SITE_HEALTH_CHECKS.map((check) => (
      <li
        key={check.id}
        className={styles.listRow}
        data-pcc-site-health-check-id={check.id}
        data-pcc-site-health-check-state={check.state}
        data-pcc-site-health-severity={check.severity}
      >
        <span className={styles.rowTitle}>{check.title}</span>
        <span className={styles.rowMeta}>
          <PccStatusPill tone={check.state === 'pass' ? 'success' : check.state === 'warning' ? 'warning' : check.state === 'fail' ? 'danger' : 'neutral'}>
            {check.state}
          </PccStatusPill>
          <span>severity: {check.severity}</span>
          {check.repairAvailable ? <span>repair available</span> : null}
        </span>
        {check.detail ? <span className={styles.rowDetail}>{check.detail}</span> : null}
      </li>
    ))}
  </ul>
);

export const PccSiteHealthChecksCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard footprint="wide" eyebrow="Checks" title="Site Health Checks">
    {state === 'preview' ? <ChecksBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccSiteHealthChecksCard;

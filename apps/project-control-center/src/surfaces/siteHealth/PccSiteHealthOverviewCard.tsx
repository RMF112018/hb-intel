import type { FC } from 'react';
import { PCC_MVP_SURFACES, SAMPLE_SITE_HEALTH_SUMMARY } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccSiteHealthSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['site-health'];

function severityTone(severity: string): 'info' | 'warning' | 'danger' | 'neutral' {
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

const OverviewBody: FC = () => {
  const summary = SAMPLE_SITE_HEALTH_SUMMARY;
  return (
    <div className={styles.body} data-pcc-site-health-overview-body="">
      <span className={styles.previewCue}>
        Site health summary. Scans and repairs are managed in SharePoint admin tooling.
      </span>
      <div className={styles.metricGrid}>
        <div className={styles.metricCell} data-pcc-site-health-overall="">
          <span className={styles.metricLabel}>Overall</span>
          <PccStatusPill tone={severityTone(summary.overallSeverity)} filled>
            {summary.overallSeverity}
          </PccStatusPill>
        </div>
        <div className={styles.metricCell} data-pcc-site-health-failing="">
          <span className={styles.metricLabel}>Failing</span>
          <span className={styles.metricValue}>{summary.failingChecks}</span>
        </div>
        <div className={styles.metricCell} data-pcc-site-health-warning="">
          <span className={styles.metricLabel}>Warnings</span>
          <span className={styles.metricValue}>{summary.warningChecks}</span>
        </div>
        <div className={styles.metricCell} data-pcc-site-health-last-run="">
          <span className={styles.metricLabel}>Last run</span>
          <span className={styles.metricValue} style={{ fontSize: 13 }}>
            {summary.lastRunUtc ?? 'Not listed'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PccSiteHealthOverviewCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="full"
    hierarchy="primary"
    eyebrow={SURFACE.displayName}
    title="Site Health"
    dataActiveSurfacePanel="site-health"
  >
    {state === 'preview' ? <OverviewBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccSiteHealthOverviewCard;

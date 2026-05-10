import type { FC } from 'react';
import { SAMPLE_SITE_HEALTH_SUMMARY, type ISiteHealthSummary } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccProjectHomeGatewayAction } from './PccProjectHomeGatewayAction';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

interface PccSiteHealthSummaryCardProps extends PccProjectHomeCardProps {
  /** Optional read-model data; when omitted, falls back to SAMPLE_SITE_HEALTH_SUMMARY. */
  readonly summary?: ISiteHealthSummary;
}

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

const SiteHealthSummaryBody: FC<{ summary: ISiteHealthSummary }> = ({ summary }) => {
  return (
    <div className={styles.healthRow} data-pcc-site-health-body="">
      <div className={styles.healthSeverity}>
        <span className={styles.metricLabel}>Overall</span>
        <PccStatusPill tone={severityTone(summary.overallSeverity)} filled>
          {summary.overallSeverity}
        </PccStatusPill>
        {summary.repairRequestAvailable ? (
          <span className={styles.contextNote}>Repair request available</span>
        ) : null}
      </div>
      <div className={styles.healthCounts}>
        <div className={styles.metricCell} data-pcc-site-health-failing="">
          <span className={styles.metricValue}>{summary.failingChecks}</span>
          <span className={styles.metricLabel}>Failing</span>
        </div>
        <div className={styles.metricCell} data-pcc-site-health-warning="">
          <span className={styles.metricValue}>{summary.warningChecks}</span>
          <span className={styles.metricLabel}>Warnings</span>
        </div>
      </div>
    </div>
  );
};

export const PccSiteHealthSummaryCard: FC<PccSiteHealthSummaryCardProps> = ({
  state = 'preview',
  summary,
  spanOverrides,
  gateway,
  onSelectModule,
}) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier2"
    region="operational"
    eyebrow="Site Health"
    title="Site Health Summary"
    spanOverrides={spanOverrides}
    action={
      gateway ? (
        <PccProjectHomeGatewayAction gateway={gateway} onSelectModule={onSelectModule} />
      ) : undefined
    }
  >
    {state === 'preview' ? (
      <SiteHealthSummaryBody summary={summary ?? SAMPLE_SITE_HEALTH_SUMMARY} />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccSiteHealthSummaryCard;

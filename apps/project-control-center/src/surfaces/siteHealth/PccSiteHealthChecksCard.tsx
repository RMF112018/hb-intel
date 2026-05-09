import type { FC } from 'react';
import { SAMPLE_SITE_HEALTH_CHECKS, SAMPLE_SITE_HEALTH_SUMMARY } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccSiteHealthSurface.module.css';

export type PccSiteHealthSeverityTier = 'security' | 'repair' | 'warning' | 'info' | 'other';

function severityTier(severity: string): PccSiteHealthSeverityTier {
  switch (severity) {
    case 'Blocking':
    case 'Security Risk':
      return 'security';
    case 'Repair Required':
      return 'repair';
    case 'Warning':
      return 'warning';
    case 'Info':
      return 'info';
    default:
      return 'other';
  }
}

// Wave 15A wave-b9 Prompt 4B-08 — `severityTone()` was previously local to
// the deleted `PccSiteHealthOverviewCard`. Re-introduced here to color
// the absorbed Overall severity pill in the metric summary row at the
// top of the Checks card body.
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

const ChecksBody: FC = () => {
  // Wave 15A wave-b9 Prompt 4B-08 — absorbed the four operational
  // metrics from the deleted `PccSiteHealthOverviewCard` (Overall
  // severity / Failing / Warnings / Last run). Existing semantic
  // markers (`data-pcc-site-health-overall|failing|warning|last-run`)
  // are reused so test queries continue to resolve in the new parent.
  // The Last run value is rendered exactly as before
  // (`summary.lastRunUtc ?? 'Not listed'`) — no formatter change.
  const summary = SAMPLE_SITE_HEALTH_SUMMARY;
  return (
    <div className={styles.body} data-pcc-site-health-checks-body="">
      <div className={styles.metricGrid} data-pcc-site-health-checks-metrics="">
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
      <ul className={styles.list}>
        {SAMPLE_SITE_HEALTH_CHECKS.map((check) => (
          <li
            key={check.id}
            className={styles.listRow}
            data-pcc-site-health-check-id={check.id}
            data-pcc-site-health-check-state={check.state}
            data-pcc-site-health-severity={check.severity}
            data-pcc-site-health-check-severity-tier={severityTier(check.severity)}
          >
            <span className={styles.rowTitle}>{check.title}</span>
            <span className={styles.rowMeta}>
              <PccStatusPill
                tone={
                  check.state === 'pass'
                    ? 'success'
                    : check.state === 'warning'
                      ? 'warning'
                      : check.state === 'fail'
                        ? 'danger'
                        : 'neutral'
                }
              >
                {check.state}
              </PccStatusPill>
              <span>severity: {check.severity}</span>
              {check.repairAvailable ? <span>repair available</span> : null}
            </span>
            {check.detail ? <span className={styles.rowDetail}>{check.detail}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const PccSiteHealthChecksCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Checks"
    title="Site Health Checks"
  >
    {state === 'preview' ? <ChecksBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccSiteHealthChecksCard;

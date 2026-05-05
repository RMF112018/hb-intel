import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccLaunchPadSummaryViewModel } from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

export interface PccExternalSystemsLaunchPadSummaryCardProps {
  readonly summary: IPccLaunchPadSummaryViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

export const PccExternalSystemsLaunchPadSummaryCard: FC<
  PccExternalSystemsLaunchPadSummaryCardProps
> = ({ summary, cardState, isAvailable }) => (
  <PccDashboardCard footprint="wide" eyebrow="Summary" title="Launch Pad summary">
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="summary"
    >
      {isAvailable ? (
        <ul className={styles.metricRow} data-pcc-launch-pad-summary-metrics="">
          <li>
            <PccStatusPill tone="info">Projects: {summary.totalProjects}</PccStatusPill>
          </li>
          <li>
            <PccStatusPill tone="info">Active links: {summary.activeLinks}</PccStatusPill>
          </li>
          <li>
            <PccStatusPill tone={summary.mappingsWithWarnings > 0 ? 'warning' : 'neutral'}>
              Mappings with warnings: {summary.mappingsWithWarnings}
            </PccStatusPill>
          </li>
          <li>
            <PccStatusPill tone={summary.pendingReviews > 0 ? 'warning' : 'neutral'}>
              Pending reviews: {summary.pendingReviews}
            </PccStatusPill>
          </li>
        </ul>
      ) : (
        <PccPreviewState state={cardState} />
      )}
    </div>
  </PccDashboardCard>
);

export default PccExternalSystemsLaunchPadSummaryCard;

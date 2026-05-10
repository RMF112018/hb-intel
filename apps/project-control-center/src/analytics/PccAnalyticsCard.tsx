/**
 * Phase 06 Prompt 03 — analytics card wrapper around `PccDashboardCard`.
 *
 * Returns `PccDashboardCard` as the outermost JSX so analytics cards
 * stay valid direct children of `PccBentoGrid` (no wrapper element
 * between the bento grid and the card article). Critical user-visible
 * facts (state, source, summary list, description, preview/degraded
 * explanation) render outside the chart canvas — the chart is never
 * the only source of information.
 */

import { useMemo, type FC, type ReactNode } from 'react';
import { PccDashboardCard } from '../layout/PccDashboardCard';
import type { PccCardFootprint, PccCardSpanOverrides } from '../layout/footprints';
import type { PccCardRegion, PccCardTier } from '../layout/PccDashboardCard';
import { PccEchartsCanvas } from './PccEchartsCanvas';
import { buildSampleDataExplanation, shouldDisableAnimation } from './pccAnalyticsA11y';
import { buildPccAnalyticsOption } from './pccAnalyticsOptions';
import type { PccAnalyticsViewModel } from './pccAnalyticsTypes';
import styles from './PccAnalyticsCard.module.css';

export interface PccAnalyticsCardProps {
  readonly viewModel: PccAnalyticsViewModel;
  readonly footprint?: PccCardFootprint;
  readonly tier?: PccCardTier;
  readonly region?: PccCardRegion;
  readonly spanOverrides?: PccCardSpanOverrides;
  readonly action?: ReactNode;
  readonly forceAnimationDisabled?: boolean;
}

export const PccAnalyticsCard: FC<PccAnalyticsCardProps> = ({
  viewModel,
  footprint = 'standard',
  tier = 'tier2',
  region = 'operational',
  spanOverrides,
  action,
  forceAnimationDisabled,
}) => {
  const animationDisabled = shouldDisableAnimation({ forceAnimationDisabled });
  const explanation = buildSampleDataExplanation(viewModel);

  const option = useMemo(
    () => buildPccAnalyticsOption({ viewModel, animationDisabled }),
    [viewModel, animationDisabled],
  );

  return (
    <PccDashboardCard
      footprint={footprint}
      tier={tier}
      region={region}
      eyebrow={viewModel.eyebrow}
      title={viewModel.title}
      action={action}
      spanOverrides={spanOverrides}
    >
      <div
        className={styles.body}
        data-pcc-analytics-card={viewModel.id}
        data-pcc-analytics-card-state={viewModel.state}
        data-pcc-analytics-card-sample-data={viewModel.sampleData ? 'true' : 'false'}
      >
        <p className={styles.stateRow}>
          <span className={styles.stateLabel} data-pcc-analytics-card-state-label="">
            {viewModel.stateLabel}
          </span>
          <span className={styles.sourceLabel} data-pcc-analytics-card-source-label="">
            {viewModel.sourceLabel}
          </span>
        </p>
        {explanation ? (
          <div className={styles.explanation} data-pcc-analytics-card-sample-explanation="">
            <p className={styles.explanationLabel}>{explanation.label}</p>
            <p className={styles.explanationDescription}>{explanation.description}</p>
          </div>
        ) : null}
        {viewModel.description ? (
          <p className={styles.description}>{viewModel.description}</p>
        ) : null}
        <ul className={styles.summary} data-pcc-analytics-card-summary="">
          {viewModel.summary.map((item) => (
            <li
              key={item.label}
              className={styles.summaryRow}
              data-pcc-analytics-card-summary-row=""
            >
              <span className={styles.summaryLabel}>{item.label}</span>
              <span
                className={styles.summaryValue}
                data-pcc-analytics-card-summary-tone={item.tone ?? 'neutral'}
              >
                {item.value}
              </span>
            </li>
          ))}
        </ul>
        <PccEchartsCanvas
          chartId={viewModel.id}
          state={viewModel.state}
          sampleData={viewModel.sampleData}
          option={option}
          accessibilitySummary={viewModel.accessibilitySummary}
          forceAnimationDisabled={forceAnimationDisabled}
        />
      </div>
    </PccDashboardCard>
  );
};

export default PccAnalyticsCard;

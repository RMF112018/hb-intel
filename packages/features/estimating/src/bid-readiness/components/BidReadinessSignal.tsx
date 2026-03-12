/**
 * SF18-T05 BidReadinessSignal component.
 *
 * Renders a compact coordinated signal surface for Submission Eligibility,
 * Bid Readiness Score, and Estimate Confidence using T04 hook outputs.
 *
 * @design D-SF18-T05, D-SF18-T04, D-SF18-T03, D-SF18-T02
 */
import type {
  BidReadinessDataState,
  IBidReadinessViewState,
  IHealthIndicatorCriterion,
} from '../../types/index.js';
import {
  applyCriterionVisibilityFilter,
  buildSignalTooltip,
  deriveEstimateConfidence,
  deriveSubmissionEligibility,
  formatReadinessStatus,
  type EstimateConfidenceState,
  type SubmissionEligibilityState,
} from './displayModel.js';

export type BidReadinessComplexityMode = 'Essential' | 'Standard' | 'Expert';

export interface BidReadinessSignalProps {
  readonly state: IBidReadinessViewState | null;
  readonly complexity: BidReadinessComplexityMode;
  readonly dataState?: BidReadinessDataState;
  readonly criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean;
  readonly onOpenDashboard?: () => void;
}

interface ICoordinatedSignalModel {
  readonly submissionEligibility: SubmissionEligibilityState;
  readonly bidReadinessLabel: string;
  readonly estimateConfidence: EstimateConfidenceState;
  readonly tooltip: string;
  readonly visibleCriteriaCount: number;
  readonly blockerCount: number;
}

function buildSignalModel(
  viewState: IBidReadinessViewState,
  criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean,
): ICoordinatedSignalModel {
  const visibleCriteria = applyCriterionVisibilityFilter(viewState.criteria, criterionVisibilityFilter);
  const submissionEligibility = deriveSubmissionEligibility(viewState, visibleCriteria);
  const estimateConfidence = deriveEstimateConfidence(viewState, visibleCriteria);

  return {
    submissionEligibility,
    bidReadinessLabel: `${Math.round(viewState.score)}% · ${formatReadinessStatus(viewState.status)} · ${viewState.summary.score.band}`,
    estimateConfidence,
    tooltip: buildSignalTooltip(visibleCriteria),
    visibleCriteriaCount: visibleCriteria.length,
    blockerCount: visibleCriteria.filter((entry) => entry.criterion.isBlocker && !entry.isComplete).length,
  };
}

function renderStateCopy(dataState: BidReadinessDataState): string {
  switch (dataState) {
    case 'loading':
      return 'Loading bid readiness signal...';
    case 'error':
      return 'Unable to load bid readiness signal.';
    case 'empty':
      return 'No bid readiness signal is available.';
    case 'degraded':
      return 'Bid readiness signal is degraded. Showing the best available snapshot.';
    default:
      return '';
  }
}

/**
 * Compact signal indicator for estimating readiness in T05.
 *
 * @design D-SF18-T05
 */
export function BidReadinessSignal({
  state,
  complexity,
  dataState = state ? 'success' : 'empty',
  criterionVisibilityFilter,
  onOpenDashboard,
}: BidReadinessSignalProps): JSX.Element {
  if (dataState !== 'success' && !state) {
    return (
      <section aria-label="Bid Readiness Signal" data-testid="bid-readiness-signal-state">
        <p>{renderStateCopy(dataState)}</p>
      </section>
    );
  }

  if (!state) {
    return (
      <section aria-label="Bid Readiness Signal" data-testid="bid-readiness-signal-state">
        <p>No bid readiness signal is available.</p>
      </section>
    );
  }

  const model = buildSignalModel(state, criterionVisibilityFilter);

  return (
    <section aria-label="Bid Readiness Signal" data-testid="bid-readiness-signal">
      {dataState === 'degraded' ? (
        <p role="status" data-testid="bid-readiness-signal-degraded-copy">
          {renderStateCopy('degraded')}
        </p>
      ) : null}

      <h2>Bid Readiness Signal</h2>

      <div title={model.tooltip} data-testid="bid-readiness-signal-tooltip-affordance">
        <p data-testid="signal-submission-eligibility">Submission Eligibility: {model.submissionEligibility}</p>
        <p data-testid="signal-bid-readiness-score">Bid Readiness Score: {model.bidReadinessLabel}</p>
        <p data-testid="signal-estimate-confidence">Estimate Confidence: {model.estimateConfidence}</p>
      </div>

      {complexity !== 'Essential' ? (
        <p data-testid="signal-summary">
          Visible criteria: {model.visibleCriteriaCount} · Incomplete blockers: {model.blockerCount}
        </p>
      ) : null}

      {complexity === 'Expert' ? (
        <p data-testid="signal-diagnostics">
          Diagnostics: sync={state.syncIndicator}, version={state.version.version}, rationale available via dashboard.
        </p>
      ) : null}

      {onOpenDashboard ? (
        <button type="button" onClick={onOpenDashboard} aria-label="Open bid readiness dashboard" data-testid="signal-open-dashboard">
          Why this score?
        </button>
      ) : null}
    </section>
  );
}

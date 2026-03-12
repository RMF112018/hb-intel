/**
 * SF18-T05 BidReadinessDashboard component.
 *
 * Renders deterministic grouped readiness content over T04 adapter state,
 * including coordinated-signal cards, completeness, and recommendations.
 *
 * @design D-SF18-T05, D-SF18-T04, D-SF18-T03, D-SF18-T02
 */
import type {
  BidReadinessDataState,
  IBidReadinessViewState,
  IHealthIndicatorCriterion,
  IReadinessRecommendation,
} from '../../types/index.js';
import {
  applyCriterionVisibilityFilter,
  deriveEstimateConfidence,
  deriveSubmissionEligibility,
  formatReadinessStatus,
} from './displayModel.js';
import type { BidReadinessComplexityMode } from './BidReadinessSignal.js';

export interface BidReadinessDashboardProps {
  readonly state: IBidReadinessViewState | null;
  readonly complexity: BidReadinessComplexityMode;
  readonly dataState?: BidReadinessDataState;
  readonly criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean;
  readonly recommendationVisibilityFilter?: (recommendation: IReadinessRecommendation) => boolean;
  readonly onOpenChecklist?: () => void;
}

function renderStateCopy(dataState: BidReadinessDataState): string {
  switch (dataState) {
    case 'loading':
      return 'Loading bid readiness dashboard...';
    case 'error':
      return 'Unable to load bid readiness dashboard.';
    case 'empty':
      return 'No bid readiness dashboard data is available.';
    case 'degraded':
      return 'Bid readiness dashboard is degraded. Showing best available snapshot and fallback guidance.';
    default:
      return '';
  }
}

/**
 * T05 dashboard surface for deterministic readiness visualization.
 *
 * @design D-SF18-T05
 */
export function BidReadinessDashboard({
  state,
  complexity,
  dataState = state ? 'success' : 'empty',
  criterionVisibilityFilter,
  recommendationVisibilityFilter,
  onOpenChecklist,
}: BidReadinessDashboardProps): JSX.Element {
  if (dataState !== 'success' && !state) {
    return (
      <section aria-label="Bid Readiness Dashboard" data-testid="bid-readiness-dashboard-state">
        <p>{renderStateCopy(dataState)}</p>
      </section>
    );
  }

  if (!state) {
    return (
      <section aria-label="Bid Readiness Dashboard" data-testid="bid-readiness-dashboard-state">
        <p>No bid readiness dashboard data is available.</p>
      </section>
    );
  }

  const visibleCriteria = applyCriterionVisibilityFilter(state.criteria, criterionVisibilityFilter);
  const visibleRecommendations = recommendationVisibilityFilter
    ? state.summary.recommendations.filter(recommendationVisibilityFilter)
    : state.summary.recommendations;

  const blockers = visibleCriteria.filter((entry) => entry.criterion.isBlocker && !entry.isComplete);
  const incomplete = visibleCriteria.filter((entry) => !entry.isComplete);
  const complete = visibleCriteria.filter((entry) => entry.isComplete);

  const submissionEligibility = deriveSubmissionEligibility(state, visibleCriteria);
  const estimateConfidence = deriveEstimateConfidence(state, visibleCriteria);

  return (
    <section aria-label="Bid Readiness Dashboard" data-testid="bid-readiness-dashboard">
      {dataState === 'degraded' ? (
        <p role="status" data-testid="dashboard-degraded-copy">
          {renderStateCopy('degraded')}
        </p>
      ) : null}

      <header>
        <h2>Bid Readiness Dashboard</h2>
        <p data-testid="dashboard-status-headline">
          {Math.round(state.score)}% · {formatReadinessStatus(state.status)} · {state.summary.score.band}
        </p>
        <p data-testid="dashboard-due-metadata">
          {state.daysUntilDue == null ? 'No submission date set' : `Due in ${state.daysUntilDue} day(s)`}
          {state.isOverdue ? ' · Overdue' : ''}
        </p>
      </header>

      <section aria-label="Coordinated Signals" data-testid="dashboard-coordinated-signals">
        <p data-testid="dashboard-submission-eligibility">Submission Eligibility: {submissionEligibility}</p>
        <p data-testid="dashboard-bid-readiness-score">Bid Readiness Score: {Math.round(state.score)}%</p>
        <p data-testid="dashboard-estimate-confidence">Estimate Confidence: {estimateConfidence}</p>
      </section>

      <section aria-label="Completeness" data-testid="dashboard-completeness">
        <h3>Completeness</h3>
        <p>
          Completed {state.summary.completeness.completedCount} / {state.summary.completeness.requiredCount} ({state.summary.completeness.completionPercent}%)
        </p>
      </section>

      <section aria-label="Criteria Groups" data-testid="dashboard-criteria-groups">
        <h3>Criteria</h3>
        <p data-testid="dashboard-group-counts">
          Blockers: {blockers.length} · Incomplete: {incomplete.length} · Complete: {complete.length}
        </p>

        {visibleCriteria.length === 0 ? (
          <p data-testid="dashboard-no-visible-criteria">No criteria are visible for the current policy filter.</p>
        ) : (
          <ol data-testid="dashboard-criteria-list">
            {visibleCriteria.map((entry) => (
              <li key={entry.criterion.criterionId} data-testid={`dashboard-criterion-${entry.criterion.criterionId}`}>
                {entry.criterion.label} · {entry.criterion.isBlocker ? 'blocker' : 'non-blocker'} · {entry.isComplete ? 'complete' : 'incomplete'}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-label="Recommendations" data-testid="dashboard-recommendations">
        <h3>Recommendations</h3>
        {visibleRecommendations.length === 0 ? (
          <p data-testid="dashboard-no-recommendations">No recommendations available for current policy visibility.</p>
        ) : (
          <ul>
            {visibleRecommendations.map((recommendation) => (
              <li key={recommendation.recommendationId} data-testid={`dashboard-recommendation-${recommendation.recommendationId}`}>
                {recommendation.title} · {recommendation.priority}
              </li>
            ))}
          </ul>
        )}
      </section>

      {complexity === 'Expert' ? (
        <section aria-label="Diagnostics" data-testid="dashboard-diagnostics">
          <h3>Diagnostics</h3>
          <p>
            Version {state.version.version} · Sync {state.syncIndicator} · Provenance {state.summary.governance.governanceState}
          </p>
          <p>Why this score? Review criteria weighting and source provenance in diagnostics workflows.</p>
        </section>
      ) : null}

      {onOpenChecklist ? (
        <button type="button" onClick={onOpenChecklist} data-testid="dashboard-open-checklist" aria-label="Open bid readiness checklist">
          Open Checklist
        </button>
      ) : null}
    </section>
  );
}

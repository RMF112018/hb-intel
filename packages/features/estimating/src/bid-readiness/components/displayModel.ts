/**
 * SF18-T05 display-model helpers for Bid Readiness signal and dashboard surfaces.
 *
 * Helpers in this module are pure and deterministic so T05 UI rendering remains
 * stable across refreshes, degraded states, and governance-filtered criteria.
 *
 * Depends on:
 * - D-SF18-T02 contracts/constants
 * - D-SF18-T03 summary composition outputs
 * - D-SF18-T04 hook state contracts
 *
 * @design D-SF18-T05, D-SF18-T04, D-SF18-T03, D-SF18-T02
 */
import type {
  IBidReadinessViewState,
  IHealthIndicatorCriterion,
} from '../../types/index.js';

export type SubmissionEligibilityState = 'Eligible' | 'Conditionally Eligible' | 'Ineligible';
export type EstimateConfidenceState = 'High' | 'Moderate' | 'Low';

/**
 * Deterministic blocker-first sort used by both Signal and Dashboard.
 *
 * @design D-SF18-T05
 */
export function sortCriteriaDeterministically(
  criteria: readonly IBidReadinessViewState['criteria'][number][],
): IBidReadinessViewState['criteria'] {
  return [...criteria].sort((left, right) => {
    if (left.criterion.isBlocker !== right.criterion.isBlocker) {
      return left.criterion.isBlocker ? -1 : 1;
    }
    if (left.criterion.weight !== right.criterion.weight) {
      return right.criterion.weight - left.criterion.weight;
    }
    return left.criterion.label.localeCompare(right.criterion.label);
  });
}

/**
 * Transitional eligibility label for T05 coordinated-signal display.
 *
 * T06 introduces immutable/conditional gate profiles; until that lands,
 * the eligibility label is derived from blocker and completeness status only.
 *
 * @design D-SF18-T05
 */
export function deriveSubmissionEligibility(
  state: IBidReadinessViewState,
  visibleCriteria: readonly IBidReadinessViewState['criteria'][number][],
): SubmissionEligibilityState {
  const incompleteBlockers = visibleCriteria.filter(
    (entry) => entry.criterion.isBlocker && !entry.isComplete,
  ).length;

  if (incompleteBlockers > 0) {
    return 'Ineligible';
  }

  const hasMissing = state.summary.completeness.missingCount > 0;
  if (hasMissing) {
    return 'Conditionally Eligible';
  }

  return 'Eligible';
}

/**
 * Transitional confidence label for T05 coordinated-signal display.
 *
 * Uses currently available completeness and risk metadata to avoid introducing
 * a new scoring runtime ahead of T06 model expansion.
 *
 * @design D-SF18-T05
 */
export function deriveEstimateConfidence(
  state: IBidReadinessViewState,
  visibleCriteria: readonly IBidReadinessViewState['criteria'][number][],
): EstimateConfidenceState {
  const hasLowRiskConfidence = visibleCriteria.some((entry) => entry.criterion.risk?.confidence === 'low');
  if (hasLowRiskConfidence) {
    return 'Low';
  }

  const completion = state.summary.completeness.completionPercent;

  if (completion >= 85 && state.summary.completeness.missingCount <= 1) {
    return 'High';
  }
  if (completion >= 60) {
    return 'Moderate';
  }
  return 'Low';
}

/**
 * Applies optional policy/governance criterion visibility and preserves order.
 *
 * @design D-SF18-T05
 */
export function applyCriterionVisibilityFilter(
  criteria: readonly IBidReadinessViewState['criteria'][number][],
  criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean,
): IBidReadinessViewState['criteria'] {
  if (!criterionVisibilityFilter) {
    return sortCriteriaDeterministically(criteria);
  }

  return sortCriteriaDeterministically(
    criteria.filter((entry) => criterionVisibilityFilter(entry.criterion)),
  );
}

/**
 * Converts kebab-case readiness statuses to deterministic display labels.
 *
 * @design D-SF18-T05
 */
export function formatReadinessStatus(status: string): string {
  return status
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

/**
 * Builds deterministic signal-tooltip text from top incomplete criteria.
 *
 * @design D-SF18-T05
 */
export function buildSignalTooltip(
  criteria: readonly IBidReadinessViewState['criteria'][number][],
): string {
  const topIncomplete = criteria
    .filter((entry) => !entry.isComplete)
    .slice(0, 3)
    .map((entry) => entry.criterion.label);

  if (topIncomplete.length === 0) {
    return 'All visible criteria are complete. Why this score? Open dashboard diagnostics.';
  }

  return `Top incomplete criteria: ${topIncomplete.join(', ')}. Why this score? Open dashboard diagnostics.`;
}

/**
 * SF18-T06 BidReadinessChecklist component.
 *
 * Implements estimator completion workflow with deterministic grouping,
 * blocking visibility, and degraded fallback behavior.
 *
 * @design D-SF18-T06, D-SF18-T04, D-SF18-T03, D-SF18-T02
 */
import type {
  BidReadinessDataState,
  IBidReadinessViewState,
  IHealthIndicatorCriterion,
} from '../../types/index.js';
import {
  useBidReadinessChecklist,
} from '../hooks/index.js';
import type { BidReadinessComplexityMode } from './BidReadinessSignal.js';
import { ChecklistCompletionIndicator } from './ChecklistCompletionIndicator.js';
import { ChecklistSection } from './ChecklistSection.js';

export interface BidReadinessChecklistProps {
  readonly viewState: IBidReadinessViewState | null;
  readonly dataState?: BidReadinessDataState;
  readonly complexity: BidReadinessComplexityMode;
  readonly criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean;
}

function renderStateCopy(dataState: BidReadinessDataState): string {
  switch (dataState) {
    case 'loading':
      return 'Loading bid readiness checklist...';
    case 'error':
      return 'Unable to load bid readiness checklist.';
    case 'empty':
      return 'No checklist items are available.';
    case 'degraded':
      return 'Checklist is degraded. Showing best available snapshot.';
    default:
      return '';
  }
}

export function BidReadinessChecklist({
  viewState,
  dataState = viewState ? 'success' : 'empty',
  complexity,
  criterionVisibilityFilter,
}: BidReadinessChecklistProps): JSX.Element {
  const filteredViewState = viewState
    ? {
      ...viewState,
      criteria: criterionVisibilityFilter
        ? viewState.criteria.filter((entry) => criterionVisibilityFilter(entry.criterion))
        : viewState.criteria,
    }
    : null;

  const checklist = useBidReadinessChecklist({
    viewState: filteredViewState,
    enabled: true,
  });

  if (dataState !== 'success' && !viewState) {
    return (
      <section aria-label="Bid Readiness Checklist" data-testid="bid-readiness-checklist-state">
        <p>{renderStateCopy(dataState)}</p>
      </section>
    );
  }

  return (
    <section aria-label="Bid Readiness Checklist" data-testid="bid-readiness-checklist">
      {dataState === 'degraded' ? (
        <p role="status" data-testid="checklist-degraded-copy">
          {renderStateCopy('degraded')}
        </p>
      ) : null}

      <h2>Bid Readiness Checklist</h2>
      <ChecklistCompletionIndicator
        completionPercent={checklist.completionPercent}
        blockingIncompleteCount={checklist.blockingIncompleteCount}
      />

      {complexity === 'Essential' ? (
        <ChecklistSection
          title="Blockers"
          items={checklist.grouped.blockers}
          onCompletionChange={checklist.updateCompletion}
          onRationaleChange={checklist.updateRationale}
          showWeights={false}
        />
      ) : (
        <>
          <ChecklistSection
            title="Blockers"
            items={checklist.grouped.blockers}
            onCompletionChange={checklist.updateCompletion}
            onRationaleChange={checklist.updateRationale}
            showWeights={complexity === 'Expert'}
          />
          <ChecklistSection
            title="Incomplete"
            items={checklist.grouped.incomplete}
            onCompletionChange={checklist.updateCompletion}
            onRationaleChange={checklist.updateRationale}
            showWeights={complexity === 'Expert'}
          />
          <ChecklistSection
            title="Complete"
            items={checklist.grouped.complete}
            onCompletionChange={checklist.updateCompletion}
            onRationaleChange={checklist.updateRationale}
            showWeights={complexity === 'Expert'}
          />
        </>
      )}

      <p data-testid="checklist-recompute-required">
        {checklist.recomputeRequired ? 'Readiness recomputation pending from checklist changes.' : 'Checklist is synchronized.'}
      </p>
    </section>
  );
}

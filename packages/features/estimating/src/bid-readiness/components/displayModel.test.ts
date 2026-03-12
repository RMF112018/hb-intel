import { describe, expect, it } from 'vitest';

import { mapHealthIndicatorStateToBidReadinessView, mapPursuitToHealthIndicatorItem } from '../adapters/index.js';
import {
  applyCriterionVisibilityFilter,
  buildSignalTooltip,
  deriveEstimateConfidence,
  deriveSubmissionEligibility,
  formatReadinessStatus,
} from './displayModel.js';

function createViewState() {
  return mapHealthIndicatorStateToBidReadinessView(
    mapPursuitToHealthIndicatorItem({
      pursuitId: 'p-display-model',
      costSectionsPopulated: true,
      bidBondConfirmed: true,
      addendaAcknowledged: true,
      subcontractorCoverageMet: false,
      bidDocumentsAttached: false,
      ceSignOff: true,
    }),
  );
}

describe('displayModel', () => {
  it('derives eligibility and confidence deterministically', () => {
    const state = createViewState();
    const visible = applyCriterionVisibilityFilter(state.criteria);

    expect(deriveSubmissionEligibility(state, visible)).toBe('Conditionally Eligible');
    expect(deriveEstimateConfidence(state, visible)).toBe('Moderate');
  });

  it('covers ineligible and low/high confidence branches', () => {
    const state = createViewState();
    const ineligibleCriteria = state.criteria.map((entry) => ({
      ...entry,
      isComplete: entry.criterion.isBlocker ? false : entry.isComplete,
      criterion: {
        ...entry.criterion,
        risk: { confidence: 'low' as const },
      },
    }));

    expect(deriveSubmissionEligibility(state, ineligibleCriteria)).toBe('Ineligible');
    expect(deriveEstimateConfidence(state, ineligibleCriteria)).toBe('Low');

    const highConfidenceState = {
      ...state,
      summary: {
        ...state.summary,
        completeness: {
          ...state.summary.completeness,
          completionPercent: 90,
          missingCount: 1,
        },
      },
    };
    expect(deriveEstimateConfidence(highConfidenceState, state.criteria)).toBe('High');
  });

  it('covers eligible branch when no blockers and no missing criteria', () => {
    const state = createViewState();
    const eligibleState = {
      ...state,
      summary: {
        ...state.summary,
        completeness: {
          ...state.summary.completeness,
          missingCount: 0,
        },
      },
    };
    const completeCriteria = state.criteria.map((entry) => ({
      ...entry,
      isComplete: true,
      criterion: {
        ...entry.criterion,
        isBlocker: false,
      },
    }));

    expect(deriveSubmissionEligibility(eligibleState, completeCriteria)).toBe('Eligible');
  });

  it('formats statuses and builds tooltip copy', () => {
    const state = createViewState();
    expect(formatReadinessStatus('attention-needed')).toBe('Attention Needed');
    expect(buildSignalTooltip(state.criteria)).toContain('Top incomplete criteria');

    const complete = state.criteria.map((entry) => ({ ...entry, isComplete: true }));
    expect(buildSignalTooltip(complete)).toContain('All visible criteria are complete');
  });

  it('applies visibility filter and preserves deterministic ordering', () => {
    const state = createViewState();
    const filtered = applyCriterionVisibilityFilter(
      state.criteria,
      (criterion) => criterion.criterionId !== 'ce-sign-off',
    );

    expect(filtered.length).toBe(state.criteria.length - 1);
    const firstNonBlocker = filtered.findIndex((entry) => !entry.criterion.isBlocker);
    const blockerAfter = filtered.findIndex((entry, index) => index > firstNonBlocker && entry.criterion.isBlocker);
    if (firstNonBlocker >= 0) {
      expect(blockerAfter).toBe(-1);
    }
  });
});
